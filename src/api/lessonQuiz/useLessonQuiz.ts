import {useMutation, useQueryClient} from "@tanstack/react-query";
import {importLessonQuiz} from "./lessonQuizApi.ts";

export const useImportLessonQuiz = (lessonId: string | undefined) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: importLessonQuiz,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: ["lesson", lessonId]}),
                qc.invalidateQueries({queryKey: ["lessons"]}),
            ]);
        },
    });
};
