import {BarChart3, Pencil, Trash2} from "lucide-react";
import {Button} from "../../ui/button.tsx";
import CopyUrlsRow from "./CopyUrlsRow.tsx";
import LinkStatsPanel from "./LinkStatsPanel.tsx";
import type {CopyUrlItem, CourseAnalyticsLink, LinkStats} from "./types.ts";
import {analyticsOnlySourceTypes, getBadgeStyle, getPricingLabel, getSourceLabel} from "./utils.ts";

function LinkCard({
    link,
    stats,
    onEdit,
    onDelete,
    onViewAnalytics,
}: {
    link: CourseAnalyticsLink;
    stats: LinkStats;
    onEdit?: (linkId: string) => void;
    onDelete?: (linkId: string) => void;
    onViewAnalytics?: (linkId: string) => void;
}) {
    const isTeacherLink = link.sourceType === "TEACHER_LINK";
    const isAnalyticsOnly = !!link.sourceType && analyticsOnlySourceTypes.includes(link.sourceType);
    const pricingLabel = getPricingLabel(stats);
    const copyItems: CopyUrlItem[] = [
        {
            key: "share",
            label: "Ulashish linki",
            description: "Tashqi share uchun ishlatiladi.",
            value: link.trackingUrl || "",
        },
        {
            key: "landing",
            label: "Landing link",
            description: "Landing detail sahifasi uchun ishlatiladi.",
            value: link.landingUrlWithRef || "",
        },
        {
            key: "student",
            label: "Student buy link",
            description: "Student xarid oqimi uchun ishlatiladi.",
            value: link.studentUrlWithRef || link.courseUrlWithRef || "",
        },
    ];

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
            <div className={`flex flex-col gap-5 ${isAnalyticsOnly ? "" : "lg:flex-row lg:items-start lg:justify-between"}`}>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getBadgeStyle(link.ownerType)}`}>
                            {link.ownerType}
                        </span>
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getBadgeStyle(link.sourceType || "")}`}>
                            {getSourceLabel(link.sourceType)}
                        </span>
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getBadgeStyle(pricingLabel)}`}>
                            {pricingLabel === "PAID" ? "Paid" : "Free"}
                        </span>
                    </div>

                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">{link.name}</h3>
                    <div className="mt-2 inline-flex items-center rounded bg-slate-100 px-2 py-1 font-mono text-sm text-slate-600">
                        Kod: {link.code}
                    </div>

                    {isAnalyticsOnly ? null : (
                        <div className="mt-5">
                            <CopyUrlsRow items={copyItems}/>
                        </div>
                    )}

                    {isAnalyticsOnly ? (
                        <div className="mt-5">
                            <LinkStatsPanel stats={stats} compact/>
                        </div>
                    ) : null}
                </div>

                {!isAnalyticsOnly ? (
                    <div className="w-full lg:max-w-[420px]">
                        <LinkStatsPanel stats={stats}/>
                    </div>
                ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                <Button
                    type="button"
                    className="rounded-lg bg-slate-950 text-white hover:bg-slate-800"
                    onClick={() => onViewAnalytics?.(link.id)}
                >
                    <BarChart3 className="h-4 w-4"/>
                    Tahlillar
                </Button>
                {isTeacherLink ? (
                    <>
                        <Button type="button" variant="outline" className="rounded-lg" onClick={() => onEdit?.(link.id)}>
                            <Pencil className="h-4 w-4"/>
                            Tahrirlash
                        </Button>
                        <Button type="button" variant="outline" className="rounded-lg" onClick={() => onDelete?.(link.id)}>
                            <Trash2 className="h-4 w-4"/>
                            O‘chirish
                        </Button>
                    </>
                ) : null}
            </div>
        </article>
    );
}

export default LinkCard;
