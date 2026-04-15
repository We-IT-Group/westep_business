import {AxiosError} from "axios";
import apiClient from "../apiClient.ts";

type ImportLessonQuizPayload = {
    lessonId?: string;
    moduleId?: string;
    file: File;
    useModuleEndpoint?: boolean;
};

export const importLessonQuiz = async ({
    lessonId,
    moduleId,
    file,
    useModuleEndpoint,
}: ImportLessonQuizPayload) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const endpoint = useModuleEndpoint
            ? `/module-tests/module/${moduleId}/import`
            : `/lesson-tasks/lesson/${lessonId}/quiz/import`;

        const {data} = await apiClient.post(
            endpoint,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        const message = err.response?.data?.message || "Quiz import qilishda xatolik yuz berdi.";
        throw new Error(message);
    }
};
