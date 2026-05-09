import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
    value && typeof value === "object" ? value as UnknownRecord : null;

const asString = (value: unknown) =>
    typeof value === "string" ? value : value == null ? "" : String(value);

const asOptionalString = (value: unknown) => {
    const normalized = asString(value).trim();
    return normalized || undefined;
};

const asNumber = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
};

const asBoolean = (value: unknown) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        if (value.toLowerCase() === "true") return true;
        if (value.toLowerCase() === "false") return false;
    }
    return undefined;
};

const extractArray = (value: unknown) => {
    if (Array.isArray(value)) return value;
    const record = asRecord(value);
    if (!record) return [];
    const nested = record.items || record.content || record.data || record.messages || record.replies;
    return Array.isArray(nested) ? nested : [];
};

export type DiscussionInboxParticipant = {
    id: string;
    fullName: string;
    role: string;
};

export type DiscussionInboxThreadListItem = {
    threadId: string;
    lessonId?: string;
    lessonName?: string;
    student: DiscussionInboxParticipant;
    lastMessage: string;
    lastMessageAuthorRole?: string;
    lastMessageAt?: string;
    unread: boolean;
    unreadCount: number;
};

export type DiscussionInboxListResponse = {
    courseId: string;
    courseName: string;
    page: number;
    size: number;
    totalThreads: number;
    unreadCount: number;
    items: DiscussionInboxThreadListItem[];
};

export type DiscussionInboxMessage = {
    messageId: string;
    content: string;
    authorId?: string;
    authorName: string;
    authorRole?: string;
    createdAt?: string;
    read?: boolean;
};

export type DiscussionInboxThreadDetail = {
    threadId: string;
    courseId?: string;
    courseName?: string;
    lessonId?: string;
    lessonName?: string;
    student: DiscussionInboxParticipant;
    unread: boolean;
    unreadCount: number;
    messages: DiscussionInboxMessage[];
};

export type DiscussionInboxReplyRequest = {
    content: string;
};

const normalizeParticipant = (value: unknown, fallbackName = "Unknown student"): DiscussionInboxParticipant => {
    const record = asRecord(value) || {};

    return {
        id: asOptionalString(record.id || record.studentId || record.userId) || "",
        fullName: asString(record.fullName || record.studentName || record.authorName || record.name || fallbackName),
        role: asString(record.role || record.roleName || "STUDENT"),
    };
};

const normalizeMessage = (value: unknown, index: number): DiscussionInboxMessage => {
    const record = asRecord(value) || {};
    const author = asRecord(record.author) || asRecord(record.authorDto) || asRecord(record.user) || {};

    return {
        messageId: asOptionalString(record.messageId || record.id) || `message-${index}`,
        content: asString(record.content || record.message || record.comment || ""),
        authorId: asOptionalString(record.authorId || author.id || record.studentId),
        authorName: asString(author.fullName || record.authorName || record.author || record.createdBy || "Unknown"),
        authorRole: asOptionalString(record.authorRole || author.role || author.roleName),
        createdAt: asOptionalString(record.createdAt || record.sentAt || record.lastMessageAt),
        read: asBoolean(record.read ?? record.isRead),
    };
};

const normalizeThreadListItem = (value: unknown, index: number): DiscussionInboxThreadListItem => {
    const record = asRecord(value) || {};
    const student = normalizeParticipant(record.student, `Student ${index + 1}`);

    return {
        threadId: asOptionalString(record.threadId || record.id) || `thread-${index}`,
        lessonId: asOptionalString(record.lessonId),
        lessonName: asOptionalString(record.lessonName),
        student,
        lastMessage: asString(record.lastMessage || record.message || record.content || ""),
        lastMessageAuthorRole: asOptionalString(record.lastMessageAuthorRole || record.authorRole),
        lastMessageAt: asOptionalString(record.lastMessageAt || record.updatedAt || record.createdAt),
        unread: asBoolean(record.unread) ?? ((asNumber(record.unreadCount) ?? 0) > 0),
        unreadCount: asNumber(record.unreadCount) ?? 0,
    };
};

const normalizeInboxListResponse = (value: unknown, fallbackSize: number): DiscussionInboxListResponse => {
    const record = asRecord(value) || {};
    const items = extractArray(record.items || record.content || record.data).map(normalizeThreadListItem);

    return {
        courseId: asString(record.courseId || ""),
        courseName: asString(record.courseName || ""),
        page: asNumber(record.page) ?? 0,
        size: asNumber(record.size) ?? fallbackSize,
        totalThreads: asNumber(record.totalThreads || record.totalElements) ?? items.length,
        unreadCount: asNumber(record.unreadCount) ?? items.filter((item) => item.unread).length,
        items,
    };
};

const normalizeInboxThreadDetail = (value: unknown): DiscussionInboxThreadDetail => {
    const record = asRecord(value) || {};
    const thread = normalizeThreadListItem(record, 0);
    const detailMessages = extractArray(record.messages || record.items || record.content || record.data);

    const fallbackThreadMessage =
        detailMessages.length === 0 && (record.lastMessage || record.content || record.message)
            ? [record]
            : [];

    const messages = [...detailMessages, ...fallbackThreadMessage]
        .map(normalizeMessage)
        .sort((left, right) => new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime());

    return {
        threadId: thread.threadId,
        courseId: asOptionalString(record.courseId),
        courseName: asOptionalString(record.courseName),
        lessonId: thread.lessonId,
        lessonName: thread.lessonName,
        student: normalizeParticipant(record.student, thread.student.fullName),
        unread: asBoolean(record.unread) ?? thread.unread,
        unreadCount: asNumber(record.unreadCount) ?? thread.unreadCount,
        messages,
    };
};

const normalizeUnreadCount = (value: unknown) => {
    if (typeof value === "number") return value;
    const record = asRecord(value);
    if (!record) return 0;
    return asNumber(record.unreadCount || record.count || record.total) ?? 0;
};

export const getCourseDiscussionInbox = async (courseId: string, page = 0, size = 20) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/discussion-inbox`, {
            params: {page, size},
        });
        return normalizeInboxListResponse(data, size);
    } catch (error) {
        throw parseApiError(error, "Discussion inbox yuklanmadi.");
    }
};

export const getCourseDiscussionInboxUnreadCount = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/discussion-inbox/unread-count`);
        return normalizeUnreadCount(data);
    } catch (error) {
        throw parseApiError(error, "Unread discussion count yuklanmadi.");
    }
};

export const getCourseDiscussionThreadDetail = async (courseId: string, threadId: string) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/discussion-inbox/${threadId}`);
        return normalizeInboxThreadDetail(data);
    } catch (error) {
        throw parseApiError(error, "Discussion thread yuklanmadi.");
    }
};

export const replyCourseDiscussionThread = async (courseId: string, threadId: string, body: DiscussionInboxReplyRequest) => {
    try {
        const {data} = await apiClient.post(`/courses/${courseId}/discussion-inbox/${threadId}/reply`, body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Reply yuborilmadi.");
    }
};

export const markCourseDiscussionThreadAsRead = async (courseId: string, threadId: string) => {
    try {
        await apiClient.patch(`/courses/${courseId}/discussion-inbox/${threadId}/read`);
    } catch (error) {
        throw parseApiError(error, "Thread read holatiga o'tmadi.");
    }
};
