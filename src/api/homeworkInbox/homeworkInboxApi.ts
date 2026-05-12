import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {
    CourseHomeworkInboxItem,
    CourseHomeworkInboxResponse,
    CourseHomeworkStatusSummary,
    CourseHomeworkSubmissionDetail,
    HomeworkStudent,
    LessonHomeworkReviewRequest,
    MarkHomeworkReadResponse,
} from "../../types/types.ts";

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
    const nested = record.items || record.content || record.data || record.attachments;
    return Array.isArray(nested) ? nested : [];
};

const normalizeStudent = (value: unknown, fallbackName = "Unknown student"): HomeworkStudent => {
    const record = asRecord(value) || {};

    return {
        id: asOptionalString(record.id || record.studentId || record.userId) || "",
        fullName: asString(record.fullName || record.studentName || record.name || fallbackName),
    };
};

const normalizeInboxItem = (value: unknown, index: number): CourseHomeworkInboxItem => {
    const record = asRecord(value) || {};

    return {
        submissionId: asOptionalString(record.submissionId || record.id) || `submission-${index}`,
        lessonId: asString(record.lessonId || ""),
        lessonName: asString(record.lessonName || ""),
        taskId: asString(record.taskId || ""),
        taskTitle: asString(record.taskTitle || record.title || ""),
        student: normalizeStudent(record.student, `Student ${index + 1}`),
        previewComment: asString(record.previewComment || record.comment || ""),
        submittedAt: asOptionalString(record.submittedAt || record.createdAt),
        unread: asBoolean(record.unread) ?? false,
        reviewed: asBoolean(record.reviewed) ?? false,
        revisionRequested: asBoolean(record.revisionRequested) ?? false,
        hasAttachments: asBoolean(record.hasAttachments) ?? extractArray(record.attachmentIds || record.attachments).length > 0,
    };
};

const normalizeInboxResponse = (value: unknown, fallbackSize: number): CourseHomeworkInboxResponse => {
    const record = asRecord(value) || {};
    const items = extractArray(record.items || record.content || record.data).map(normalizeInboxItem);

    return {
        courseId: asString(record.courseId || ""),
        courseName: asString(record.courseName || ""),
        page: asNumber(record.page) ?? 0,
        size: asNumber(record.size) ?? fallbackSize,
        totalSubmissions: asNumber(record.totalSubmissions || record.totalElements) ?? items.length,
        unreadCount: asNumber(record.unreadCount) ?? items.filter((item) => item.unread).length,
        items,
    };
};

const normalizeSubmissionDetail = (value: unknown): CourseHomeworkSubmissionDetail => {
    const record = asRecord(value) || {};
    const attachmentIds = extractArray(record.attachmentIds || record.attachments).map((item, index) => {
        const attachmentRecord = asRecord(item);
        return asOptionalString(attachmentRecord?.id || item) || `attachment-${index}`;
    });

    return {
        submissionId: asString(record.submissionId || record.id || ""),
        courseId: asString(record.courseId || ""),
        lessonId: asString(record.lessonId || ""),
        lessonName: asString(record.lessonName || ""),
        taskId: asString(record.taskId || ""),
        taskTitle: asString(record.taskTitle || ""),
        student: normalizeStudent(record.student),
        comment: asOptionalString(record.comment),
        externalUrl: asOptionalString(record.externalUrl || record.link),
        attachmentIds,
        submittedAt: asOptionalString(record.submittedAt || record.createdAt),
        reviewedAt: asOptionalString(record.reviewedAt),
        score: asNumber(record.score) ?? null,
        feedback: asOptionalString(record.feedback) ?? null,
        revisionRequested: asBoolean(record.revisionRequested) ?? false,
        unread: asBoolean(record.unread) ?? false,
    };
};

const normalizeStatusSummary = (value: unknown): CourseHomeworkStatusSummary => {
    const record = asRecord(value) || {};

    return {
        courseId: asString(record.courseId || ""),
        newCount: asNumber(record.newCount) ?? 0,
        reviewedCount: asNumber(record.reviewedCount) ?? 0,
        revisionRequestedCount: asNumber(record.revisionRequestedCount) ?? 0,
    };
};

const normalizeMarkReadResponse = (value: unknown): MarkHomeworkReadResponse => {
    const record = asRecord(value) || {};

    return {
        submissionId: asString(record.submissionId || ""),
        lastReadAt: asOptionalString(record.lastReadAt || record.readAt),
    };
};

export const getCourseHomeworkInbox = async (courseId: string, page = 0, size = 20) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/homework-inbox`, {
            params: {page, size},
        });
        return normalizeInboxResponse(data, size);
    } catch (error) {
        throw parseApiError(error, "Homework inbox yuklanmadi.");
    }
};

export const getCourseHomeworkUnreadCount = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/homework-inbox/unread-count`);
        const record = asRecord(data) || {};
        return asNumber(record.unreadCount ?? record.count) ?? 0;
    } catch (error) {
        throw parseApiError(error, "Homework unread soni yuklanmadi.");
    }
};

export const getCourseHomeworkStatusSummary = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/homework-inbox/status-summary`);
        return normalizeStatusSummary(data);
    } catch (error) {
        throw parseApiError(error, "Homework status summary yuklanmadi.");
    }
};

export const getCourseHomeworkSubmissionDetail = async (courseId: string, submissionId: string) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/homework-inbox/${submissionId}`);
        return normalizeSubmissionDetail(data);
    } catch (error) {
        throw parseApiError(error, "Homework submission detali yuklanmadi.");
    }
};

export const markCourseHomeworkAsRead = async (courseId: string, submissionId: string) => {
    try {
        const {data} = await apiClient.patch(`/courses/${courseId}/homework-inbox/${submissionId}/read`);
        return normalizeMarkReadResponse(data);
    } catch (error) {
        throw parseApiError(error, "Homework read holati yangilanmadi.");
    }
};

export const reviewCourseHomework = async (courseId: string, submissionId: string, body: LessonHomeworkReviewRequest) => {
    try {
        const {data} = await apiClient.post(`/courses/${courseId}/homework-inbox/${submissionId}/review`, body);
        return normalizeSubmissionDetail(data);
    } catch (error) {
        throw parseApiError(error, "Homework review saqlanmadi.");
    }
};
