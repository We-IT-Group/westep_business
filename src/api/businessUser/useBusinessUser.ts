import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    addBusinessTeacher,
    getBusinessMembers,
    addBusinessAssistant,
    deleteBusinessAssistant,
    updateMemberAssignedCourses,
} from "./businessUserApi.ts";
import {getItem} from "../../utils/utils.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

export const useGetBusinessMembers = (businessId?: string) =>
    useQuery({
        queryKey: ["business-members-detail", businessId],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            if (!businessId) throw new Error("No businessId");
            return await getBusinessMembers(businessId);
        },
        enabled: !!businessId,
        retry: false,
    });

export const useGetUsers = (businessId?: string) =>
    useQuery({
        queryKey: ["business-members", businessId],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            if (!businessId) throw new Error("No businessId");
            const response = await getBusinessMembers(businessId);
            return response.members;
        },
        enabled: !!businessId,
        retry: false,
    });


export const useAddBusinessTeacher = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addBusinessTeacher,
        onSuccess: async (message, variables) => {
            await Promise.all([
                qc.invalidateQueries({queryKey: ["business-members", variables.businessId]}),
                qc.invalidateQueries({queryKey: ["business-members-detail", variables.businessId]}),
                qc.invalidateQueries({queryKey: ["course-staff"]}),
            ]);
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
            await Promise.all([
                qc.invalidateQueries({queryKey: ["business-members", variables.businessId]}),
                qc.invalidateQueries({queryKey: ["business-members-detail", variables.businessId]}),
                qc.invalidateQueries({queryKey: ["course-staff"]}),
            ]);
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
            await Promise.all([
                qc.invalidateQueries({queryKey: ["business-members", variables.businessId]}),
                qc.invalidateQueries({queryKey: ["business-members-detail", variables.businessId]}),
                qc.invalidateQueries({queryKey: ["course-staff"]}),
            ]);
            showSuccessToast(typeof message === "string" ? message : "Assistant roldan chiqarildi");
        },
        onError: (error) => {
            showErrorToast(error, "Assistantni o'chirib bo'lmadi");
        },
    });
};

export const useUpdateMemberAssignedCourses = (businessId?: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({userId, courseIds}: { userId: string; courseIds: string[] }) =>
            updateMemberAssignedCourses(userId, {courseIds}),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: ["business-members", businessId]}),
                qc.invalidateQueries({queryKey: ["business-members-detail", businessId]}),
                qc.invalidateQueries({queryKey: ["course-staff"]}),
            ]);
            showSuccessToast("Mas'ul kurslar yangilandi");
        },
        onError: (error) => {
            showErrorToast(error, "Mas'ul kurslarni yangilab bo'lmadi");
        },
    });
};
