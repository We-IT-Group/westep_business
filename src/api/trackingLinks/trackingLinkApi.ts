import apiClient from "../apiClient.ts";
import {
    TrackingLink,
    TrackingLinkAnalytics,
    TrackingLinkPayload,
} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

interface TrackingLinksResponse {
    content?: TrackingLink[];
    items?: TrackingLink[];
    data?: TrackingLink[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
}

export interface TrackingLinksPage {
    content: TrackingLink[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const emptyAnalytics: TrackingLinkAnalytics = {
    clicks: 0,
    uniqueClicks: 0,
    leads: 0,
    checkoutStarted: 0,
    paidPurchases: 0,
    failedOrAbandoned: 0,
    refunded: 0,
    revenue: 0,
    conversionRate: 0,
    lastActivityAt: null,
};

const normalizeTrackingLinksPage = (
    response: TrackingLinksResponse | TrackingLink[] | undefined,
    page: number,
    size: number,
): TrackingLinksPage => {
    if (Array.isArray(response)) {
        return {
            content: response,
            totalElements: response.length,
            totalPages: response.length > 0 ? 1 : 0,
            number: page,
            size,
        };
    }

    const content = response?.content || response?.items || response?.data || [];

    return {
        content,
        totalElements: response?.totalElements ?? content.length,
        totalPages: response?.totalPages ?? (content.length > 0 ? 1 : 0),
        number: response?.number ?? page,
        size: response?.size ?? size,
    };
};

const normalizeAnalytics = (data: Partial<TrackingLinkAnalytics> | undefined): TrackingLinkAnalytics => ({
    ...emptyAnalytics,
    ...data,
});

export const createTrackingLink = async (courseId: string, body: TrackingLinkPayload) => {
    try {
        const {data} = await apiClient.post(`/course/${courseId}/tracking-links`, body);
        return data as TrackingLink;
    } catch (error) {
        throw parseApiError(error, "Tracking link yaratilmadi.");
    }
};

export const getTrackingLinks = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/course/${courseId}/tracking-links`);
        return normalizeTrackingLinksPage(data, 0, 20);
    } catch (error) {
        throw parseApiError(error, "Tracking linklar yuklanmadi.");
    }
};

export const getTrackingLinkById = async (id: string) => {
    try {
        const {data} = await apiClient.get(`/tracking-links/${id}`);
        return data as TrackingLink;
    } catch (error) {
        throw parseApiError(error, "Tracking link topilmadi.");
    }
};

export const updateTrackingLink = async (id: string, body: Partial<TrackingLinkPayload & { isActive: boolean }>) => {
    try {
        const {data} = await apiClient.patch(`/tracking-links/${id}`, body);
        return data as TrackingLink;
    } catch (error) {
        throw parseApiError(error, "Tracking link yangilanmadi.");
    }
};

export const deleteTrackingLink = async (id: string) => {
    try {
        await apiClient.delete(`/tracking-links/${id}`);
    } catch (error) {
        throw parseApiError(error, "Tracking link o'chirilmadi.");
    }
};

export const getTrackingLinkAnalytics = async (id: string) => {
    try {
        const {data} = await apiClient.get(`/tracking-links/${id}/analytics`);
        return normalizeAnalytics(data);
    } catch (error) {
        throw parseApiError(error, "Tracking link analytics yuklanmadi.");
    }
};

export const getCourseTrackingAnalytics = async (courseId: string) => {
    try {
        const {data} = await apiClient.get(`/course/${courseId}/tracking-links/analytics`);
        return normalizeAnalytics(data);
    } catch (error) {
        throw parseApiError(error, "Course analytics yuklanmadi.");
    }
};
