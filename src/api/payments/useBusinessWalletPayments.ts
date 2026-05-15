import {useMutation} from "@tanstack/react-query";
import {createBusinessWalletTopUpCheckout, getPaymentCheckoutUrl} from "./businessWalletPaymentsApi.ts";
import {showErrorToast} from "../../utils/toast.tsx";

export const useBusinessWalletTopUpCheckout = () =>
    useMutation({
        mutationFn: async (payload: Parameters<typeof createBusinessWalletTopUpCheckout>[0]) => {
            const checkoutOrder = await createBusinessWalletTopUpCheckout(payload);
            const checkout = await getPaymentCheckoutUrl(checkoutOrder.orderId);

            return {
                ...checkoutOrder,
                checkoutUrl: checkout.checkoutUrl,
            };
        },
        onError: (error) => {
            showErrorToast(error, "Checkout ochilmadi");
        },
    });
