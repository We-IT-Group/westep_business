import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {addBusinessTeacher, getUsersById, addBusinessAssistant, deleteBusinessAssistant} from "./businessUserApi.ts";
import {getItem} from "../../utils/utils.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

export const useGetUsers = (businessId?: string) =>
    useQuery({
        queryKey: ["business-members", businessId],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            if (!businessId) throw new Error("No businessId");
            return await getUsersById(businessId);
        },
        enabled: !!businessId,
        retry: false,
    })


export const useAddBusinessTeacher = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addBusinessTeacher,
        onSuccess: async (message, variables) => {
            await qc.invalidateQueries({queryKey: ["business-members", variables.businessId]});
            showSuccessToast(typeof message === "string" ? message : "Teacher muvaffaqiyatli qo'shildi");
        },
        onError: (error) => {
            showErrorToast(error, "Teacher qo'shib bo'lmadi");
        },
    });
};

export const useAddBusinessAssistant = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addBusinessAssistant,
        onSuccess: async (message, variables) => {
            await qc.invalidateQueries({queryKey: ["business-members", variables.businessId]});
            showSuccessToast(typeof message === "string" ? message : "Assistant muvaffaqiyatli qo'shildi");
        },
        onError: (error) => {
            showErrorToast(error, "Assistant qo'shib bo'lmadi");
        },
    });
};

export const useDeleteAssistant = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteBusinessAssistant,
        onSuccess: async (message, variables) => {
            await qc.invalidateQueries({queryKey: ["business-members", variables.businessId]});
            showSuccessToast(typeof message === "string" ? message : "Assistant roldan chiqarildi");
        },
        onError: (error) => {
            showErrorToast(error, "Assistantni o'chirib bo'lmadi");
        },
    });
};
