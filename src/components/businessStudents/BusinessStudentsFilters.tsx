import {Search} from "lucide-react";

type BusinessStudentsFiltersProps = {
    search: string;
    onSearchChange: (value: string) => void;
    totalCount: number;
};

export default function BusinessStudentsFilters({
    search,
    onSearchChange,
    totalCount,
}: BusinessStudentsFiltersProps) {
    return (
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Studentlar ro‘yxati</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Barcha studentlar</h2>
                </div>

                <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-slate-900 px-4 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                    {totalCount}
                </div>
            </div>

            <div className="mt-4 relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Student yoki kurs bo‘yicha qidirish"
                    className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50/80 pl-14 pr-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:bg-slate-900"
                />
            </div>
        </div>
    );
}
