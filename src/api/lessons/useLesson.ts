import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getLessonsById, getAllLessons, addLessons, updateLessons, deleteLessons} from "./lessonApi.ts";
import {getItem} from "../../utils/utils.ts";
import {Module} from "../../types/types.ts";
import {useNavigate} from "react-router-dom";
import {showErrorToast} from "../../utils/toast.tsx";

export const useGetLessons = (moduleId: string | undefined, openLesson: boolean) =>
    useQuery({
        queryKey: ["lessons", moduleId],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            if (!moduleId) throw new Error("No courseId");

            return await getAllLessons(moduleId);
        },
        retry: false,
        enabled: openLesson,
    });

export const useGetLessonById = (id: string | undefined) =>
    useQuery({
        queryKey: ["lesson", id],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getLessonsById(id);
        },
        retry: false,
        enabled: !!id
    });

export const useAddLesson = (courseId: string | undefined) => { // lessonCount bu yerda shart emas
    const qc = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: addLessons,
        onSuccess: (newLesson) => {
            qc.setQueryData(["modules", courseId], (oldModules: Module[] | undefined) => {
                if (!oldModules) {
                    console.log("Kesh topilmadi! Kalitni tekshiring.");
                    return undefined;
                }

                return oldModules.map((module) => {
                    if (module.id === newLesson.moduleId) {
                        return {
                            ...module,
                            lessonCount: (Number(module.lessonCount) || 0) + 1,
                        };
                    }
                    return module;
                });
            });
            qc.invalidateQueries({queryKey: ["lessons"]});
            navigate(`/courses/details/${courseId}/updateLesson/${newLesson.id}`, {state: {moduleId: newLesson.moduleId}});
        },
        onError: (error: any) => {
            console.error("Xatolik:", error);
        },
    });
};

export const useUpdateLesson = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateLessons,
        onSuccess: async () => {
            qc.invalidateQueries({
                queryKey: ["lessons"]
            });
        },
        onError: (error) => {
            showErrorToast(error, "Lessonni yangilab bo'lmadi");
        },
    });
};

export const useDeleteLesson = (courseId: string | undefined, moduleId: string) => {
    const qc = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: deleteLessons,
        onSuccess: () => {
            const deletedLessonModuleId = moduleId
            console.log(courseId)

            qc.setQueryData(["modules", courseId], (oldModules: Module[] | undefined) => {
                if (!oldModules) return [];

                return oldModules.map((module) => {
                    if (module.id === deletedLessonModuleId) {
                        return {
                            ...module,
                            lessonCount: Math.max(0, (module.lessonCount || 0) - 1),
                        };
                    }
                    return module;
                });
            });

            qc.invalidateQueries({queryKey: ["lessons"]});
            navigate(`/courses/details/${courseId}`);
        },
        onError: (error) => {
            showErrorToast(error, "Lessonni o'chirib bo'lmadi");
        },
    });
};
