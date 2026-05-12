import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    getCourseHomeworkInbox,
    getCourseHomeworkStatusSummary,
    getCourseHomeworkSubmissionDetail,
    getCourseHomeworkUnreadCount,
    markCourseHomeworkAsRead,
    reviewCourseHomework,
} from "./homeworkInboxApi.ts";
import type {LessonHomeworkReviewRequest} from "../../types/types.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

export const courseHomeworkInboxKey = (courseId: string, page: number, size: number) =>
    ["course-homework-inbox", courseId, page, size] as const;

export const courseHomeworkUnreadCountKey = (courseId: string) =>
    ["course-homework-inbox", courseId, "unread-count"] as const;

export const courseHomeworkStatusSummaryKey = (courseId: string) =>
    ["course-homework-inbox", courseId, "status-summary"] as const;

export const courseHomeworkDetailKey = (courseId: string, submissionId: string) =>
    ["course-homework-inbox", courseId, "detail", submissionId] as const;

export const useCourseHomeworkInbox = (courseId?: string, page = 0, size = 20, enabled = true) =>
    useQuery({
        queryKey: courseHomeworkInboxKey(courseId || "", page, size),
        queryFn: () => getCourseHomeworkInbox(courseId || "", page, size),
        enabled: !!courseId && enabled,
        placeholderData: (previousData) => previousData,
    });

export const useCourseHomeworkUnreadCount = (courseId?: string, enabled = true) =>
    useQuery({
        queryKey: courseHomeworkUnreadCountKey(courseId || ""),
        queryFn: () => getCourseHomeworkUnreadCount(courseId || ""),
        enabled: !!courseId && enabled,
    });

export const useCourseHomeworkStatusSummary = (courseId?: string, enabled = true) =>
    useQuery({
        queryKey: courseHomeworkStatusSummaryKey(courseId || ""),
        queryFn: () => getCourseHomeworkStatusSummary(courseId || ""),
        enabled: !!courseId && enabled,
    });

export const useCourseHomeworkSubmissionDetail = (courseId?: string, submissionId?: string, enabled = true) =>
    useQuery({
        queryKey: courseHomeworkDetailKey(courseId || "", submissionId || ""),
        queryFn: () => getCourseHomeworkSubmissionDetail(courseId || "", submissionId || ""),
        enabled: !!courseId && !!submissionId && enabled,
    });

export const useMarkCourseHomeworkRead = (courseId?: string, page?: number, size = 20) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (submissionId: string) => markCourseHomeworkAsRead(courseId || "", submissionId),
        onSuccess: async (_, submissionId) => {
            if (!courseId) return;
            await Promise.all([
                queryClient.invalidateQueries({queryKey: courseHomeworkUnreadCountKey(courseId)}),
                queryClient.invalidateQueries({queryKey: courseHomeworkStatusSummaryKey(courseId)}),
                page == null
                    ? queryClient.invalidateQueries({queryKey: ["course-homework-inbox", courseId]})
                    : queryClient.invalidateQueries({queryKey: courseHomeworkInboxKey(courseId, page, size)}),
                queryClient.invalidateQueries({queryKey: courseHomeworkDetailKey(courseId, submissionId)}),
            ]);
        },
        onError: (error) => {
            showErrorToast(error, "Homework read holatini yangilab bo'lmadi");
        },
    });
};

export const useReviewCourseHomework = (courseId?: string, page?: number, size = 20) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({submissionId, body}: {submissionId: string; body: LessonHomeworkReviewRequest}) =>
            reviewCourseHomework(courseId || "", submissionId, body),
        onSuccess: async (_, variables) => {
            if (!courseId) return;
            await Promise.all([
                queryClient.invalidateQueries({queryKey: courseHomeworkUnreadCountKey(courseId)}),
                queryClient.invalidateQueries({queryKey: courseHomeworkStatusSummaryKey(courseId)}),
                page == null
                    ? queryClient.invalidateQueries({queryKey: ["course-homework-inbox", courseId]})
                    : queryClient.invalidateQueries({queryKey: courseHomeworkInboxKey(courseId, page, size)}),
                queryClient.invalidateQueries({queryKey: courseHomeworkDetailKey(courseId, variables.submissionId)}),
            ]);
            showSuccessToast("Homework review saqlandi.");
        },
        onError: (error) => {
            showErrorToast(error, "Homework review saqlanmadi");
        },
    });
};
