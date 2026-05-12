import {Button} from "../../ui/button.tsx";
import type {CourseHomeworkInboxItem} from "../../../types/types.ts";
import HomeworkInboxItem from "./HomeworkInboxItem.tsx";

export type HomeworkInboxFilter = "all" | "unread" | "reviewed" | "revision";

export default function HomeworkInboxList({
    items,
    selectedSubmissionId,
    filter,
    onFilterChange,
    onSelect,
}: {
    items: CourseHomeworkInboxItem[];
    selectedSubmissionId: string | null;
    filter: HomeworkInboxFilter;
    onFilterChange: (value: HomeworkInboxFilter) => void;
    onSelect: (submissionId: string) => void;
}) {
    return (
        <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="overflow-x-auto">
                <div className="min-w-[1180px] px-4 pb-6">
                    <div className="border-b border-slate-200 px-2 py-4 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant={filter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFilterChange("all")}
                                className={filter === "all" ? "rounded-2xl bg-slate-900 text-white hover:bg-slate-800" : "rounded-2xl"}
                            >
                                Barchasi
                            </Button>
                            <Button
                                type="button"
                                variant={filter === "unread" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFilterChange("unread")}
                                className={filter === "unread" ? "rounded-2xl bg-blue-600 text-white hover:bg-blue-700" : "rounded-2xl"}
                            >
                                O‘qilmagan
                            </Button>
                            <Button
                                type="button"
                                variant={filter === "reviewed" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFilterChange("reviewed")}
                                className={filter === "reviewed" ? "rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700" : "rounded-2xl"}
                            >
                                Tekshirilgan
                            </Button>
                            <Button
                                type="button"
                                variant={filter === "revision" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFilterChange("revision")}
                                className={filter === "revision" ? "rounded-2xl bg-amber-500 text-white hover:bg-amber-600" : "rounded-2xl"}
                            >
                                Qayta topshirish
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-[1.8fr_1.2fr_1.4fr_1.6fr_1fr_1fr] gap-4 px-2 py-5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                            <span>O‘quvchi</span>
                            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                                {items.length}
                            </span>
                        </div>
                        <div>Lesson</div>
                        <div>Vazifa</div>
                        <div>Izoh</div>
                        <div>Holat</div>
                        <div>Sana</div>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {items.map((item) => (
                            <HomeworkInboxItem
                                key={item.submissionId}
                                item={item}
                                active={selectedSubmissionId === item.submissionId}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
