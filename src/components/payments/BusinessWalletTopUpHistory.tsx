import {AlertCircle, Clock3, RefreshCcw, Wallet} from "lucide-react";
import {useBusinessWalletTopUpTransactions} from "../../api/payments/useBusinessWalletTopUpTransactions.ts";
import {parseApiError} from "../../utils/apiError.ts";

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

export default function BusinessWalletTopUpHistory() {
    const historyQuery = useBusinessWalletTopUpTransactions();
    const parsedError = historyQuery.error ? parseApiError(historyQuery.error) : null;
    const transactions = historyQuery.data || [];

    return (
        <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/45">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Top-up tarixi</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Hisob to‘ldirishlar tarixi</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                        Payme orqali biznes balansiga tushgan to‘lovlar shu yerda ko‘rinadi.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void historyQuery.refetch()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                >
                    <RefreshCcw className="h-4 w-4"/>
                    Yangilash
                </button>
            </div>

            {historyQuery.isLoading ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                    {Array.from({length: 4}).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-[22px] border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-950/70"
                        />
                    ))}
                </div>
            ) : historyQuery.isError ? (
                <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50/80 px-6 py-10 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm dark:bg-slate-950 dark:text-rose-300">
                        <AlertCircle className="h-6 w-6"/>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">Top-up tarixi yuklanmadi</h4>
                    <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                        {parsedError?.message || "Hisob to‘ldirishlar tarixini olib bo‘lmadi."}
                    </p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                        <Clock3 className="h-6 w-6"/>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">Top-up tarixi hali yo‘q</h4>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Birinchi to‘lovdan keyin tarix shu bo‘limda ko‘rinadi.
                    </p>
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    {transactions.map((transaction) => (
                        <article
                            key={transaction.transactionId}
                            className="rounded-[24px] border border-slate-200 bg-white/88 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-[0_18px_45px_rgba(2,6,23,0.35)]"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                            <Wallet className="h-5 w-5"/>
                                        </span>
                                        <div>
                                            <h4 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-100">
                                                {formatMoney(transaction.amount)}
                                            </h4>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                {transaction.description || "Biznes balansiga top-up"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusTone(transaction.status)}`}>
                                            {transaction.status || "Noma’lum"}
                                        </span>
                                        {transaction.provider ? (
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                {transaction.provider}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:min-w-[680px]">
                                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Oldingi balans</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatMoney(transaction.balanceBefore)}</p>
                                    </div>
                                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Keyingi balans</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatMoney(transaction.balanceAfter)}</p>
                                    </div>
                                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">To‘langan vaqt</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(transaction.paidAt)}</p>
                                    </div>
                                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/65">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Yaratilgan vaqt</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateTime(transaction.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
