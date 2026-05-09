import {useMutation, useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    getCourseDiscussionInbox,
    getCourseDiscussionInboxUnreadCount,
    getCourseDiscussionThreadDetail,
    markCourseDiscussionThreadAsRead,
    replyCourseDiscussionThread,
} from "./discussionInboxApi.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

export const courseDiscussionInboxKey = (courseId: string, page: number, size: number) =>
    ["course-discussion-inbox", courseId, page, size] as const;

export const courseDiscussionUnreadCountKey = (courseId: string) =>
    ["course-discussion-inbox", courseId, "unread-count"] as const;

export const courseDiscussionThreadDetailKey = (courseId: string, threadId: string) =>
    ["course-discussion-inbox", courseId, "thread", threadId] as const;

export const useCourseDiscussionInbox = (courseId?: string, page = 0, size = 20, enabled = true) =>
    useQuery({
        queryKey: courseDiscussionInboxKey(courseId || "", page, size),
        queryFn: () => getCourseDiscussionInbox(courseId || "", page, size),
        enabled: !!courseId && enabled,
        placeholderData: (previousData) => previousData,
    });

export const useCourseDiscussionUnreadCount = (courseId?: string, enabled = true) =>
    useQuery({
        queryKey: courseDiscussionUnreadCountKey(courseId || ""),
        queryFn: () => getCourseDiscussionInboxUnreadCount(courseId || ""),
        enabled: !!courseId && enabled,
    });

export const useCourseDiscussionThreadDetail = (courseId?: string, threadId?: string, enabled = true) =>
    useQuery({
        queryKey: courseDiscussionThreadDetailKey(courseId || "", threadId || ""),
        queryFn: () => getCourseDiscussionThreadDetail(courseId || "", threadId || ""),
        enabled: !!courseId && !!threadId && enabled,
    });

export const useCourseDiscussionThreadDetails = (courseId?: string, threadIds?: string[]) =>
    useQueries({
        queries: (threadIds || []).map((threadId) => ({
            queryKey: courseDiscussionThreadDetailKey(courseId || "", threadId),
            queryFn: () => getCourseDiscussionThreadDetail(courseId || "", threadId),
            enabled: !!courseId && !!threadId,
        })),
    });

export const useReplyCourseDiscussionThread = (courseId?: string, page?: number, size = 20) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({threadId, content}: {threadId: string; content: string}) =>
            replyCourseDiscussionThread(courseId || "", threadId, {content}),
        onSuccess: async (_, {threadId}) => {
            if (courseId) {
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: courseDiscussionUnreadCountKey(courseId)}),
                    page == null
                        ? queryClient.invalidateQueries({queryKey: ["course-discussion-inbox", courseId]})
                        : queryClient.invalidateQueries({queryKey: courseDiscussionInboxKey(courseId, page, size)}),
                    queryClient.invalidateQueries({queryKey: courseDiscussionThreadDetailKey(courseId, threadId)}),
                ]);
            }
            showSuccessToast("Reply yuborildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Reply yuborilmadi");
        },
    });
};

export const useReadCourseDiscussionThread = (courseId?: string, page?: number, size = 20) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (threadId: string) => markCourseDiscussionThreadAsRead(courseId || "", threadId),
        onSuccess: async (_, threadId) => {
            if (courseId) {
                await Promise.all([
                    queryClient.invalidateQueries({queryKey: courseDiscussionUnreadCountKey(courseId)}),
                    page == null
                        ? queryClient.invalidateQueries({queryKey: ["course-discussion-inbox", courseId]})
                        : queryClient.invalidateQueries({queryKey: courseDiscussionInboxKey(courseId, page, size)}),
                    queryClient.invalidateQueries({queryKey: courseDiscussionThreadDetailKey(courseId, threadId)}),
                ]);
            }
        },
        onError: (error) => {
            showErrorToast(error, "Thread read holatiga o'tmadi");
        },
    });
};
