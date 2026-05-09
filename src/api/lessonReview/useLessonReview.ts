import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    createLessonDiscussion,
    createLessonReview,
    getCourseDiscussionsPage,
    getCourseQuizResults,
    getCourseQuizSessionDetail,
    deleteDiscussion,
    createDiscussionReply,
    downloadAttachmentBlob,
    getLessonDiscussionsPage,
    getLessonReviewsPage,
    getMyHomeworkSubmissions,
    getMyHomeworkSubmissionsByLesson,
    getQuizResultsByCourseLessons,
    getStudentQuizResults,
    getStudentQuizResultsByLesson,
    getStudentQuizSessionDetail,
    getHomeworkSubmissionsReview,
    getLessonDiscussions,
    getLessonTasksReview,
    getQuizResultsByLesson,
    getQuizResultsByTask,
    getQuizSessionDetail,
    reviewHomeworkSubmission,
    submitHomework,
    updateMyLessonReview,
    updateDiscussion,
} from "./lessonReviewApi.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

export const lessonDiscussionsKey = (lessonId: string) =>
    ["lesson-discussions", lessonId] as const;

export const lessonDiscussionsPageKey = (lessonId: string, page: number, size: number) =>
    ["lesson-discussions", lessonId, page, size] as const;

export const courseDiscussionsPageKey = (courseId: string, page: number, size: number) =>
    ["course-discussions", courseId, page, size] as const;

export const lessonTasksReviewKey = (lessonId: string) =>
    ["lesson-review-tasks", lessonId] as const;

export const homeworkSubmissionsKey = (taskId: string) =>
    ["lesson-homework-submissions", taskId] as const;

export const myHomeworkSubmissionsKey = ["my-homework-submissions"] as const;

export const myHomeworkSubmissionsByLessonKey = (lessonId: string) =>
    ["my-homework-submissions", lessonId] as const;

export const lessonReviewsKey = (lessonId: string, page: number, size: number) =>
    ["lesson-reviews", lessonId, page, size] as const;

export const quizResultsKey = (taskId: string) =>
    ["lesson-quiz-results", taskId] as const;

export const myQuizResultsKey = ["my-lesson-quiz-results"] as const;

export const myLessonQuizResultsKey = (lessonId: string) =>
    ["my-lesson-quiz-results", lessonId] as const;

export const myQuizSessionDetailKey = (sessionId: string) =>
    ["my-lesson-quiz-session", sessionId] as const;

export const lessonQuizResultsKey = (lessonId: string) =>
    ["lesson-quiz-results-by-lesson", lessonId] as const;

export const courseLessonQuizResultsKey = (courseId: string) =>
    ["lesson-quiz-results-by-course", courseId] as const;

export const courseQuizManagerResultsKey = (courseId: string) =>
    ["course-quiz-manager-results", courseId] as const;

export const courseQuizManagerSessionDetailKey = (courseId: string, sessionId: string) =>
    ["course-quiz-manager-session", courseId, sessionId] as const;

export const quizSessionDetailKey = (sessionId: string) =>
    ["lesson-quiz-session", sessionId] as const;

export const useLessonDiscussions = (lessonId?: string) =>
    useQuery({
        queryKey: ["lesson-discussions", lessonId],
        queryFn: () => getLessonDiscussions(lessonId || ""),
        enabled: !!lessonId,
    });

export const useLessonDiscussionsPage = (lessonId?: string, page = 0, size = 20, enabled = true) =>
    useQuery({
        queryKey: lessonDiscussionsPageKey(lessonId || "", page, size),
        queryFn: () => getLessonDiscussionsPage(lessonId || "", page, size),
        enabled: !!lessonId && enabled,
        placeholderData: (previousData) => previousData,
    });

export const useCourseDiscussionsPage = (courseId?: string, page = 0, size = 20, enabled = true) =>
    useQuery({
        queryKey: courseDiscussionsPageKey(courseId || "", page, size),
        queryFn: () => getCourseDiscussionsPage(courseId || "", page, size),
        enabled: !!courseId && enabled,
        placeholderData: (previousData) => previousData,
    });

export const useCreateDiscussion = (lessonId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({content}: {content: string}) => createLessonDiscussion(lessonId || "", {content}),
        onSuccess: async () => {
            if (lessonId) {
                await queryClient.invalidateQueries({queryKey: lessonDiscussionsKey(lessonId)});
            }
            showSuccessToast("Discussion yuborildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Discussion yuborilmadi");
        },
    });
};

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

