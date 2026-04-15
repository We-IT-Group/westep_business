import apiClient from "../apiClient.ts";
import {getFileById} from "../file/filesApi.ts";
import {parseApiError} from "../../utils/apiError.ts";

type LessonDiscussionsResponse = {
    content?: unknown[];
    items?: unknown[];
    data?: unknown[];
};

type LessonTasksResponse = {
    content?: unknown[];
    items?: unknown[];
    data?: unknown[];
};

type QuizResultsResponse = {
    content?: unknown[];
    items?: unknown[];
    data?: unknown[];
};

type ReplyPayload = {
    content: string;
};

export type ReviewSubmissionPayload = {
    score: number;
    feedback: string;
    revisionRequested: boolean;
};

export type DiscussionReply = {
    id: string;
    content: string;
    author: string;
    createdAt: string;
};

export type DiscussionThread = {
    id: string;
    content: string;
    author: string;
    createdAt: string;
    replies: DiscussionReply[];
};

export type LessonTaskReview = {
    id: string;
    title: string;
    type: string;
};

export type HomeworkSubmissionReview = {
    submissionId: string;
    taskId: string;
    lessonId: string;
    lessonName: string;
    taskTitle: string;
    studentId: string;
    studentName: string;
    comment: string;
    externalUrl?: string;
    score?: number;
    feedback?: string;
    submittedAt?: string;
    reviewedAt?: string;
    attachmentIds: string[];
};

export type QuizResultSummary = {
    sessionId: string;
    taskId: string;
    lessonId: string;
    lessonName: string;
    taskTitle: string;
    studentId: string;
    studentName: string;
    status?: string;
    total?: number;
    correct?: number;
    wrong?: number;
    unanswered?: number;
    percentage?: number;
    durationMinutes?: number;
    spentSeconds?: number;
    startedAt?: string;
    endsAt?: string;
    finishedAt?: string;
};

export type QuizQuestionDetail = {
    orderIndex: number;
    questionText: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    selectedOption?: string;
    correctOption?: string;
    correct?: boolean;
};

