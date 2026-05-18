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

type BusinessWalletTransactionsTableProps = {
    transactions: BusinessWalletTransaction[];
};

export default function BusinessWalletTransactionsTable({transactions}: BusinessWalletTransactionsTableProps) {
    return (
        <div className="hidden overflow-x-auto lg:block">
            <div className="min-w-[1340px] px-4 pb-6">
                <div className="grid grid-cols-[1.6fr_1.2fr_1.3fr_0.9fr_0.9fr_0.9fr_1.1fr] gap-4 border-b border-slate-200 px-2 py-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-3">
                        <span>Student</span>
                        <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                            {transactions.length}
                        </span>
                    </div>
                    <div>Kurs</div>
                    <div>Modullar</div>
                    <div>Sotuv</div>
                    <div>Komissiya</div>
                    <div>Status</div>
                    <div>To‘langan vaqt</div>
                </div>

                <div className="space-y-2 pt-2">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.transactionId}
                            className="grid w-full grid-cols-[1.6fr_1.2fr_1.3fr_0.9fr_0.9fr_0.9fr_1.1fr] gap-4 rounded-2xl px-2 py-6 text-left transition hover:bg-white/70 dark:hover:bg-white/[0.03]"
                        >
                            <div className="min-w-0">
                                <div className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                                    {transaction.studentName || "Student noma’lum"}
                                </div>
                                {transaction.phoneNumber ? (
                                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {`+${transaction.phoneNumber}`}
                                    </div>
                                ) : null}
                            </div>

                            <div className="self-center">
                                <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {transaction.courseName || "Kurs noma’lum"}
                                </div>
                            </div>

                            <div className="flex flex-wrap content-start gap-2">
                                {transaction.moduleNames.length > 0 ? transaction.moduleNames.map((moduleName) => (
                                    <span
                                        key={`${transaction.transactionId}-${moduleName}`}
                                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {moduleName}
                                    </span>
                                )) : (
                                    <span className="text-sm text-slate-400 dark:text-slate-500">Modul yo‘q</span>
                                )}
                            </div>

                            <div className="self-center">
                                <div className="text-base font-semibold text-slate-950 dark:text-slate-100">{formatMoney(transaction.saleAmount)}</div>
                            </div>

                            <div className="self-center">
                                <div className="text-base font-semibold text-slate-950 dark:text-slate-100">{formatMoney(transaction.feeAmount)}</div>
                            </div>

                            <div className="self-center">
                                <span className={`inline-flex min-w-20 items-center justify-center rounded-full px-3 py-2 text-sm font-semibold ${getStatusTone(transaction.status)}`}>
                                    {transaction.status || "Noma’lum"}
                                </span>
                            </div>

                            <div className="self-center text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {formatDateTime(transaction.paidAt || transaction.createdAt)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
