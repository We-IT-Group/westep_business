import moment from "moment";
import {AlertCircle, ChevronLeft, Download, ExternalLink, FileText, LoaderCircle} from "lucide-react";
import type {CourseHomeworkSubmissionDetail} from "../../../types/types.ts";
import {parseApiError} from "../../../utils/apiError.ts";
import {Button} from "../../ui/button.tsx";
import {Badge} from "../../ui/badge.tsx";
import HomeworkReviewForm from "./HomeworkReviewForm.tsx";

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return moment(value).isValid() ? moment(value).format("MMM D, HH:mm") : value;
};

export default function HomeworkDetailPanel({
    detail,
    isLoading,
    error,
    isSubmitting,
    onBack,
    onRetry,
    onDownloadAttachment,
    onSubmitReview,
}: {
    detail?: CourseHomeworkSubmissionDetail;
    isLoading: boolean;
    error?: unknown;
    isSubmitting: boolean;
    onBack: () => void;
    onRetry: () => void;
    onDownloadAttachment: (attachmentId: string) => Promise<void>;
    onSubmitReview: (values: {score: number; feedback: string; revisionRequested: boolean}) => Promise<void>;
}) {
    if (isLoading) {
        return (
            <div className="flex min-h-[520px] items-center justify-center rounded-[26px] border border-slate-200 bg-white/90 p-8 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-blue-600"/>
                Homework detali yuklanmoqda...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[26px] border border-rose-200 bg-rose-50/80 p-6 dark:border-rose-500/20 dark:bg-rose-500/10">
                <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-300"/>
                    <div>
                        <p className="text-base font-semibold text-rose-700 dark:text-rose-200">Detail ochilmadi</p>
                        <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-200/80">{parseApiError(error).message}</p>
                        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-4 rounded-2xl">
                            Qayta urinib ko‘rish
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
                    <FileText className="h-7 w-7"/>
                </div>
                <h4 className="mt-4 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">Submission tanlanmagan</h4>
                <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                    Chap tomondan student homework submission’ini tanlang.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.16),_transparent_26%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_26%),linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(2,6,23,0.96))] dark:shadow-[0_18px_40px_rgba(2,6,23,0.38)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Button type="button" variant="outline" size="sm" onClick={onBack} className="rounded-xl">
                            <ChevronLeft className="h-4 w-4"/>
                            Orqaga
                        </Button>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">Homework review</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{detail.student.fullName}</h3>
                        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            {detail.lessonName || "Lesson nomi yo‘q"} · {detail.taskTitle || "Vazifa nomi yo‘q"}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {detail.unread ? (
                            <Badge className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                O‘qilmagan
                            </Badge>
                        ) : null}
                        {detail.reviewedAt ? (
                            <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                Tekshirilgan
                            </Badge>
                        ) : null}
                        {detail.revisionRequested ? (
                            <Badge className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                Qayta topshirish
                            </Badge>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
                    <div className="space-y-4">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Student izohi</p>
                            <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{detail.comment || "Izoh qoldirilmagan."}</p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Yuborilgan materiallar</p>
                                {detail.externalUrl ? (
                                    <a
                                        href={detail.externalUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                                    >
                                        <ExternalLink className="h-4 w-4"/>
                                        Linkni ochish
                                    </a>
                                ) : null}
                            </div>

                            {detail.attachmentIds.length ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {detail.attachmentIds.map((attachmentId, index) => (
                                        <Button key={attachmentId} type="button" variant="outline" onClick={() => onDownloadAttachment(attachmentId)} className="rounded-2xl bg-white dark:bg-slate-950">
                                            <Download className="h-4 w-4"/>
                                            Fayl {index + 1}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                                    Attachment yo‘q
                                </div>
                            )}
                        </div>

                        {detail.feedback ? (
                            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Oldingi feedback</p>
                                <p className="mt-3 text-sm leading-7 text-emerald-900 dark:text-emerald-100">{detail.feedback}</p>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Submission summary</p>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Topshirilgan vaqt</p>
                                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(detail.submittedAt)}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Tekshirilgan vaqt</p>
                                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{formatDate(detail.reviewedAt)}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Current score</p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{detail.score ?? "-"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Review holati</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {detail.reviewedAt ? (
                                    <Badge className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                        Tekshirilgan
                                    </Badge>
                                ) : (
                                    <Badge className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        Kutilmoqda
                                    </Badge>
                                )}
                                {detail.revisionRequested ? (
                                    <Badge className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                        Qayta topshirish
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <HomeworkReviewForm detail={detail} isSubmitting={isSubmitting} onSubmit={onSubmitReview}/>
        </div>
    );
}
