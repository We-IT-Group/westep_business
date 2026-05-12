// src/api/filesApi.ts
import apiClient from "../apiClient";
import {getItem, setItem} from "../../utils/utils.ts";
import type {ApiErrorResponse, BusinessType, DeviceLimitExceededDetails} from "../../types/types.ts";
import {ApiRequestError, parseApiError} from "../../utils/apiError.ts";

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? value as Record<string, unknown> : null;

const asString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : undefined;

const resolveUserBusinessId = (user: unknown) => {
    const record = asRecord(user);
    if (!record) return undefined;

    const businessRecord =
        asRecord(record.business) ||
        asRecord(record.businessResponse) ||
        asRecord(record.company);

    return (
        asString(record.businessId) ||
        asString(record.businessID) ||
        asString(record.business_id) ||
        asString(record.ownerBusinessId) ||
        asString(record.workspaceBusinessId) ||
        asString(businessRecord?.id) ||
        asString(businessRecord?.businessId)
    );
};

const normalizeCurrentUser = <T extends Record<string, unknown>>(user: T) => ({
    ...user,
    businessId: resolveUserBusinessId(user) || "",
});

const normalizeLoginError = (error: unknown) => {
    const parsedError = parseApiError(error, "Login amalga oshmadi.");
    const normalizedMessage = parsedError.message.toLowerCase();

    if (
        parsedError.status === 401
        || parsedError.status === 403
        || normalizedMessage.includes("authentication required")
        || normalizedMessage.includes("unauthorized")
        || normalizedMessage.includes("bad credentials")
    ) {
        return new ApiRequestError("Parol noto'g'ri kiritildi.", parsedError.status);
    }

    return parsedError;
};

const normalizeVerifyCodeError = (error: unknown) => {
    const parsedError = parseApiError(error, "Kod tasdiqlanmadi.");
    const normalizedMessage = parsedError.message.toLowerCase();

    if (
        parsedError.status === 400
        || parsedError.status === 401
        || parsedError.status === 403
        || normalizedMessage.includes("authentication required")
        || normalizedMessage.includes("invalid code")
        || normalizedMessage.includes("code")
        || normalizedMessage.includes("otp")
    ) {
        return new ApiRequestError("Kod noto'g'ri kiritildi.", parsedError.status);
    }

    return parsedError;
};

export class DeviceLimitExceededError extends ApiRequestError {
    details: DeviceLimitExceededDetails;

    constructor(message: string, details: DeviceLimitExceededDetails, status = 409) {
        super(message, status, details);
        this.name = "DeviceLimitExceededError";
        this.details = details;
    }
}

type LoginPayload = {
    phone: string;
    password: string;
    deviceId: string;
    deviceName: string;
    replaceSessionId?: string;
};

export const login = async (body: LoginPayload) => {
    try {
        const {data} = await apiClient.post("/auth/login", {}, {
            params: {
                phone: body.phone,
                password: body.password,
                deviceId: body.deviceId,
                deviceName: body.deviceName,
                ...(body.replaceSessionId ? {replaceSessionId: body.replaceSessionId} : {}),
            }
        });
        setItem<string>("accessToken", data?.accessToken)
        setItem<string>("refreshToken", data?.refreshToken)
        return data
    } catch (error) {
        const parsedError = parseApiError(error, "Login amalga oshmadi.");
        if (parsedError.status === 409) {
            const payload =
                (error as {response?: {data?: ApiErrorResponse<DeviceLimitExceededDetails>}})?.response?.data;
            const details = payload?.details;

            if (details && Array.isArray(details.activeDevices)) {
                throw new DeviceLimitExceededError(
                    payload?.message || parsedError.message,
                    {
                        maxDevices: details.maxDevices,
                        activeDevices: details.activeDevices,
                    },
                    409,
                );
            }
        }
        throw normalizeLoginError(error);
    }
};

export const register = async (body: BusinessType) => {
    try {
        const response = await apiClient.post("/business/register", body);
        return response;
    } catch (error) {
        throw parseApiError(error, "Ro'yxatdan o'tib bo'lmadi.");
    }
};

export const getCurrentUser = async () => {
    const {data} = await apiClient.get("/user/me");
    return asRecord(data) ? normalizeCurrentUser(data) : data;
};

export const checkPhoneNumber = async ({phone}: { phone: string }) => {
    const {data} = await apiClient.post("/auth/check-phone", {phone});
    if (data.status === "NOT_FOUND") {
        throw new Error(data.message);
    }
};

export const logout = async () => {
    const refreshToken: string | null = getItem<string>("refreshToken");
    await apiClient.post("/auth/logout", refreshToken, {
        headers: {
            "Content-Type": "text/plain"
        }
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};


export const sendOtpCode = async (body: { phoneNumber: string, type: string }) => {
    try {
        await apiClient.post("/sms/send", {
            phone: body.phoneNumber,
            type: body.type,
        });
    } catch (error) {
        throw parseApiError(error, "SMS kod yuborilmadi.");
    }
};
export const verifyCode = async (body: { phoneNumber: string, code: string, type: string }) => {
    try {
        await apiClient.post("/sms/verify", {
            phone: body.phoneNumber,
            code: body.code,
            type: body.type,
        });
    } catch (error) {
        throw normalizeVerifyCodeError(error);
    }
};
export const resetPassword = async (body: { phoneNumber: string, password: string }) => {
    try {
        await apiClient.post("/auth/reset-password",{},{
            params:{
                phone: body.phoneNumber,
                newPassword: body.password,
            }
        });
    } catch (error) {
        throw parseApiError(error, "Parol yangilanmadi.");
    }
};
