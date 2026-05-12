import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {CourseStaffMember} from "../../types/types.ts";

type CourseStaffRecord = Record<string, unknown>;

const asRecord = (value: unknown): CourseStaffRecord | null =>
    value && typeof value === "object" && !Array.isArray(value) ? value as CourseStaffRecord : null;

const asString = (value: unknown, fallback = "") =>
    typeof value === "string" ? value : fallback;

const normalizeCourseStaffMember = (value: unknown): CourseStaffMember | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const userId = asString(record.userId || record.id).trim();
    const fullName = asString(record.fullName || record.name).trim();
    if (!userId && !fullName) {
        return null;
    }

    return {
        userId: userId || fullName,
        fullName: fullName || "Noma’lum staff",
        phone: asString(record.phone || record.phoneNumber).trim(),
        role: asString(record.role || record.roleName).trim(),
        avatarAttachmentId: asString(record.avatarAttachmentId).trim() || undefined,
        avatarUrl: asString(record.avatarUrl).trim() || undefined,
    };
};

export const getCourseStaff = async (courseId: string) => {
    try {
        const {data} = await apiClient.get<unknown[]>(`/course/${courseId}/staff`);
        return (Array.isArray(data) ? data : [])
            .map((member) => normalizeCourseStaffMember(member))
            .filter((member): member is CourseStaffMember => member !== null);
    } catch (error) {
        throw parseApiError(error, "Kurs staff ro‘yxati yuklanmadi.");
    }
};
