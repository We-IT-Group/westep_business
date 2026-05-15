import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {
    BusinessWalletTopUpCheckoutRequest,
    PaymentOrderResponse,
    PaymentCheckoutUrlResponse,
} from "../../types/types.ts";

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const asString = (value: unknown) =>
    typeof value === "string" ? value : "";

const normalizePaymentOrderResponse = (value: unknown): PaymentOrderResponse => {
    const record = asRecord(value);
    const nested = asRecord(record?.data) || asRecord(record?.order);
    const source = nested || record || {};

    return {
        orderId: asString(source.orderId).trim(),
    };
};

const normalizePaymentCheckoutUrlResponse = (value: unknown): PaymentCheckoutUrlResponse => {
    const record = asRecord(value);
    const nested = asRecord(record?.data) || asRecord(record?.checkout);
    const source = nested || record || {};

    return {
        checkoutUrl: asString(source.checkoutUrl).trim(),
    };
};

export const createBusinessWalletTopUpCheckout = async (payload: BusinessWalletTopUpCheckoutRequest) => {
    try {
        const {data} = await apiClient.post("/payments/business-wallet/payme/order", payload);
        return normalizePaymentOrderResponse(data);
    } catch (error) {
        throw parseApiError(error, "Top-up order yaratilmadi.");
    }
};

export const getPaymentCheckoutUrl = async (orderId: string) => {
    try {
        const {data} = await apiClient.get(`/payments/checkout/${orderId}`);
        return normalizePaymentCheckoutUrlResponse(data);
    } catch (error) {
        throw parseApiError(error, "Checkout link olinmadi.");
    }
};
