import {useMemo, useState} from "react";
import {AlertCircle, CreditCard, LoaderCircle, RefreshCcw, SearchX, Wallet} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useBusinessWalletTransactions} from "../../api/payments/useBusinessWalletTransactions.ts";
import {parseApiError} from "../../utils/apiError.ts";
import BusinessWalletTransactionsFilters from "../../components/payments/BusinessWalletTransactionsFilters.tsx";
import BusinessWalletTransactionsCardList from "../../components/payments/BusinessWalletTransactionsCardList.tsx";
import BusinessWalletTransactionsTable from "../../components/payments/BusinessWalletTransactionsTable.tsx";

const formatMoney = (value: number) =>
    `${new Intl.NumberFormat("uz-UZ").format(Math.round(value))} so‘m`;

export default function Sales() {
    const [search, setSearch] = useState("");
    const transactionsQuery = useBusinessWalletTransactions();

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();
        const transactions = transactionsQuery.data || [];

        if (!query) {
            return transactions;
        }

        return transactions.filter((transaction) => {
            const titleMatched = (transaction.displayName || transaction.provider || "").toLowerCase().includes(query);
            const phoneMatched = (transaction.phoneNumber || "").toLowerCase().includes(query);
            const statusMatched = (transaction.status || "").toLowerCase().includes(query);
            const orderMatched = (transaction.orderId || "").toLowerCase().includes(query);
            return titleMatched || phoneMatched || statusMatched || orderMatched;
        });
    }, [search, transactionsQuery.data]);

    const totals = useMemo(() => {
        return filteredTransactions.reduce(
            (accumulator, transaction) => ({
                amount: accumulator.amount + transaction.amount,
                completed: accumulator.completed + (((transaction.status || "").toUpperCase().includes("SUCCESS") || (transaction.status || "").toUpperCase().includes("PAID")) ? 1 : 0),
            }),
            {amount: 0, completed: 0},
        );
    }, [filteredTransactions]);

    const summaryCards = [
        {
            label: "Tranzaksiyalar",
            value: filteredTransactions.length,
            icon: Wallet,
            tone: "from-sky-500/18 via-cyan-400/10 to-white dark:from-sky-500/18 dark:via-cyan-500/10 dark:to-slate-950",
            iconTone: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
        },
        {
            label: "Jami summa",
            value: formatMoney(totals.amount),
            icon: CreditCard,
            tone: "from-emerald-500/18 via-teal-400/10 to-white dark:from-emerald-500/18 dark:via-teal-500/10 dark:to-slate-950",
            iconTone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        },
        {
            label: "Muvaffaqiyatli",
            value: totals.completed,
            icon: Wallet,
            tone: "from-violet-500/18 via-fuchsia-400/10 to-white dark:from-violet-500/18 dark:via-fuchsia-500/10 dark:to-slate-950",
            iconTone: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
        },
    ];

    const parsedError = transactionsQuery.error ? parseApiError(transactionsQuery.error) : null;
    const isForbidden = parsedError?.status === 403;

    return (
        <div className="mx-auto max-w-[1560px] space-y-5 pb-10">
            <PageMeta
                title="Sotuvlar"
                description="Business wallet tranzaksiyalari va sotuvlar tarixi."
            />

            <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className={`overflow-hidden rounded-[24px] border border-white/70 bg-gradient-to-br ${card.tone} p-5 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-800`}
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-[16px] shadow-sm ${card.iconTone}`}>
                                <Icon className="h-5 w-5"/>
                            </div>
                            <div className="mt-5">
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{card.value}</p>
                                <p className="mt-1.5 text-base font-semibold leading-5 text-slate-900 dark:text-slate-100">{card.label}</p>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/82 dark:shadow-[0_18px_45px_rgba(2,6,23,0.38)]">
                <div className="p-4 sm:p-5">
                    <BusinessWalletTransactionsFilters
                        search={search}
                        onSearchChange={setSearch}
                        totalCount={filteredTransactions.length}
                    />
                </div>

                {transactionsQuery.isLoading ? (
                    <div className="grid gap-4 px-4 pb-5 sm:px-5 lg:grid-cols-2 xl:grid-cols-3">
                        {Array.from({length: 6}).map((_, index) => (
                            <div
                                key={index}
                                className="h-44 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/70"
                            />
                        ))}
                    </div>
                ) : transactionsQuery.isError ? (
                    <div className="px-5 pb-6">
                        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-6 py-12 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm dark:bg-slate-950 dark:text-rose-300">
                                <AlertCircle className="h-6 w-6"/>
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">
                                {isForbidden ? "Bu sahifaga kirish ruxsati yo‘q" : "Sotuvlar yuklanmadi"}
                            </h3>
                            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                                {parsedError?.message || "Tranzaksiyalar ro‘yxatini olib bo‘lmadi."}
                            </p>
                            {!isForbidden ? (
                                <button
                                    type="button"
                                    onClick={() => void transactionsQuery.refetch()}
                                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                >
                                    <RefreshCcw className="h-4 w-4"/>
                                    Qayta urinish
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="px-5 pb-6">
                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
                                {search.trim() ? <SearchX className="h-7 w-7"/> : <LoaderCircle className="h-7 w-7"/>}
                            </div>
                            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                                {search.trim() ? "Mos tranzaksiya topilmadi" : "Sotuvlar hali yo‘q"}
                            </h3>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                                {search.trim()
                                    ? "Qidiruvga mos telefon, status yoki buyurtma topilmadi."
                                    : "Business wallet bo‘yicha hali tranzaksiya shakllanmagan."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 pb-5 sm:px-5">
                        <BusinessWalletTransactionsCardList transactions={filteredTransactions}/>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/55">
                            <BusinessWalletTransactionsTable transactions={filteredTransactions}/>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
