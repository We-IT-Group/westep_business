import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createBusinessStudent} from "./businessStudentsApi.ts";

export const useCreateBusinessStudent = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createBusinessStudent,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: ["course-students"]});
        },
    });
};
