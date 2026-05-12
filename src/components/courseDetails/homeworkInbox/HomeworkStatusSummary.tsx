import {Inbox, RotateCcw, ShieldAlert} from "lucide-react";
import type {CourseHomeworkStatusSummary} from "../../../types/types.ts";
import {Button} from "../../ui/button.tsx";

export default function HomeworkStatusSummary({
    summary,
    unreadCount,
    onRetry,
    forbidden,
}: {
    summary?: CourseHomeworkStatusSummary;
    unreadCount: number;
    onRetry?: () => void;
    forbidden?: boolean;
}) {
    if (forbidden) {
        return (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm dark:bg-slate-950 dark:text-amber-300">
                        <ShieldAlert className="h-5 w-5"/>
                    </div>
                    <div>
                        <p className="text-base font-semibold text-amber-900 dark:text-amber-100">Ruxsat yo‘q</p>
                        <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-100/80">
                            Bu homework inboxni ko‘rish uchun sizda ruxsat yo‘q.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const cards = [
        {
            label: "O‘qilmagan",
            value: unreadCount,
            tone: "from-sky-500/18 via-cyan-400/12 to-white dark:from-sky-500/18 dark:via-cyan-500/10 dark:to-slate-950",
            iconTone: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
        },
        {
            label: "Yangi",
            value: summary?.newCount ?? 0,
            tone: "from-amber-500/18 via-orange-400/12 to-white dark:from-amber-500/18 dark:via-orange-500/10 dark:to-slate-950",
            iconTone: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
        },
        {
            label: "Tekshirilgan",
            value: summary?.reviewedCount ?? 0,
            tone: "from-emerald-500/18 via-teal-400/12 to-white dark:from-emerald-500/18 dark:via-teal-500/10 dark:to-slate-950",
            iconTone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        },
        {
            label: "Qayta topshirish",
            value: summary?.revisionRequestedCount ?? 0,
            tone: "from-violet-500/18 via-fuchsia-400/12 to-white dark:from-violet-500/18 dark:via-fuchsia-500/10 dark:to-slate-950",
            iconTone: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
        },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Homework Inbox</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Kurs homework submissions</h3>
                </div>
                {onRetry ? (
                    <Button type="button" variant="outline" size="sm" onClick={onRetry} className="rounded-2xl">
                        <RotateCcw className="h-4 w-4"/>
                        Yangilash
                    </Button>
                ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.label} className={`rounded-[22px] border border-slate-200 bg-gradient-to-br ${card.tone} p-4 shadow-sm dark:border-slate-800`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${card.iconTone}`}>
                            <Inbox className="h-4.5 w-4.5"/>
                        </div>
                        <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{card.value}</div>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{card.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
