import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? value as Record<string, unknown> : null;

const asString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : undefined;

export type TeacherProfile = {
    businessId?: string;
};

const normalizeTeacherProfile = (value: unknown): TeacherProfile => {
    const record = asRecord(value);
    if (!record) {
        return {};
    }

    const businessRecord =
        asRecord(record.business) ||
        asRecord(record.businessResponse) ||
        asRecord(record.company);

    return {
        businessId:
            asString(record.businessId) ||
            asString(record.businessID) ||
            asString(record.business_id) ||
            asString(record.ownerBusinessId) ||
            asString(record.workspaceBusinessId) ||
            asString(businessRecord?.id) ||
            asString(businessRecord?.businessId) ||
            "",
    };
};

export const getTeacherProfileMe = async () => {
    try {
        const {data} = await apiClient.get("/teacher-profiles/me");
        const wrapped = asRecord(data)?.data;
        return normalizeTeacherProfile(wrapped ?? data);
    } catch (error) {
        throw parseApiError(error, "Teacher profili yuklanmadi.");
    }
};
