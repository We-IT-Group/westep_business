import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {BusinessWalletTopUpCheckoutRequest, PaymentCheckoutResponse} from "../../types/types.ts";

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const asString = (value: unknown) =>
    typeof value === "string" ? value : "";

const normalizePaymentCheckoutResponse = (value: unknown): PaymentCheckoutResponse => {
    const record = asRecord(value);

    return {
        provider: asString(record?.provider).trim() || "PAYME",
        checkoutUrl: asString(record?.checkoutUrl).trim(),
        transactionId: asString(record?.transactionId).trim(),
        orderId: asString(record?.orderId).trim(),
    };
};

export const createBusinessWalletTopUpCheckout = async (payload: BusinessWalletTopUpCheckoutRequest) => {
    try {
        const {data} = await apiClient.post("/payments/business-wallet/payme/checkout", payload);
        return normalizePaymentCheckoutResponse(data);
    } catch (error) {
        throw parseApiError(error, "Payme checkout ochib bo‘lmadi.");
    }
};
