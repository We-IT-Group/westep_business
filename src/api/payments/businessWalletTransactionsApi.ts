import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {BusinessWalletTransaction} from "../../types/types.ts";

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

const asStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
};

const normalizeTransaction = (value: unknown): BusinessWalletTransaction | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const transactionId = asString(
        record.transactionId
        || record.id
        || record.paymentId
        || record.walletTransactionId,
    ).trim();

    if (!transactionId) {
        return null;
    }

    return {
        transactionId,
        orderId: asString(record.orderId || record.orderCode).trim() || undefined,
        phoneNumber: asString(record.phoneNumber || record.phone).trim() || undefined,
        studentId: asString(record.studentId).trim() || undefined,
        studentName: asString(record.studentName).trim() || undefined,
        courseId: asString(record.courseId).trim() || undefined,
        courseName: asString(record.courseName).trim() || undefined,
        moduleNames: asStringArray(record.moduleNames || record.modules),
        saleAmount: asNumber(record.saleAmount || record.amount || record.totalAmount || record.sum),
        feeAmount: asNumber(record.feeAmount || record.platformFee || record.fee),
        amount: asNumber(record.saleAmount || record.amount || record.totalAmount || record.sum),
        provider: asString(record.provider).trim() || undefined,
        currency: asString(record.currency).trim() || undefined,
        status: asString(record.status || record.state).trim() || undefined,
        displayName: asString(record.displayName || record.title || record.description).trim() || undefined,
        sourceType: asString(record.sourceType).trim() || undefined,
        paidAt: asString(record.paidAt).trim() || undefined,
        createdAt: asString(record.createdAt || record.transactionTime || record.paidAt).trim() || undefined,
    };
};

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

export const getBusinessWalletTransactions = async () => {
    try {
        const {data} = await apiClient.get("/business/wallet/transactions");
        return extractCollection(data)
            .map((item) => normalizeTransaction(item))
            .filter((item): item is BusinessWalletTransaction => item !== null);
    } catch (error) {
        throw parseApiError(error, "Sotuvlar ro‘yxati yuklanmadi.");
    }
};
