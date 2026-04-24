import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createLessonHomework, createLessonResource} from "./lessonMaterialsApi.ts";
import {showErrorToast} from "../../utils/toast.tsx";

export const useCreateLessonHomework = (lessonId: string | undefined) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createLessonHomework,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: ["lesson", lessonId]}),
                qc.invalidateQueries({queryKey: ["lessons"]}),
                qc.invalidateQueries({queryKey: ["lesson-review-tasks", lessonId]}),
            ]);
        },
        onError: (error) => {
            showErrorToast(error, "Homework yaratib bo'lmadi");
        },
    });
};

export const useCreateLessonResource = (lessonId: string | undefined) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createLessonResource,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: ["lesson", lessonId]}),
                qc.invalidateQueries({queryKey: ["lessons"]}),
                qc.invalidateQueries({queryKey: ["lesson-review-tasks", lessonId]}),
            ]);
        },
        onError: (error) => {
            showErrorToast(error, "Resurs yaratib bo'lmadi");
        },
    });
};
