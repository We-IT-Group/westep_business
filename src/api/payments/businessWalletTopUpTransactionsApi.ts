import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {BusinessWalletTopUpTransaction} from "../../types/types.ts";

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const asString = (value: unknown) =>
    typeof value === "string" ? value : "";

const asNumber = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
        ? value
        : typeof value === "string" && value.trim() && Number.isFinite(Number(value))
            ? Number(value)
            : 0;

const extractCollection = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
        return value;
    }

    const record = asRecord(value);
    if (!record) {
        return [];
    }

    if (Array.isArray(record.items)) {
        return record.items;
    }
    if (Array.isArray(record.content)) {
        return record.content;
    }
    if (Array.isArray(record.data)) {
        return record.data;
    }
    if (Array.isArray(record.transactions)) {
        return record.transactions;
    }

    return [];
};

const normalizeTopUpTransaction = (value: unknown): BusinessWalletTopUpTransaction | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const transactionId = asString(record.transactionId || record.id).trim();
    if (!transactionId) {
        return null;
    }

    return {
        transactionId,
        orderId: asString(record.orderId).trim() || undefined,
        amount: asNumber(record.amount || record.totalAmount || record.sum),
        currency: asString(record.currency || record.currencyCode).trim() || undefined,
        provider: asString(record.provider).trim() || undefined,
        status: asString(record.status || record.state).trim() || undefined,
        balanceBefore: asNumber(record.balanceBefore),
        balanceAfter: asNumber(record.balanceAfter),
        description: asString(record.description || record.title).trim() || undefined,
        paidAt: asString(record.paidAt).trim() || undefined,
        createdAt: asString(record.createdAt).trim() || undefined,
    };
};

export const getBusinessWalletTopUpTransactions = async () => {
    try {
        const {data} = await apiClient.get("/business/wallet/top-up-transactions");
        return extractCollection(data)
            .map((item) => normalizeTopUpTransaction(item))
            .filter((item): item is BusinessWalletTopUpTransaction => item !== null);
    } catch (error) {
        throw parseApiError(error, "Top-up tarixi yuklanmadi.");
    }
};
