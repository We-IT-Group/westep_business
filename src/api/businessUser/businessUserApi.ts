import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";
import type {
    BusinessMember,
    BusinessMemberCourseAssignmentRequest,
    BusinessResponse,
    CourseShortInfo,
} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

export type TeamRole = "TEACHER" | "ASSISTANT";

type BusinessMemberRecord = Record<string, unknown>;
type BusinessResponseRecord = Record<string, unknown>;

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const asString = (value: unknown, fallback = "") =>
    typeof value === "string" ? value : fallback;

const asStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (typeof item === "string") {
                return item.trim();
            }

            if (item && typeof item === "object") {
                const record = item as Record<string, unknown>;
                return asString(record.name || record.title || record.courseName).trim();
            }

            return "";
        })
        .filter(Boolean);
};

const normalizeRole = (value: unknown, fallback: TeamRole = "ASSISTANT") => {
    const normalized = asString(value, fallback).toUpperCase();
    if (normalized.includes("TEACHER")) {
        return "TEACHER";
    }
    if (normalized.includes("ASSISTANT")) {
        return "ASSISTANT";
    }
    return fallback;
};

const normalizeAssignedCourse = (value: unknown): CourseShortInfo | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const courseId = asString(record.courseId || record.id).trim();
    const courseName = asString(record.courseName || record.name || record.title).trim();

    if (!courseId && !courseName) {
        return null;
    }

    return {
        courseId: courseId || courseName,
        courseName: courseName || "Noma’lum kurs",
    };
};

const buildFullName = (record: BusinessMemberRecord) => {
    const explicitFullName = asString(
        record.fullName
        || record.fio
        || record.name
        || record.userFullName
        || record.teacherName
        || record.assistantName,
    ).trim();

    if (explicitFullName) {
        return explicitFullName;
    }

    const firstName = asString(record.firstname || record.firstName).trim();
    const lastName = asString(record.lastname || record.lastName).trim();
    return `${firstName} ${lastName}`.trim();
};

const normalizeBusinessMember = (value: unknown, fallbackRole: TeamRole = "ASSISTANT"): BusinessMember | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const id = asString(
        record.id
        || record.userId
        || record.memberId
        || record.teacherId
        || record.assistantId,
    ).trim();
    const fullName = buildFullName(record);

    if (!id && !fullName) {
        return null;
    }

    return {
        id: id || fullName,
        fullName: fullName || "Noma’lum foydalanuvchi",
        phone: asString(record.phone || record.phoneNumber).trim(),
        role: normalizeRole(record.role || record.roleName || record.memberRole, fallbackRole),
        courseNames: asStringArray(record.courseNames || record.courses),
        assignedCourses: Array.isArray(record.assignedCourses)
            ? record.assignedCourses
                .map((course) => normalizeAssignedCourse(course))
                .filter((course): course is CourseShortInfo => course !== null)
            : [],
        avatarAttachmentId: asString(record.avatarAttachmentId).trim() || undefined,
        avatarUrl: asString(record.avatarUrl).trim() || undefined,
    };
};

const mapRoleRecord = (record: Record<string, string>, role: TeamRole): BusinessMember[] =>
    Object.entries(record).map(([id, fullName]) => ({
        id,
        fullName,
        phone: "",
        role,
        courseNames: [],
        assignedCourses: [],
        avatarAttachmentId: undefined,
        avatarUrl: undefined,
    }));

const normalizeBusinessResponse = (value: unknown): BusinessResponse => {
    const record = asRecord(value) as BusinessResponseRecord | null;

    if (!record) {
        return {
            id: "",
            name: "",
            address: "",
            phone: "",
            description: "",
            studentsCount: null,
            ownerId: "",
            ownerFullName: "",
            ownerAvatarAttachmentId: undefined,
            ownerAvatarUrl: undefined,
            assistants: {},
            members: [],
        };
    }

    const members = Array.isArray(record.members)
        ? record.members
            .map((member) => normalizeBusinessMember(member))
            .filter((member): member is BusinessMember => member !== null)
        : [];

    const assistants = asRecord(record.assistants);

    return {
        id: asString(record.id).trim(),
        name: asString(record.name).trim(),
        address: asString(record.address).trim() || undefined,
        phone: asString(record.phone).trim() || undefined,
        description: asString(record.description).trim() || undefined,
        studentsCount: typeof record.studentsCount === "number" ? record.studentsCount : null,
        ownerId: asString(record.ownerId).trim(),
        ownerFullName: asString(record.ownerFullName).trim(),
        ownerAvatarAttachmentId: asString(record.ownerAvatarAttachmentId).trim() || undefined,
        ownerAvatarUrl: asString(record.ownerAvatarUrl).trim() || undefined,
        assistants: assistants
            ? Object.fromEntries(
                Object.entries(assistants).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
            )
            : {},
        members: members.length
            ? members
            : [
                ...(record.teachers && asRecord(record.teachers) ? mapRoleRecord(
                    Object.fromEntries(Object.entries(asRecord(record.teachers) || {}).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
                    "TEACHER",
                ) : []),
                ...(assistants ? mapRoleRecord(
                    Object.fromEntries(Object.entries(assistants).filter((entry): entry is [string, string] => typeof entry[1] === "string")),
                    "ASSISTANT",
                ) : []),
            ],
    };
};

const buildCourseParams = (courseIds?: string[]) => {
    const params = new URLSearchParams();
    courseIds?.filter(Boolean).forEach((courseId) => {
        params.append("courseIds", courseId);
    });
    return params;
};

interface TeacherPayload {
    businessId: string;
    ownerId: string;
    teacherPhone: string;
    courseIds?: string[];
}

interface AssistantPayload {
    businessId: string;
    ownerId: string;
    assistantPhone: string;
    courseIds?: string[];
}

export const addBusinessTeacher = async (body: TeacherPayload) => {
    try {
        const params = buildCourseParams(body.courseIds);
        params.set("ownerId", body.ownerId);
        params.set("teacherPhone", body.teacherPhone);
        const {data} = await apiClient.post(`/business/teacher/add/${body.businessId}?${params.toString()}`);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        throw parseApiError(err, err.response?.data?.message || "Teacher qo‘shib bo‘lmadi.");
    }
};

export const addBusinessAssistant = async (body: AssistantPayload) => {
    try {
        const params = buildCourseParams(body.courseIds);
        params.set("ownerId", body.ownerId);
        params.set("assistantPhone", body.assistantPhone);
        const {data} = await apiClient.post(`/business/assistant/add/${body.businessId}?${params.toString()}`);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        throw parseApiError(err, err.response?.data?.message || "Assistant qo‘shib bo‘lmadi.");
    }
};

export const updateMemberAssignedCourses = async (
    userId: string,
    payload: BusinessMemberCourseAssignmentRequest,
) => {
    try {
        const {data} = await apiClient.put(`/business/members/${userId}/assigned-courses`, payload);
        return data;
    } catch (error) {
        throw parseApiError(error, "Mas'ul kurslarni yangilab bo‘lmadi.");
    }
};

export const deleteBusinessAssistant = async (body: AssistantPayload) => {
    try {
        const {data} = await apiClient.delete("/business/assistant/remove/" + body.businessId, {
            params: {
                ownerId: body.ownerId,
                assistantPhone: body.assistantPhone,
            }
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        throw parseApiError(err, err.response?.data?.message || "Assistantni o‘chirib bo‘lmadi.");
    }
};

export const getBusinessMembers = async (id: string) => {
    const {data} = await apiClient.get<BusinessResponse>("/business/members/" + id);
    return normalizeBusinessResponse(data);
};