export type QuizSessionDetail = {
    summary?: QuizResultSummary;
    questions: QuizQuestionDetail[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? value as Record<string, unknown> : null;

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

const extractArray = (value: unknown) => {
    if (Array.isArray(value)) return value;
    const record = asRecord(value);
    if (!record) return [];
    const nested = record.content || record.items || record.data;
    return Array.isArray(nested) ? nested : [];
};

const normalizeDiscussionReply = (item: unknown, index: number): DiscussionReply => {
    const record = asRecord(item) || {};
    return {
        id: asOptionalString(record.id) || `reply-${index}`,
        content: asString(record.content || record.message || record.reply || ""),
        author: asString(record.author || record.authorName || record.createdBy || "Unknown"),
        createdAt: asString(record.createdAt || record.repliedAt || ""),
    };
};

const normalizeDiscussionThread = (item: unknown, index: number): DiscussionThread => {
    const record = asRecord(item) || {};
    return {
        id: asOptionalString(record.id || record.commentId) || `comment-${index}`,
        content: asString(record.content || record.comment || record.message || ""),
        author: asString(record.author || record.authorName || record.createdBy || "Unknown"),
        createdAt: asString(record.createdAt || ""),
        replies: extractArray(record.replies).map(normalizeDiscussionReply),
    };
};

const normalizeLessonTask = (item: unknown, index: number): LessonTaskReview => {
    const record = asRecord(item) || {};
    return {
        id: asOptionalString(record.id || record.taskId) || `task-${index}`,
        title: asString(record.title || record.taskTitle || record.name || `Task ${index + 1}`),
        type: asString(record.type || record.taskType || "").toUpperCase(),
    };
};

const normalizeHomeworkSubmission = (item: unknown, index: number): HomeworkSubmissionReview => {
    const record = asRecord(item) || {};
    const attachmentIds = extractArray(record.attachmentIds || record.attachments).map((value, attachmentIndex) => {
        const attachmentRecord = asRecord(value);
        return asOptionalString(attachmentRecord?.id || value) || `attachment-${index}-${attachmentIndex}`;
    });

    return {
        submissionId: asOptionalString(record.submissionId || record.id) || `submission-${index}`,
        taskId: asString(record.taskId || ""),
        lessonId: asString(record.lessonId || ""),
        lessonName: asString(record.lessonName || ""),
        taskTitle: asString(record.taskTitle || ""),
        studentId: asString(record.studentId || ""),
        studentName: asString(record.studentName || "Unknown student"),
        comment: asString(record.comment || ""),
        externalUrl: asOptionalString(record.externalUrl),
        score: asNumber(record.score),
        feedback: asOptionalString(record.feedback),
        submittedAt: asOptionalString(record.submittedAt),
        reviewedAt: asOptionalString(record.reviewedAt),
        attachmentIds,
    };
};

const normalizeQuizResultSummary = (item: unknown, index: number): QuizResultSummary => {
    const record = asRecord(item) || {};
    return {
        sessionId: asOptionalString(record.sessionId || record.id) || `session-${index}`,
        taskId: asString(record.taskId || ""),
        lessonId: asString(record.lessonId || ""),
        lessonName: asString(record.lessonName || ""),
        taskTitle: asString(record.taskTitle || ""),
        studentId: asString(record.studentId || ""),
        studentName: asString(record.studentName || "Unknown student"),
        status: asOptionalString(record.status),
        total: asNumber(record.total),
        correct: asNumber(record.correct),
        wrong: asNumber(record.wrong),
        unanswered: asNumber(record.unanswered),
        percentage: asNumber(record.percentage),
        durationMinutes: asNumber(record.durationMinutes),
        spentSeconds: asNumber(record.spentSeconds),
        startedAt: asOptionalString(record.startedAt),
        endsAt: asOptionalString(record.endsAt),
        finishedAt: asOptionalString(record.finishedAt),
    };
};

const normalizeQuizSessionDetail = (data: unknown): QuizSessionDetail => {
    const record = asRecord(data) || {};
    const summaryRecord = asRecord(record.summary);
    const summary = summaryRecord ? normalizeQuizResultSummary(summaryRecord, 0) : undefined;
    const questions = extractArray(record.questions).map((item, index) => {
        const questionRecord = asRecord(item) || {};
        return {
            orderIndex: asNumber(questionRecord.orderIndex) ?? index + 1,
            questionText: asString(questionRecord.questionText || questionRecord.question || ""),
            optionA: asOptionalString(questionRecord.optionA),
            optionB: asOptionalString(questionRecord.optionB),
            optionC: asOptionalString(questionRecord.optionC),
            optionD: asOptionalString(questionRecord.optionD),
            selectedOption: asOptionalString(questionRecord.selectedOption),
            correctOption: asOptionalString(questionRecord.correctOption),
            correct: Boolean(questionRecord.correct),
        };
    });

    return {summary, questions};
};

export const getLessonDiscussions = async (lessonId: string) => {
    try {
        const {data} = await apiClient.get(`/lessons/${lessonId}/discussions`);
        return extractArray(data as LessonDiscussionsResponse).map(normalizeDiscussionThread);
    } catch (error) {
        throw parseApiError(error, "Discussion yuklanmadi.");
    }
};

export const createDiscussionReply = async (commentId: string, body: ReplyPayload) => {
    try {
        const {data} = await apiClient.post(`/discussions/${commentId}/replies`, body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Reply yuborilmadi.");
    }
};

export const getLessonTasksReview = async (lessonId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-tasks/lesson/${lessonId}`);
        return extractArray(data as LessonTasksResponse).map(normalizeLessonTask);
    } catch (error) {
        throw parseApiError(error, "Lesson tasklar yuklanmadi.");
    }
};

export const getHomeworkSubmissionsReview = async (taskId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-homework/tasks/${taskId}/submissions`);
        return extractArray(data).map(normalizeHomeworkSubmission);
    } catch (error) {
        throw parseApiError(error, "Homework submissionlar yuklanmadi.");
    }
};

export const reviewHomeworkSubmission = async (submissionId: string, body: ReviewSubmissionPayload) => {
    try {
        const {data} = await apiClient.post(`/lesson-homework/submissions/${submissionId}/review`, body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Homework baholab bo'lmadi.");
    }
};

export const getQuizResultsByTask = async (taskId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-tasks/quiz-results/manage/task/${taskId}`);
        return extractArray(data as QuizResultsResponse).map(normalizeQuizResultSummary);
    } catch (error) {
        throw parseApiError(error, "Quiz resultlar yuklanmadi.");
    }
};

export const getQuizSessionDetail = async (sessionId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-tasks/quiz-results/manage/${sessionId}`);
        return normalizeQuizSessionDetail(data);
    } catch (error) {
        throw parseApiError(error, "Quiz session detail yuklanmadi.");
    }
};

export const downloadAttachmentBlob = async (attachmentId: string) => {
    try {
        return await getFileById(attachmentId);
    } catch (error) {
        throw parseApiError(error, "Fayl yuklab olinmadi.");
    }
};
