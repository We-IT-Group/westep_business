import type {TrackingLinkAnalytics, TrackingSourceType} from "../../../types/types.ts";
import type {LinkStats} from "./types.ts";

export const sourceTypeOptions: Array<{value: TrackingSourceType; label: string}> = [
    {value: "BUSINESS_LINK", label: "Biznes linki"},
    {value: "WESTEP_LANDING", label: "Westep landing"},
    {value: "WESTEP_ADS", label: "Westep reklama"},
    {value: "TEACHER_LINK", label: "O‘qituvchi linki"},
];

export const defaultSourceTypes: TrackingSourceType[] = ["BUSINESS_LINK", "WESTEP_LANDING", "WESTEP_ADS"];
export const analyticsOnlySourceTypes: TrackingSourceType[] = ["WESTEP_LANDING", "WESTEP_ADS"];

export const analyticsLabels: Array<{label: string; key: keyof TrackingLinkAnalytics; money?: boolean}> = [
    {label: "Bosishlar", key: "clicks"},
    {label: "Noyob bosishlar", key: "uniqueClicks"},
    {label: "Lidlar", key: "leads"},
    {label: "Checkout boshlangan", key: "checkoutStarted"},
    {label: "To‘langan xaridlar", key: "paidPurchases"},
    {label: "Tekin modullar", key: "freeEnrolls"},
    {label: "To‘langan summa", key: "paidAmount", money: true},
    {label: "Komissiya", key: "appliedFeeAmount", money: true},
    {label: "Sof summa", key: "netAmount", money: true},
    {label: "Qaytarilganlar", key: "refunded"},
    {label: "Qaytarilgan summa", key: "refundedAmount", money: true},
];

const formatGroupedNumber = (value?: number): string =>
    Math.round(value || 0)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const formatMoney = (amount?: number): string =>
    `${formatGroupedNumber(amount)} so'm`;

export const getSourceLabel = (sourceType?: TrackingSourceType) =>
    sourceTypeOptions.find((option) => option.value === sourceType)?.label || "Belgilanmagan";

export const getBadgeStyle = (value: string) => {
    switch (value) {
        case "BUSINESS_OWNER":
            return "bg-sky-50 text-sky-700";
        case "TEACHER":
            return "bg-violet-50 text-violet-700";
        case "BUSINESS_LINK":
            return "bg-slate-100 text-slate-700";
        case "WESTEP_LANDING":
            return "bg-emerald-50 text-emerald-700";
        case "WESTEP_ADS":
            return "bg-amber-50 text-amber-700";
        case "TEACHER_LINK":
            return "bg-violet-50 text-violet-700";
        case "PAID":
            return "bg-emerald-50 text-emerald-700";
        case "FREE":
            return "bg-slate-100 text-slate-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

export const getPricingLabel = (stats: LinkStats) => {
    const paidPurchases = stats.paidPurchases || 0;
    const paidAmount = stats.paidAmount || 0;
    const freeEnrolls = stats.freeEnrolls || 0;

    if (paidPurchases > 0 || paidAmount > 0) return "PAID";
    if (freeEnrolls > 0) return "FREE";
    return "PAID";
};

export const readMetricValue = (stats: LinkStats, key: keyof TrackingLinkAnalytics, money?: boolean) => {
    const value = stats[key];
    if (money) {
        return formatMoney(typeof value === "number" ? value : 0);
    }
    return typeof value === "number" ? value.toLocaleString("uz-UZ") : "0";
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};
