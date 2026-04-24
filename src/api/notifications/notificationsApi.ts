import apiClient from "../apiClient.ts";
import {NotificationItem} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

type NotificationRecord = Record<string, unknown>;

type NotificationsResponse =
    | NotificationRecord[]
    | {
    content?: NotificationRecord[];
    data?: NotificationRecord[];
    items?: NotificationRecord[];
    notifications?: NotificationRecord[];
};

const asRecord = (value: unknown): NotificationRecord | null =>
    value && typeof value === "object" ? value as NotificationRecord : null;

const asString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : undefined;

const asBoolean = (value: unknown) =>
    typeof value === "boolean" ? value : undefined;

const normalizeNotificationItem = (value: unknown, index: number): NotificationItem | null => {
    const record = asRecord(value);
    if (!record) return null;

    const id = asString(record.id) || `notification-${index}`;
    const title =
        asString(record.title) ||
        asString(record.subject) ||
        asString(record.name) ||
        asString(record.type) ||
        "Notification";
    const message =
        asString(record.message) ||
        asString(record.body) ||
        asString(record.content) ||
        asString(record.description) ||
        title;
    const createdAt =
        asString(record.createdAt) ||
        asString(record.sentAt) ||
        asString(record.updatedAt) ||
        asString(record.date) ||
        new Date(0).toISOString();
    const isRead =
        asBoolean(record.isRead) ??
        asBoolean(record.read) ??
        asBoolean(record.seen) ??
        false;

    return {
        id,
        title,
        message,
        type: asString(record.type) || asString(record.category) || asString(record.kind),
        isRead,
        createdAt,
    };
};

const normalizeNotifications = (response: NotificationsResponse | undefined): NotificationItem[] => {
    const rawItems = Array.isArray(response)
        ? response
        : response?.content || response?.items || response?.data || response?.notifications || [];

    return rawItems
        .map((item, index) => normalizeNotificationItem(item, index))
        .filter((item): item is NotificationItem => Boolean(item))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const normalizeUnreadCount = (response: unknown) => {
    if (typeof response === "number") return response;

    const record = asRecord(response);
    if (!record) return 0;

    return Number(record.unreadCount ?? record.count ?? record.total ?? 0) || 0;
};

export const getNotifications = async () => {
    try {
        const {data} = await apiClient.get("/notifications");
        return normalizeNotifications(data);
    } catch (error) {
        throw parseApiError(error, "Notificationlar yuklanmadi.");
    }
};

export const getUnreadNotificationsCount = async () => {
    try {
        const {data} = await apiClient.get("/notifications/unread-count");
        return normalizeUnreadCount(data);
    } catch (error) {
        throw parseApiError(error, "Unread notifications count yuklanmadi.");
    }
};

export const markNotificationAsRead = async (id: string) => {
    try {
        await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) {
        throw parseApiError(error, "Notification read holatiga o'tmadi.");
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        await apiClient.patch("/notifications/read-all");
    } catch (error) {
        throw parseApiError(error, "Notificationlar read holatiga o'tmadi.");
    }
};
