import {useMutation, useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    createTrackingLink,
    deleteTrackingLink,
    getCourseTrackingAnalytics,
    getTrackingLinkAnalytics,
    getTrackingLinkById,
    getTrackingLinks,
    updateTrackingLink,
} from "./trackingLinkApi.ts";
import {TrackingLink, TrackingLinkPayload} from "../../types/types.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

const trackingLinksKey = (courseId: string) =>
    ["tracking-links", courseId] as const;

const trackingLinksAnalyticsKey = (courseId: string) =>
    ["tracking-links-analytics", courseId] as const;

export const useTrackingLinks = (courseId: string) =>
    useQuery({
        queryKey: trackingLinksKey(courseId),
        queryFn: () => getTrackingLinks(courseId),
        enabled: !!courseId,
    });

export const useCourseTrackingAnalytics = (courseId: string) =>
    useQuery({
        queryKey: trackingLinksAnalyticsKey(courseId),
        queryFn: () => getCourseTrackingAnalytics(courseId),
        enabled: !!courseId,
    });

export const useTrackingLink = (id?: string, enabled = true) =>
    useQuery({
        queryKey: ["tracking-link", id],
        queryFn: () => getTrackingLinkById(id || ""),
        enabled: !!id && enabled,
    });

export const useTrackingLinksAnalytics = (links: TrackingLink[]) =>
    useQueries({
        queries: links.map((link) => ({
            queryKey: ["tracking-link-analytics", link.id],
            queryFn: () => getTrackingLinkAnalytics(link.id),
            enabled: !!link.id,
            staleTime: 1000 * 30,
        })),
    });

export const useCreateTrackingLink = (courseId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: TrackingLinkPayload) => createTrackingLink(courseId, body),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: trackingLinksKey(courseId)});
            await queryClient.invalidateQueries({queryKey: trackingLinksAnalyticsKey(courseId)});
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
        mutationFn: ({id, body}: { id: string; body: Partial<TrackingLinkPayload & { isActive: boolean }> }) =>
            updateTrackingLink(id, body),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({queryKey: trackingLinksKey(courseId)});
            await queryClient.invalidateQueries({queryKey: trackingLinksAnalyticsKey(courseId)});
            await queryClient.invalidateQueries({queryKey: ["tracking-link", variables.id]});
            await queryClient.invalidateQueries({queryKey: ["tracking-link-analytics", variables.id]});
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
        onSuccess: async (_, id) => {
            await queryClient.invalidateQueries({queryKey: trackingLinksKey(courseId)});
            await queryClient.invalidateQueries({queryKey: trackingLinksAnalyticsKey(courseId)});
            queryClient.removeQueries({queryKey: ["tracking-link", id]});
            queryClient.removeQueries({queryKey: ["tracking-link-analytics", id]});
            showSuccessToast("Tracking link o'chirildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Tracking link o'chirilmadi");
        },
    });
};
