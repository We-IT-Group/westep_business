import type {BusinessWalletTransaction} from "../../types/types.ts";

const formatMoney = (value: number) =>
    `${Math.round(value).toLocaleString("fr-FR")} so‘m`;

const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {dateStyle: "medium", timeStyle: "short"}).format(date);
};

const getStatusTone = (status?: string) => {
    const normalized = (status || "").toUpperCase();
    if (normalized.includes("SUCCESS") || normalized.includes("PAID") || normalized.includes("COMPLETED")) {
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    }
    if (normalized.includes("PENDING") || normalized.includes("CREATED")) {
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    }
    if (normalized.includes("FAILED") || normalized.includes("CANCEL")) {
        return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
    }
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
};

type BusinessWalletTransactionsCardListProps = {
    transactions: BusinessWalletTransaction[];
};

export default function BusinessWalletTransactionsCardList({transactions}: BusinessWalletTransactionsCardListProps) {
    return (
        <div className="grid gap-4 lg:hidden">
            {transactions.map((transaction) => (
                <article
                    key={transaction.transactionId}
                    className="rounded-[24px] border border-slate-200 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_18px_45px_rgba(2,6,23,0.35)]"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                                {transaction.studentName || "Student noma’lum"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {transaction.courseName || "Kurs noma’lum"}
                            </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusTone(transaction.status)}`}>
                            {transaction.status || "Noma’lum"}
                        </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Sotuv summasi</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatMoney(transaction.saleAmount)}</p>
                        </div>
                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Komissiya</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatMoney(transaction.feeAmount)}</p>
                        </div>
                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">To‘langan vaqt</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(transaction.paidAt || transaction.createdAt)}</p>
                        </div>
                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65 sm:col-span-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Modullar</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {transaction.moduleNames.length > 0 ? transaction.moduleNames.map((moduleName) => (
                                    <span
                                        key={`${transaction.transactionId}-${moduleName}`}
                                        className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                    >
                                        {moduleName}
                                    </span>
                                )) : (
                                    <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">Modul yo‘q</span>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
