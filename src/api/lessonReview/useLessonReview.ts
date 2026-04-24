import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    deleteDiscussion,
    createDiscussionReply,
    downloadAttachmentBlob,
    getHomeworkSubmissionsReview,
    getLessonDiscussions,
    getLessonTasksReview,
    getQuizResultsByLesson,
    getQuizResultsByTask,
    getQuizSessionDetail,
    reviewHomeworkSubmission,
    updateDiscussion,
} from "./lessonReviewApi.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

export const lessonDiscussionsKey = (lessonId: string) =>
    ["lesson-discussions", lessonId] as const;

export const lessonTasksReviewKey = (lessonId: string) =>
    ["lesson-review-tasks", lessonId] as const;

export const homeworkSubmissionsKey = (taskId: string) =>
    ["lesson-homework-submissions", taskId] as const;

export const quizResultsKey = (taskId: string) =>
    ["lesson-quiz-results", taskId] as const;

export const lessonQuizResultsKey = (lessonId: string) =>
    ["lesson-quiz-results-by-lesson", lessonId] as const;

export const quizSessionDetailKey = (sessionId: string) =>
    ["lesson-quiz-session", sessionId] as const;

export const useLessonDiscussions = (lessonId?: string) =>
    useQuery({
        queryKey: ["lesson-discussions", lessonId],
        queryFn: () => getLessonDiscussions(lessonId || ""),
        enabled: !!lessonId,
    });

export const useReplyDiscussion = (lessonId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({commentId, content}: { commentId: string; content: string }) =>
            createDiscussionReply(commentId, {content}),
        onSuccess: async () => {
            if (lessonId) {
                await queryClient.invalidateQueries({queryKey: lessonDiscussionsKey(lessonId)});
            }
            showSuccessToast("Reply yuborildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Reply yuborilmadi");
        },
    });
};

export const useUpdateDiscussion = (lessonId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({commentId, content}: {commentId: string; content: string}) =>
            updateDiscussion(commentId, {content}),
        onSuccess: async () => {
            if (lessonId) {
                await queryClient.invalidateQueries({queryKey: lessonDiscussionsKey(lessonId)});
            }
            showSuccessToast("Muhokama yangilandi.");
        },
        onError: (error) => {
            showErrorToast(error, "Muhokamani yangilab bo'lmadi");
        },
    });
};

export const useDeleteDiscussion = (lessonId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => deleteDiscussion(commentId),
        onSuccess: async () => {
            if (lessonId) {
                await queryClient.invalidateQueries({queryKey: lessonDiscussionsKey(lessonId)});
            }
            showSuccessToast("Muhokama o'chirildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Muhokamani o'chirib bo'lmadi");
        },
    });
};

export const useLessonTasksReview = (lessonId?: string) =>
    useQuery({
        queryKey: ["lesson-review-tasks", lessonId],
        queryFn: () => getLessonTasksReview(lessonId || ""),
        enabled: !!lessonId,
    });

export const useHomeworkSubmissions = (taskId?: string) =>
    useQuery({
        queryKey: ["lesson-homework-submissions", taskId],
        queryFn: () => getHomeworkSubmissionsReview(taskId || ""),
        enabled: !!taskId,
    });

export const useReviewHomeworkSubmission = (taskId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            submissionId,
            score,
            feedback,
            revisionRequested,
        }: {
            submissionId: string;
            score: number;
            feedback: string;
            revisionRequested: boolean;
        }) => reviewHomeworkSubmission(submissionId, {score, feedback, revisionRequested}),
        onSuccess: async () => {
            if (taskId) {
                await queryClient.invalidateQueries({queryKey: homeworkSubmissionsKey(taskId)});
            }
            showSuccessToast("Submission review saqlandi.");
        },
        onError: (error) => {
            showErrorToast(error, "Submission review saqlanmadi");
        },
    });
};

export const useQuizResults = (taskId?: string) =>
    useQuery({
        queryKey: ["lesson-quiz-results", taskId],
        queryFn: () => getQuizResultsByTask(taskId || ""),
        enabled: !!taskId,
    });

export const useQuizResultsByLesson = (lessonId?: string) =>
    useQuery({
        queryKey: ["lesson-quiz-results-by-lesson", lessonId],
        queryFn: () => getQuizResultsByLesson(lessonId || ""),
        enabled: !!lessonId,
    });

export const useQuizSessionDetail = (sessionId?: string, enabled = true) =>
    useQuery({
        queryKey: ["lesson-quiz-session", sessionId],
        queryFn: () => getQuizSessionDetail(sessionId || ""),
        enabled: !!sessionId && enabled,
    });

export const useDownloadAttachment = () =>
    useMutation({
        mutationFn: (attachmentId: string) => downloadAttachmentBlob(attachmentId),
        onError: (error) => {
            showErrorToast(error, "Fayl yuklab olinmadi");
        },
    });
