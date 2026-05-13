import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {BusinessWalletSummary} from "../../types/types.ts";

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

const asNumber = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
        ? value
        : typeof value === "string" && value.trim() && Number.isFinite(Number(value))
            ? Number(value)
            : 0;

const asBoolean = (value: unknown) => typeof value === "boolean" ? value : undefined;
const asString = (value: unknown) => typeof value === "string" ? value : undefined;

const normalizeBusinessWalletSummary = (value: unknown): BusinessWalletSummary => {
    const record = asRecord(value);
    const nested = asRecord(record?.data) || asRecord(record?.wallet) || asRecord(record?.businessWallet);

    const source = nested || record || {};

    return {
        balance: asNumber(source.balance || source.amount || source.currentBalance || source.availableBalance),
        currency: asString(source.currency || source.currencyCode),
        salesBlocked: asBoolean(source.salesBlocked),
    };
};

export const getBusinessWallet = async () => {
    try {
        const {data} = await apiClient.get("/business/wallet");
        return normalizeBusinessWalletSummary(data);
    } catch (error) {
        throw parseApiError(error, "Biznes balansi yuklanmadi.");
    }
};