export const useReplyCourseDiscussion = (courseId?: string, page?: number, size = 20) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({commentId, content}: { commentId: string; content: string }) =>
            createDiscussionReply(commentId, {content}),
        onSuccess: async () => {
            if (courseId) {
                await queryClient.invalidateQueries({queryKey: page == null ? ["course-discussions", courseId] : courseDiscussionsPageKey(courseId, page, size)});
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

export const useUpdateCourseDiscussion = (courseId?: string, page?: number, size = 20) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({commentId, content}: {commentId: string; content: string}) =>
            updateDiscussion(commentId, {content}),
        onSuccess: async () => {
            if (courseId) {
                await queryClient.invalidateQueries({queryKey: page == null ? ["course-discussions", courseId] : courseDiscussionsPageKey(courseId, page, size)});
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

export const useDeleteCourseDiscussion = (courseId?: string, page?: number, size = 20) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => deleteDiscussion(commentId),
        onSuccess: async () => {
            if (courseId) {
                await queryClient.invalidateQueries({queryKey: page == null ? ["course-discussions", courseId] : courseDiscussionsPageKey(courseId, page, size)});
            }
            showSuccessToast("Muhokama o'chirildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Muhokamani o'chirib bo'lmadi");
        },
    });
};

export const useLessonTasksReview = (lessonId?: string, enabled = true) =>
    useQuery({
        queryKey: ["lesson-review-tasks", lessonId],
        queryFn: () => getLessonTasksReview(lessonId || ""),
        enabled: !!lessonId && enabled,
    });

export const useHomeworkSubmissions = (taskId?: string) =>
    useQuery({
        queryKey: ["lesson-homework-submissions", taskId],
        queryFn: () => getHomeworkSubmissionsReview(taskId || ""),
        enabled: !!taskId,
    });

export const useSubmitHomework = (taskId?: string, lessonId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            comment,
            link,
            files,
            file,
        }: {
            comment?: string;
            link?: string;
            files?: File[];
            file?: File | null;
        }) => submitHomework(taskId || "", {comment, link, files, file}),
        onSuccess: async () => {
            await Promise.all([
                lessonId ? queryClient.invalidateQueries({queryKey: myHomeworkSubmissionsByLessonKey(lessonId)}) : Promise.resolve(),
                queryClient.invalidateQueries({queryKey: myHomeworkSubmissionsKey}),
                taskId ? queryClient.invalidateQueries({queryKey: homeworkSubmissionsKey(taskId)}) : Promise.resolve(),
            ]);
            showSuccessToast("Homework yuborildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Homework yuborilmadi");
        },
    });
};

export const useMyHomeworkSubmissions = (enabled = true) =>
    useQuery({
        queryKey: myHomeworkSubmissionsKey,
        queryFn: getMyHomeworkSubmissions,
        enabled,
    });

export const useMyHomeworkSubmissionsByLesson = (lessonId?: string, enabled = true) =>
    useQuery({
        queryKey: myHomeworkSubmissionsByLessonKey(lessonId || ""),
        queryFn: () => getMyHomeworkSubmissionsByLesson(lessonId || ""),
        enabled: !!lessonId && enabled,
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

export const useMyQuizResults = (enabled = true) =>
    useQuery({
        queryKey: myQuizResultsKey,
        queryFn: getStudentQuizResults,
        enabled,
    });

export const useMyQuizResultsByLesson = (lessonId?: string, enabled = true) =>
    useQuery({
        queryKey: myLessonQuizResultsKey(lessonId || ""),
        queryFn: () => getStudentQuizResultsByLesson(lessonId || ""),
        enabled: !!lessonId && enabled,
    });

export const useMyQuizSessionDetail = (sessionId?: string, enabled = true) =>
    useQuery({
        queryKey: myQuizSessionDetailKey(sessionId || ""),
        queryFn: () => getStudentQuizSessionDetail(sessionId || ""),
        enabled: !!sessionId && enabled,
    });

export const useQuizResultsByLesson = (lessonId?: string) =>
    useQuery({
        queryKey: ["lesson-quiz-results-by-lesson", lessonId],
        queryFn: () => getQuizResultsByLesson(lessonId || ""),
        enabled: !!lessonId,
    });

export const useQuizResultsByCourseLessons = (courseId?: string, lessonIds: string[] = [], enabled = true) =>
    useQuery({
        queryKey: ["lesson-quiz-results-by-course", courseId, ...lessonIds],
        queryFn: () => getQuizResultsByCourseLessons(lessonIds),
        enabled: !!courseId && lessonIds.length > 0 && enabled,
    });

export const useCourseQuizResults = (courseId?: string, enabled = true) =>
    useQuery({
        queryKey: courseQuizManagerResultsKey(courseId || ""),
        queryFn: () => getCourseQuizResults(courseId || ""),
        enabled: !!courseId && enabled,
    });

export const useCourseQuizSessionDetail = (courseId?: string, sessionId?: string, enabled = true) =>
    useQuery({
        queryKey: courseQuizManagerSessionDetailKey(courseId || "", sessionId || ""),
        queryFn: () => getCourseQuizSessionDetail(courseId || "", sessionId || ""),
        enabled: !!courseId && !!sessionId && enabled,
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

export const useLessonReviewsPage = (lessonId?: string, page = 0, size = 10, enabled = true) =>
    useQuery({
        queryKey: lessonReviewsKey(lessonId || "", page, size),
        queryFn: () => getLessonReviewsPage(lessonId || "", page, size),
        enabled: !!lessonId && enabled,
        placeholderData: (previousData) => previousData,
    });

export const useCreateLessonReview = (lessonId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({comment}: {comment: string}) => createLessonReview(lessonId || "", {comment}),
        onSuccess: async () => {
            if (lessonId) {
                await queryClient.invalidateQueries({queryKey: ["lesson-reviews", lessonId]});
            }
            showSuccessToast("Review yuborildi.");
        },
        onError: (error) => {
            showErrorToast(error, "Review yuborilmadi");
        },
    });
};

export const useUpdateMyLessonReview = (lessonId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({comment}: {comment: string}) => updateMyLessonReview(lessonId || "", {comment}),
        onSuccess: async () => {
            if (lessonId) {
                await queryClient.invalidateQueries({queryKey: ["lesson-reviews", lessonId]});
            }
            showSuccessToast("Review yangilandi.");
        },
        onError: (error) => {
            showErrorToast(error, "Review yangilanmadi");
        },
    });
};
