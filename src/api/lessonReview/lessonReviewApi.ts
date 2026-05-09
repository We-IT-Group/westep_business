import apiClient from "../apiClient.ts";
import {getFileById} from "../file/filesApi.ts";
import {parseApiError} from "../../utils/apiError.ts";

type LessonDiscussionsResponse = {
    content?: unknown[];
    items?: unknown[];
    data?: unknown[];
    page?: unknown;
    size?: unknown;
    totalElements?: unknown;
    totalPages?: unknown;
    last?: unknown;
    first?: unknown;
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

type LessonReviewsResponse = {
    content?: unknown[];
    items?: unknown[];
    data?: unknown[];
    page?: unknown;
    size?: unknown;
    totalElements?: unknown;
    totalPages?: unknown;
    last?: unknown;
    first?: unknown;
};

type ReplyPayload = {
    content: string;
};

type DiscussionUpdatePayload = {
    content: string;
};

export type CreateDiscussionRequest = {
    content: string;
};

export type UpdateDiscussionRequest = {
    content: string;
};

export type LessonHomeworkReviewRequest = {
    score: number;
    feedback: string;
    revisionRequested: boolean;
};

export type ReviewSubmissionPayload = LessonHomeworkReviewRequest;

export type DiscussionAuthorDto = {
    id?: string;
    fullName?: string;
    roleName?: string;
};

export type DiscussionReplyDto = {
    id: string;
    content: string;
    author: string;
    authorDto?: DiscussionAuthorDto;
    lessonId?: string;
    lessonName?: string;
    studentId?: string;
    authorId?: string;
    createdAt: string;
    deleted?: boolean;
};

export type DiscussionCommentDto = {
    id: string;
    content: string;
    author: string;
    authorDto?: DiscussionAuthorDto;
    lessonId?: string;
    lessonName?: string;
    studentId?: string;
    authorId?: string;
    createdAt: string;
    deleted?: boolean;
    replies: DiscussionReplyDto[];
};

export type DiscussionListResponse = {
    content: DiscussionCommentDto[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
};

export type DiscussionThread = DiscussionCommentDto;

export type LessonTaskReview = {
    id: string;
    title: string;
    type: string;
};

export type StudentHomeworkSubmitRequest = {
    comment?: string;
    link?: string;
    files?: File[];
    file?: File | null;
};

export type LessonHomeworkSubmissionResponse = {
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
    revisionRequested?: boolean;
    attachmentIds: string[];
};

export type HomeworkSubmissionReview = LessonHomeworkSubmissionResponse;

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

export type LessonQuizManagerResultSummaryResponse = QuizResultSummary;

export type LessonQuizQuestionAnswerDetail = QuizQuestionDetail;

export type LessonQuizManagerResultDetailResponse = {
    summary?: LessonQuizManagerResultSummaryResponse;
    questions: LessonQuizQuestionAnswerDetail[];
};

export type CourseQuizManagerStudentResponse = {
    studentId: string;
    studentName: string;
    attempts: LessonQuizManagerResultSummaryResponse[];
};

export type CourseQuizManagerResultResponse = {
    courseId: string;
    courseName: string;
    students: CourseQuizManagerStudentResponse[];
};

export type LessonReviewRequest = {
    comment: string;
};

export type LessonReviewResponse = {
    id: string;
    comment: string;
    createdAt: string;
    updatedAt?: string;
    deleted?: boolean;
    authorId?: string;
    authorName: string;
    roleName?: string;
    mine?: boolean;
};

export type LessonReviewListResponse = {
    content: LessonReviewResponse[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
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
    const nested = record.content || record.items || record.data;
    return Array.isArray(nested) ? nested : [];
};

const normalizePageMeta = (value: unknown, fallbackSize: number) => {
    const record = asRecord(value) || {};
    return {
        page: asNumber(record.page) ?? asNumber(record.number) ?? 0,
        size: asNumber(record.size) ?? fallbackSize,
        totalElements: asNumber(record.totalElements) ?? extractArray(value).length,
        totalPages: asNumber(record.totalPages) ?? 1,
        first: asBoolean(record.first) ?? true,
        last: asBoolean(record.last) ?? true,
    };
};

const normalizeDiscussionAuthor = (value: unknown): DiscussionAuthorDto | undefined => {
    const record = asRecord(value);
    if (!record) return undefined;

    return {
        id: asOptionalString(record.id || record.authorId || record.userId),
        fullName: asOptionalString(record.fullName || record.authorName || record.name),
        roleName: asOptionalString(record.roleName || record.role),
    };
};

const normalizeDiscussionReply = (item: unknown, index: number): DiscussionReplyDto => {
    const record = asRecord(item) || {};
    const authorDto = normalizeDiscussionAuthor(record.author || record.authorDto || record.user);
    return {
        id: asOptionalString(record.id) || `reply-${index}`,
        content: asString(record.content || record.message || record.reply || ""),
        author: asString(authorDto?.fullName || record.author || record.authorName || record.createdBy || "Unknown"),
        authorDto,
        lessonId: asOptionalString(record.lessonId),
        lessonName: asOptionalString(record.lessonName),
        studentId: asOptionalString(record.studentId || record.authorId || record.createdById),
        authorId: asOptionalString(record.authorId || record.createdById || authorDto?.id),
        createdAt: asString(record.createdAt || record.repliedAt || ""),
        deleted: asBoolean(record.deleted) ?? false,
    };
};

const normalizeDiscussionThread = (item: unknown, index: number): DiscussionThread => {
    const record = asRecord(item) || {};
    const authorDto = normalizeDiscussionAuthor(record.author || record.authorDto || record.user);
    return {
        id: asOptionalString(record.id || record.commentId) || `comment-${index}`,
        content: asString(record.content || record.comment || record.message || ""),
        author: asString(authorDto?.fullName || record.author || record.authorName || record.createdBy || "Unknown"),
        authorDto,
        lessonId: asOptionalString(record.lessonId),
        lessonName: asOptionalString(record.lessonName),
        studentId: asOptionalString(record.studentId || record.authorId || record.createdById),
        authorId: asOptionalString(record.authorId || record.createdById || authorDto?.id),
        createdAt: asString(record.createdAt || ""),
        deleted: asBoolean(record.deleted) ?? false,
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
        revisionRequested: asBoolean(record.revisionRequested),
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

const normalizeCourseQuizManagerStudent = (item: unknown, index: number): CourseQuizManagerStudentResponse => {
    const record = asRecord(item) || {};
    return {
        studentId: asString(record.studentId || ""),
        studentName: asString(record.studentName || `Student ${index + 1}`),
        attempts: extractArray(record.attempts).map(normalizeQuizResultSummary),
    };
};

const normalizeCourseQuizManagerResults = (data: unknown): CourseQuizManagerResultResponse => {
    const record = asRecord(data) || {};
    return {
        courseId: asString(record.courseId || ""),
        courseName: asString(record.courseName || ""),
        students: extractArray(record.students).map(normalizeCourseQuizManagerStudent),
    };
};

const normalizeDiscussionListResponse = (data: unknown, fallbackSize: number): DiscussionListResponse => {
    const pageMeta = normalizePageMeta(data, fallbackSize);
    return {
        ...pageMeta,
        content: extractArray(data as LessonDiscussionsResponse).map(normalizeDiscussionThread),
    };
};

const normalizeLessonReview = (item: unknown, index: number): LessonReviewResponse => {
    const record = asRecord(item) || {};
    const authorDto = normalizeDiscussionAuthor(record.author || record.authorDto || record.user);

    return {
        id: asOptionalString(record.id) || `review-${index}`,
        comment: asString(record.comment || record.content || ""),
        createdAt: asString(record.createdAt || ""),
        updatedAt: asOptionalString(record.updatedAt),
        deleted: asBoolean(record.deleted) ?? false,
        authorId: asOptionalString(record.authorId || authorDto?.id),
        authorName: asString(authorDto?.fullName || record.authorName || record.author || "Unknown"),
        roleName: asOptionalString(record.roleName || authorDto?.roleName),
        mine: asBoolean(record.mine),
    };
};

const normalizeLessonReviewListResponse = (data: unknown, fallbackSize: number): LessonReviewListResponse => {
    const pageMeta = normalizePageMeta(data, fallbackSize);
    return {
        ...pageMeta,
        content: extractArray(data as LessonReviewsResponse).map(normalizeLessonReview),
    };
};

export const getLessonDiscussionsPage = async (lessonId: string, page = 0, size = 20) => {
    try {
        const {data} = await apiClient.get(`/lessons/${lessonId}/discussions`, {
            params: {page, size},
        });
        return normalizeDiscussionListResponse(data, size);
    } catch (error) {
        throw parseApiError(error, "Discussion yuklanmadi.");
    }
};

export const getCourseDiscussionsPage = async (courseId: string, page = 0, size = 20) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/discussions`, {
            params: {page, size},
        });
        return normalizeDiscussionListResponse(data, size);
    } catch (error) {
        throw parseApiError(error, "Course discussionlar yuklanmadi.");
    }
};

export const getLessonDiscussions = async (lessonId: string) => {
    const response = await getLessonDiscussionsPage(lessonId);
    return response.content;
};

export const createLessonDiscussion = async (lessonId: string, body: CreateDiscussionRequest) => {
    try {
        const {data} = await apiClient.post(`/lessons/${lessonId}/discussions`, body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Discussion yuborilmadi.");
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

export const updateDiscussion = async (commentId: string, body: DiscussionUpdatePayload) => {
    try {
        const {data} = await apiClient.patch(`/discussions/${commentId}`, body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Muhokamani yangilab bo'lmadi.");
    }
};

export const deleteDiscussion = async (commentId: string) => {
    try {
        const {data} = await apiClient.delete(`/discussions/${commentId}`);
        return data;
    } catch (error) {
        throw parseApiError(error, "Muhokamani o'chirib bo'lmadi.");
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

export const submitHomework = async (taskId: string, body: StudentHomeworkSubmitRequest) => {
    try {
        const formData = new FormData();

        const comment = body.comment?.trim();
        const link = body.link?.trim();
        const files = body.files?.length ? body.files : body.file ? [body.file] : [];

        if (comment) {
            formData.append("comment", comment);
        }

        if (link) {
            formData.append("link", link);
        }

        files.forEach((file) => {
            formData.append("file", file);
            formData.append("files", file);
        });

        const {data} = await apiClient.post(`/lesson-homework/tasks/${taskId}/submit`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    } catch (error) {
        throw parseApiError(error, "Homework yuborilmadi.");
    }
};

export const getMyHomeworkSubmissions = async () => {
    try {
        const {data} = await apiClient.get("/lesson-homework/my-submissions");
        return extractArray(data).map(normalizeHomeworkSubmission);
    } catch (error) {
        throw parseApiError(error, "Mening homework submissionlarim yuklanmadi.");
    }
};

export const getMyHomeworkSubmissionsByLesson = async (lessonId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-homework/my-submissions/lesson/${lessonId}`);
        return extractArray(data).map(normalizeHomeworkSubmission);
    } catch (error) {
        throw parseApiError(error, "Lesson bo‘yicha homework submissionlar yuklanmadi.");
    }
};

export const getLessonReviewsPage = async (lessonId: string, page = 0, size = 10) => {
    try {
        const {data} = await apiClient.get(`/lessons/${lessonId}/reviews`, {
            params: {page, size},
        });
        return normalizeLessonReviewListResponse(data, size);
    } catch (error) {
        throw parseApiError(error, "Lesson reviewlar yuklanmadi.");
    }
};

export const createLessonReview = async (lessonId: string, body: LessonReviewRequest) => {
    try {
        const {data} = await apiClient.post(`/lessons/${lessonId}/reviews`, body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Lesson review yuborilmadi.");
    }
};

export const updateMyLessonReview = async (lessonId: string, body: LessonReviewRequest) => {
    try {
        const {data} = await apiClient.patch(`/lessons/${lessonId}/reviews/my`, body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Lesson review yangilanmadi.");
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

export const getStudentQuizResults = async () => {
    try {
        const {data} = await apiClient.get("/lesson-tasks/quiz-results");
        return extractArray(data as QuizResultsResponse).map(normalizeQuizResultSummary);
    } catch (error) {
        throw parseApiError(error, "Lesson quiz natijalari yuklanmadi.");
    }
};

export const getStudentQuizResultsByLesson = async (lessonId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-tasks/quiz-results/lesson/${lessonId}`);
        return extractArray(data as QuizResultsResponse).map(normalizeQuizResultSummary);
    } catch (error) {
        throw parseApiError(error, "Lesson bo‘yicha quiz natijalari yuklanmadi.");
    }
};

export const getStudentQuizSessionDetail = async (sessionId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-tasks/quiz-results/${sessionId}`);
        return normalizeQuizSessionDetail(data);
    } catch (error) {
        throw parseApiError(error, "Lesson quiz urinish detali yuklanmadi.");
    }
};

export const getQuizResultsByLesson = async (lessonId: string) => {
    try {
        const {data} = await apiClient.get(`/lesson-tasks/quiz-results/manage/lesson/${lessonId}`);
        return extractArray(data as QuizResultsResponse).map(normalizeQuizResultSummary);
    } catch (error) {
        throw parseApiError(error, "Lesson quiz resultlar yuklanmadi.");
    }
};

export const getQuizResultsByCourseLessons = async (lessonIds: string[]) => {
    try {
        const responses = await Promise.all(
            lessonIds.map((lessonId) => apiClient.get(`/lesson-tasks/quiz-results/manage/lesson/${lessonId}`)),
        );

        return responses.flatMap(({data}) =>
            extractArray(data as QuizResultsResponse).map(normalizeQuizResultSummary),
        );
    } catch (error) {
        throw parseApiError(error, "Kurs bo‘yicha lesson quiz natijalari yuklanmadi.");
    }
};

export const getCourseQuizResults = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/quiz-results/manage`);
        return normalizeCourseQuizManagerResults(data);
    } catch (error) {
        throw parseApiError(error, "Kurs bo‘yicha lesson quiz natijalari yuklanmadi.");
    }
};

export const getCourseQuizSessionDetail = async (courseId: string, sessionId: string) => {
    try {
        const {data} = await apiClient.get(`/courses/${courseId}/quiz-results/manage/${sessionId}`);
        return normalizeQuizSessionDetail(data);
    } catch (error) {
        throw parseApiError(error, "Quiz session detail yuklanmadi.");
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
