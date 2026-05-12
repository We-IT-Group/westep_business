import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {deleteMyDevice, getMyDevices} from "./userDevicesApi.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

export const useMyDevices = () =>
    useQuery({
        queryKey: ["my-devices"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) {
                throw new Error("No token");
            }

            return await getMyDevices();
        },
        retry: false,
    });

export const useDeleteMyDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMyDevice,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["my-devices"]});
            showSuccessToast("Qurilma sessiyasi o‘chirildi");
        },
        onError: (error) => {
            showErrorToast(error, "Qurilmani o‘chirib bo‘lmadi");
        },
    });
};
