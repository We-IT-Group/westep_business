import apiClient from "../apiClient.ts";
import type {
    CourseTrackingAnalyticsResponse,
    TrackingLinkAnalyticsResponse,
    TrackingLinkCreateRequest,
    TrackingLinkResponse,
    TrackingLinkUpdateRequest,
    TrackingSourceType,
} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

interface TrackingLinksResponse {
    content?: TrackingLinkResponse[];
    items?: TrackingLinkResponse[];
    data?: TrackingLinkResponse[];
    page?: number;
    totalItems?: number;
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
}

interface TrackingAnalyticsResponse {
    content?: Array<Partial<TrackingLinkResponse> & Partial<TrackingLinkAnalyticsResponse> & {linkId?: string; linkName?: string}>;
    items?: Array<Partial<TrackingLinkResponse> & Partial<TrackingLinkAnalyticsResponse> & {linkId?: string; linkName?: string}>;
    data?: Array<Partial<TrackingLinkResponse> & Partial<TrackingLinkAnalyticsResponse> & {linkId?: string; linkName?: string}>;
}

interface CourseAttributionSummaryResponse {
    courseId?: string;
    sources?: Array<Partial<TrackingLinkAnalyticsResponse> & {sourceType?: TrackingSourceType}>;
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
    appliedFeeAmount: 0,
    netAmount: 0,
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
        totalElements: response?.totalItems ?? response?.totalElements ?? content.length,
        totalPages: response?.totalPages ?? (content.length > 0 ? 1 : 0),
        number: response?.page ?? response?.number ?? page,
        size: response?.size ?? size,
    };
};

const normalizeAnalytics = (
    data: Partial<TrackingLinkAnalyticsResponse> | Partial<CourseTrackingAnalyticsResponse> | undefined,
) => ({
    ...emptyAnalytics,
    ...data,
});

const normalizeAnalyticsLinks = (
    response:
        | TrackingAnalyticsResponse
        | Array<Partial<TrackingLinkResponse> & Partial<TrackingLinkAnalyticsResponse> & {linkId?: string; linkName?: string}>
        | undefined,
) => {
    const items = Array.isArray(response)
        ? response
        : response?.content || response?.items || response?.data || [];

    return items.map((item) => ({
        id: item.linkId || item.id || "",
        name: item.linkName || item.name || "",
        code: item.code || "",
        sourceType: item.sourceType,
        ...normalizeAnalytics(item),
    }));
};

const normalizeCourseSummary = (data: CourseAttributionSummaryResponse | Partial<CourseTrackingAnalyticsResponse> | undefined) => {
    if (data && typeof data === "object" && "sources" in data && Array.isArray(data.sources)) {
        return data.sources.reduce<TrackingLinkAnalyticsResponse>(
            (accumulator, item) => ({
                ...accumulator,
                clicks: accumulator.clicks + (item.clicks || 0),
                uniqueClicks: accumulator.uniqueClicks + (item.uniqueClicks || 0),
                leads: accumulator.leads + (item.leads || 0),
                checkoutStarted: accumulator.checkoutStarted + (item.checkoutStarted || 0),
                paidPurchases: accumulator.paidPurchases + (item.paidPurchases || 0),
                freeEnrolls: (accumulator.freeEnrolls || 0) + (item.freeEnrolls || 0),
                paidAmount: (accumulator.paidAmount || 0) + (item.paidAmount || 0),
                appliedFeeAmount: (accumulator.appliedFeeAmount || 0) + (item.appliedFeeAmount || 0),
                netAmount: (accumulator.netAmount || 0) + (item.netAmount || 0),
                refunded: accumulator.refunded + (item.refunded || 0),
                refundedAmount: (accumulator.refundedAmount || 0) + (item.refundedAmount || 0),
            }),
            {...emptyAnalytics},
        );
    }

    return normalizeAnalytics(data as Partial<CourseTrackingAnalyticsResponse> | undefined);
};

export const createTrackingLink = async (body: TrackingLinkCreateRequest) => {
    try {
        const {data} = await apiClient.post("/admin/tracking-links", body);
        return data as TrackingLinkResponse;
    } catch (error) {
        throw parseApiError(error, "Tracking link yaratilmadi.");
    }
};

export const getCourseTrackingLinks = async (courseId: string, page = 0, size = 20) => {
    try {
        const {data} = await apiClient.get("/admin/tracking-links", {
            params: {courseId, page, size},
        });
        return normalizeTrackingLinksPage(data, page, size);
    } catch (error) {
        throw parseApiError(error, "Tracking linklar yuklanmadi.");
    }
};

export const updateTrackingLink = async (id: string, body: TrackingLinkUpdateRequest) => {
    try {
        const {data} = await apiClient.patch(`/tracking-links/${id}`, body);
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
        const {data} = await apiClient.get(`/analytics/courses/${courseId}/attribution-summary`);
        return normalizeCourseSummary(data);
    } catch (error) {
        throw parseApiError(error, "Course analytics yuklanmadi.");
    }
};

export const getSourceTrackingAnalytics = async (
    courseId: string,
    sourceType?: TrackingSourceType | "ALL",
) => {
    try {
        const params: {courseId: string; sourceType?: TrackingSourceType} = {courseId};
        if (sourceType && sourceType !== "ALL") {
            params.sourceType = sourceType;
        }

        const {data} = await apiClient.get("/analytics/links", {params});
        return normalizeAnalyticsLinks(data);
    } catch (error) {
        throw parseApiError(error, "Source analytics yuklanmadi.");
    }
};
