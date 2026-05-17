import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    createTrackingLink,
    deleteTrackingLink,
    getCourseTrackingAnalytics,
    getCourseTrackingLinks,
    getTrackingLinkAnalytics,
    getSourceTrackingAnalytics,
    updateTrackingLink,
} from "./trackingLinkApi.ts";
import {
    TrackingSourceType,
    TrackingLinkUpdateRequest,
} from "../../types/types.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

const trackingLinksKey = (courseId: string) =>
    ["tracking-links", courseId] as const;

const trackingLinksAnalyticsKey = (courseId: string) =>
    ["tracking-links-analytics", courseId] as const;

const sourceTrackingAnalyticsKey = (courseId: string, sourceType?: TrackingSourceType | "ALL") =>
    ["source-tracking-analytics", courseId, sourceType || "ALL"] as const;

export const useTrackingLinks = (courseId: string, page = 0, size = 20) =>
    useQuery({
        queryKey: [...trackingLinksKey(courseId), page, size],
        queryFn: () => getCourseTrackingLinks(courseId, page, size),
        enabled: !!courseId,
    });

export const useCourseTrackingAnalytics = (courseId: string) =>
    useQuery({
        queryKey: trackingLinksAnalyticsKey(courseId),
        queryFn: () => getCourseTrackingAnalytics(courseId),
        enabled: !!courseId,
    });

export const useSourceTrackingAnalytics = (
    courseId: string,
    sourceType?: TrackingSourceType | "ALL",
) =>
    useQuery({
        queryKey: sourceTrackingAnalyticsKey(courseId, sourceType),
        queryFn: () => getSourceTrackingAnalytics(courseId, sourceType),
        enabled: !!courseId,
    });

export const useCreateTrackingLink = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTrackingLink,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: trackingLinksKey(courseId)});
            await queryClient.invalidateQueries({queryKey: trackingLinksAnalyticsKey(courseId)});
            await queryClient.invalidateQueries({queryKey: sourceTrackingAnalyticsKey(courseId)});
            showSuccessToast("Tracking link yaratildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Tracking link yaratilmadi");
        },
    });
};

export const useUpdateTrackingLink = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, body}: { id: string; body: TrackingLinkUpdateRequest }) =>
            updateTrackingLink(id, body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: trackingLinksKey(courseId)});
            await queryClient.invalidateQueries({queryKey: trackingLinksAnalyticsKey(courseId)});
            await queryClient.invalidateQueries({queryKey: sourceTrackingAnalyticsKey(courseId)});
            showSuccessToast("Tracking link yangilandi.");
        },
        onError: (error) => {
            showErrorToast(error, "Tracking link yangilanmadi");
        },
    });
};

export const useDeleteTrackingLink = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteTrackingLink(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: trackingLinksKey(courseId)});
            await queryClient.invalidateQueries({queryKey: trackingLinksAnalyticsKey(courseId)});
            await queryClient.invalidateQueries({queryKey: sourceTrackingAnalyticsKey(courseId)});
            showSuccessToast("Tracking link o'chirildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Tracking link o'chirilmadi");
        },
    });
};

export const useTrackingLinkAnalytics = (id?: string, enabled = true) =>
    useQuery({
        queryKey: ["tracking-link-analytics", id],
        queryFn: () => getTrackingLinkAnalytics(id || ""),
        enabled: !!id && enabled,
    });
