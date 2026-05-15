import {useMutation} from "@tanstack/react-query";
import {createBusinessWalletTopUpCheckout, getPaymentCheckoutUrl} from "./businessWalletPaymentsApi.ts";
import {showErrorToast} from "../../utils/toast.tsx";
import {ApiRequestError} from "../../utils/apiError.ts";

export const useBusinessWalletTopUpCheckout = () =>
    useMutation({
        mutationFn: async (payload: Parameters<typeof createBusinessWalletTopUpCheckout>[0]) => {
            const checkoutOrder = await createBusinessWalletTopUpCheckout(payload);
            if (!checkoutOrder.orderId) {
                throw new ApiRequestError("Top-up orderId qaytmadi.");
            }

            const checkout = await getPaymentCheckoutUrl(checkoutOrder.orderId);
            if (!checkout.checkoutUrl) {
                throw new ApiRequestError("Checkout URL qaytmadi.");
            }

            return {
                ...checkoutOrder,
                checkoutUrl: checkout.checkoutUrl,
            };
        },
        onError: (error) => {
            showErrorToast(error, "Checkout ochilmadi");
        },
    });
