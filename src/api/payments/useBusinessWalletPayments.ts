import {useMutation} from "@tanstack/react-query";
import {createBusinessWalletTopUpCheckout} from "./businessWalletPaymentsApi.ts";
import {showErrorToast} from "../../utils/toast.tsx";

export const useBusinessWalletTopUpCheckout = () =>
    useMutation({
        mutationFn: createBusinessWalletTopUpCheckout,
        onError: (error) => {
            showErrorToast(error, "Checkout ochilmadi");
        },
    });
