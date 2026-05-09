import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";

type ModuleTestResultsResponse = {
    content?: unknown[];
    items?: unknown[];
    data?: unknown[];
};

export type ModuleTestResultSummary = {
    sessionId: string;
    courseId: string;
    moduleId: string;
    moduleName: string;
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

export type ModuleTestQuestionDetail = {
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

export type ModuleTestSessionDetail = {
    summary?: ModuleTestResultSummary;
    questions: ModuleTestQuestionDetail[];
};

export type ModuleTestManagerResultSummaryResponse = ModuleTestResultSummary & {
    studentId: string;
    studentName: string;
};

export type ModuleTestSessionAnswerDetail = ModuleTestQuestionDetail;

export type ModuleTestManagerResultDetailResponse = {
    summary?: ModuleTestManagerResultSummaryResponse;
    questions: ModuleTestSessionAnswerDetail[];
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

const normalizeModuleTestResultSummary = (item: unknown, index: number): ModuleTestResultSummary => {
    const record = asRecord(item) || {};

    return {
        sessionId: asOptionalString(record.sessionId || record.id) || `module-test-session-${index}`,
        courseId: asString(record.courseId || ""),
        moduleId: asString(record.moduleId || ""),
        moduleName: asString(record.moduleName || `Module ${index + 1}`),
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

const normalizeModuleTestManagerResultSummary = (item: unknown, index: number): ModuleTestManagerResultSummaryResponse => {
    const record = asRecord(item) || {};

    return {
        ...normalizeModuleTestResultSummary(item, index),
        studentId: asString(record.studentId || ""),
        studentName: asString(record.studentName || "Unknown student"),
    };
};

const normalizeModuleTestSessionDetail = (data: unknown): ModuleTestSessionDetail => {
    const record = asRecord(data) || {};
    const summaryRecord = asRecord(record.summary);
    const summary = summaryRecord ? normalizeModuleTestResultSummary(summaryRecord, 0) : undefined;
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

const normalizeModuleTestManagerSessionDetail = (data: unknown): ModuleTestManagerResultDetailResponse => {
    const record = asRecord(data) || {};
    const summaryRecord = asRecord(record.summary);
    const summary = summaryRecord ? normalizeModuleTestManagerResultSummary(summaryRecord, 0) : undefined;
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

export const getMyModuleTestResults = async () => {
    try {
        const {data} = await apiClient.get("/module-tests/my-results");
        return extractArray(data as ModuleTestResultsResponse).map(normalizeModuleTestResultSummary);
    } catch (error) {
        throw parseApiError(error, "Module test natijalari yuklanmadi.");
    }
};

export const getMyModuleTestResultsByCourse = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/module-tests/my-results/course/${courseId}`);
        return extractArray(data as ModuleTestResultsResponse).map(normalizeModuleTestResultSummary);
    } catch (error) {
        throw parseApiError(error, "Kurs bo‘yicha module test natijalari yuklanmadi.");
    }
};

export const getMyModuleTestSessionDetail = async (sessionId: string) => {
    try {
        const {data} = await apiClient.get(`/module-tests/my-results/${sessionId}`);
        return normalizeModuleTestSessionDetail(data);
    } catch (error) {
        throw parseApiError(error, "Module test urinish detali yuklanmadi.");
    }
};

export const getModuleTestManagerResultsByCourse = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/module-tests/manage/course/${courseId}`);
        return extractArray(data as ModuleTestResultsResponse).map(normalizeModuleTestManagerResultSummary);
    } catch (error) {
        throw parseApiError(error, "Module test manager natijalari yuklanmadi.");
    }
};

export const getModuleTestManagerSessionDetail = async (sessionId: string) => {
    try {
        const {data} = await apiClient.get(`/module-tests/manage/${sessionId}`);
        return normalizeModuleTestManagerSessionDetail(data);
    } catch (error) {
        throw parseApiError(error, "Module test manager detail yuklanmadi.");
    }
};
