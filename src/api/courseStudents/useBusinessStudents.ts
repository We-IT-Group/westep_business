import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {createBusinessStudent, getBusinessStudents} from "./businessStudentsApi.ts";

export const useBusinessStudents = () =>
    useQuery({
        queryKey: ["business-students"],
        queryFn: getBusinessStudents,
        retry: false,
    });

export const useCreateBusinessStudent = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createBusinessStudent,
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: ["course-students"]}),
                qc.invalidateQueries({queryKey: ["business-students"]}),
            ]);
        },
    });
};
