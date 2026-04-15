import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getModulesById, getAllModules, addModules, updateModules, deleteModules} from "./moduleApi.ts";
import {getItem} from "../../utils/utils.ts";
import {showErrorToast} from "../../utils/toast.tsx";

export const useGetModules = (courseId: string | undefined) =>
    useQuery({
        queryKey: ["modules", courseId],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            if (!courseId) throw new Error("No courseId");

            return await getAllModules(courseId);
        },
        retry: false,
        enabled: !!courseId,
    });

export const useGetModuleById = (id: string | undefined) =>
    useQuery({
        queryKey: ["module", id],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getModulesById(id);
        },
        enabled: !!id,
        retry: false,
    });

export const useAddModule = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addModules,
        onSuccess: async () => {
            qc.invalidateQueries({
                queryKey: ["modules"]
            });
        },
        onError: (error) => {
            showErrorToast(error, "Modul qo'shib bo'lmadi");
        },
    });
};

export const useUpdateModule = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateModules,
        onSuccess: async () => {
            qc.invalidateQueries({
                queryKey: ["modules"]
            });
        },
        onError: (error) => {
            showErrorToast(error, "Modulni yangilab bo'lmadi");
        },
    });
};

export const useDeleteModule = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteModules,
        onSuccess: async () => {
            qc.invalidateQueries({
                queryKey: ["modules"]
            });
        },
        onError: (error) => {
            showErrorToast(error, "Modulni o'chirib bo'lmadi");
        },
    });
};
