import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {UserDeviceSession} from "../../types/types.ts";

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const asString = (value: unknown) =>
    typeof value === "string" ? value : "";

const normalizeUserDeviceSession = (value: unknown): UserDeviceSession | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const sessionId = asString(record.sessionId || record.id).trim();
    const deviceId = asString(record.deviceId).trim();
    const deviceName = asString(record.deviceName).trim();

    if (!sessionId && !deviceId && !deviceName) {
        return null;
    }

    return {
        sessionId: sessionId || deviceId || deviceName,
        deviceId,
        deviceName: deviceName || "Noma’lum qurilma",
        platform: asString(record.platform).trim() || undefined,
        browser: asString(record.browser).trim() || undefined,
        ipAddress: asString(record.ipAddress).trim() || undefined,
        lastSeenAt: asString(record.lastSeenAt).trim() || undefined,
    };
};

export const getMyDevices = async () => {
    try {
        const {data} = await apiClient.get("/user/devices");
        if (!Array.isArray(data)) {
            return [] as UserDeviceSession[];
        }

        return data
            .map((item) => normalizeUserDeviceSession(item))
            .filter((item): item is UserDeviceSession => item !== null);
    } catch (error) {
        throw parseApiError(error, "Qurilmalar ro‘yxatini olib bo‘lmadi.");
    }
};

export const deleteMyDevice = async (sessionId: string) => {
    try {
        const {data} = await apiClient.delete(`/user/devices/${sessionId}`);
        return data;
    } catch (error) {
        throw parseApiError(error, "Qurilmani o‘chirib bo‘lmadi.");
    }
};
