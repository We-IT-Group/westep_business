import {Paperclip} from "lucide-react";
import moment from "moment";
import type {CourseHomeworkInboxItem} from "../../../types/types.ts";
import {Badge} from "../../ui/badge.tsx";

const formatDate = (value?: string) => {
    if (!value) return "-";
    return moment(value).isValid() ? moment(value).format("MMM D, HH:mm") : value;
};

const truncateText = (value?: string, maxLength = 42) => {
    const normalized = (value || "").trim();
    if (!normalized) return "Izoh yo‘q";
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

export default function HomeworkInboxItem({
    item,
    active,
    onSelect,
}: {
    item: CourseHomeworkInboxItem;
    active: boolean;
    onSelect: (submissionId: string) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(item.submissionId)}
            className={`grid w-full grid-cols-[1.8fr_1.2fr_1.4fr_1.6fr_1fr_1fr] gap-4 rounded-2xl px-2 py-6 text-left transition ${
                active
                    ? "bg-blue-50/80 dark:bg-blue-500/10"
                    : "hover:bg-white/70 dark:hover:bg-white/[0.03]"
            }`}
        >
            <div className="flex items-center gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white">
                    {item.student.fullName.trim().charAt(0).toUpperCase() || "S"}
                    {item.unread ? (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-950" />
                    ) : (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#48bf45] ring-2 ring-white dark:ring-slate-950" />
                    )}
                </div>
                <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{item.student.fullName}</div>
                </div>
            </div>

            <div className="self-center">
                <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{item.lessonName || "-"}</div>
            </div>

            <div className="self-center">
                <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{item.taskTitle || "-"}</div>
            </div>

            <div className="self-center">
                <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                        {truncateText(item.previewComment)}
                    </div>
                    {item.hasAttachments ? <Paperclip className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"/> : null}
                </div>
            </div>

            <div className="self-center">
                <div className="flex flex-wrap items-center gap-2">
                    {item.unread ? (
                        <Badge className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                            Yangi
                        </Badge>
                    ) : null}
                    {item.reviewed ? (
                        <Badge className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            Tekshirilgan
                        </Badge>
                    ) : null}
                    {item.revisionRequested ? (
                        <Badge className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            Qayta topshirish
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="self-center">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatDate(item.submittedAt)}</div>
            </div>
        </button>
    );
}
