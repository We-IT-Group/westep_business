import apiClient from "../apiClient.ts";
import type {
    CourseTrackingAnalyticsResponse,
    TrackingLinkAnalyticsResponse,
    TrackingLinkCreateRequest,
    TrackingLinkResponse,
    TrackingLinkUpdateRequest,
} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

interface TrackingLinksResponse {
    content?: TrackingLinkResponse[];
    items?: TrackingLinkResponse[];
    data?: TrackingLinkResponse[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
}

export interface TrackingLinkListResponse {
    content: TrackingLinkResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const emptyAnalytics: TrackingLinkAnalyticsResponse = {
    clicks: 0,
    uniqueClicks: 0,
    leads: 0,
    checkoutStarted: 0,
    paidPurchases: 0,
    freeEnrolls: 0,
    paidAmount: 0,
    failedOrAbandoned: 0,
    refunded: 0,
    refundedAmount: 0,
    revenue: 0,
    conversionRate: 0,
    lastActivityAt: null,
};

const normalizeTrackingLinksPage = (
    response: TrackingLinksResponse | TrackingLinkResponse[] | undefined,
    page: number,
    size: number,
): TrackingLinkListResponse => {
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

const normalizeAnalytics = (
    data: Partial<TrackingLinkAnalyticsResponse> | Partial<CourseTrackingAnalyticsResponse> | undefined,
) => ({
    ...emptyAnalytics,
    ...data,
});

export const createTrackingLink = async (courseId: string, body: TrackingLinkCreateRequest) => {
    try {
        const {data} = await apiClient.post(`/tracking-links/courses/${courseId}`, body);
        return data as TrackingLinkResponse;
    } catch (error) {
        throw parseApiError(error, "Tracking link yaratilmadi.");
    }
};

export const getCourseTrackingLinks = async (courseId: string, page = 0, size = 20) => {
    try {
        const {data} = await apiClient.get(`/course/${courseId}/tracking-links`, {
            params: {page, size},
        });
        return normalizeTrackingLinksPage(data, page, size);
    } catch (error) {
        throw parseApiError(error, "Tracking linklar yuklanmadi.");
    }
};

export const getTrackingLink = async (id: string) => {
    try {
        const {data} = await apiClient.get(`/tracking-links/${id}`);
        return data as TrackingLinkResponse;
    } catch (error) {
        throw parseApiError(error, "Tracking link topilmadi.");
    }
};

export const updateTrackingLink = async (id: string, body: TrackingLinkUpdateRequest) => {
    try {
        const {data} = await apiClient.put(`/tracking-links/${id}`, body);
        return data as TrackingLinkResponse;
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
