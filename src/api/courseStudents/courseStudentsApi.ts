import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";

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

const extractArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value;
    const record = asRecord(value);
    if (!record) return [];

    const nested = record.content || record.items || record.data || record.students;
    return Array.isArray(nested) ? nested : [];
};

export type CourseStudentSummary = {
    studentCourseId: string;
    studentId: string;
    studentName: string;
    phone?: string;
    progressPercentage: number;
    totalLessons: number;
    completedLessons: number;
    homeworkSubmissionsCount: number;
    quizAttemptsCount: number;
    messageCount: number;
    lastActivityAt?: string;
};

const normalizeCourseStudent = (value: unknown, index: number): CourseStudentSummary => {
    const record = asRecord(value) || {};

    return {
        studentCourseId: asOptionalString(record.studentCourseId || record.id) || `student-course-${index}`,
        studentId: asOptionalString(record.studentId) || "",
        studentName: asOptionalString(record.studentName || record.fullName || record.name) || `Student ${index + 1}`,
        phone: asOptionalString(record.phone || record.phoneNumber),
        progressPercentage: asNumber(record.progressPercentage) ?? 0,
        totalLessons: asNumber(record.totalLessons) ?? 0,
        completedLessons: asNumber(record.completedLessons) ?? 0,
        homeworkSubmissionsCount: asNumber(record.homeworkSubmissionsCount) ?? 0,
        quizAttemptsCount: asNumber(record.quizAttemptsCount) ?? 0,
        messageCount: asNumber(record.messageCount) ?? 0,
        lastActivityAt: asOptionalString(record.lastActivityAt),
    };
};

export const getCourseStudents = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/course/${courseId}/students`);
        return extractArray(data).map(normalizeCourseStudent);
    } catch (error) {
        throw parseApiError(error, "Kurs studentlari yuklanmadi.");
    }
};
