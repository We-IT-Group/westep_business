import {useEffect, useMemo, useState} from "react";
import {AlertCircle, Inbox, ShieldAlert} from "lucide-react";
import {parseApiError} from "../../../utils/apiError.ts";
import {
    useCourseHomeworkInbox,
    useCourseHomeworkStatusSummary,
    useCourseHomeworkSubmissionDetail,
    useCourseHomeworkUnreadCount,
    useMarkCourseHomeworkRead,
    useReviewCourseHomework,
} from "../../../api/homeworkInbox/useHomeworkInbox.ts";
import {useDownloadAttachment} from "../../../api/lessonReview/useLessonReview.ts";
import HomeworkStatusSummary from "./HomeworkStatusSummary.tsx";
import HomeworkInboxList, {type HomeworkInboxFilter} from "./HomeworkInboxList.tsx";
import HomeworkDetailPanel from "./HomeworkDetailPanel.tsx";
import {Button} from "../../ui/button.tsx";

const PAGE_SIZE = 20;

function EmptyState({
    title,
    description,
    forbidden,
}: {
    title: string;
    description: string;
    forbidden?: boolean;
}) {
    return (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
                {forbidden ? <ShieldAlert className="h-7 w-7"/> : <Inbox className="h-7 w-7"/>}
            </div>
            <h4 className="mt-4 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">{title}</h4>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

function ErrorState({error, onRetry}: {error: unknown; onRetry: () => void}) {
    const parsed = parseApiError(error);
    const forbidden = parsed.status === 403;

    return (
        <div className="space-y-4">
            <EmptyState
                title={forbidden ? "Ruxsat yo‘q" : "Homework inbox yuklanmadi"}
                description={forbidden ? "Bu kursdagi homework inboxni ko‘rish uchun sizda ruxsat yo‘q." : parsed.message}
                forbidden={forbidden}
            />
            {!forbidden ? (
                <div className="flex justify-center">
                    <Button type="button" variant="outline" onClick={onRetry} className="rounded-2xl">
                        Qayta urinib ko‘rish
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

export default function HomeworkInboxManager({
    courseId,
    initialStudentId,
}: {
    courseId: string;
    initialStudentId?: string;
}) {
    const [page, setPage] = useState(0);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const [filter, setFilter] = useState<HomeworkInboxFilter>("all");

    const inboxQuery = useCourseHomeworkInbox(courseId, page, PAGE_SIZE);
    const unreadCountQuery = useCourseHomeworkUnreadCount(courseId);
    const summaryQuery = useCourseHomeworkStatusSummary(courseId);
    const detailQuery = useCourseHomeworkSubmissionDetail(courseId, selectedSubmissionId || undefined, !!selectedSubmissionId);
    const markReadMutation = useMarkCourseHomeworkRead(courseId, page, PAGE_SIZE);
    const reviewMutation = useReviewCourseHomework(courseId, page, PAGE_SIZE);
    const downloadAttachment = useDownloadAttachment();

    const filteredItems = useMemo(() => {
        const items = inboxQuery.data?.items || [];
        if (filter === "unread") return items.filter((item) => item.unread);
        if (filter === "reviewed") return items.filter((item) => item.reviewed);
        if (filter === "revision") return items.filter((item) => item.revisionRequested);
        return items;
    }, [filter, inboxQuery.data?.items]);

    useEffect(() => {
        if (!initialStudentId || selectedSubmissionId || !filteredItems.length) return;
        const matchedItem = filteredItems.find((item) => item.student.id === initialStudentId);
        if (matchedItem) {
            setSelectedSubmissionId(matchedItem.submissionId);
        }
    }, [filteredItems, initialStudentId, selectedSubmissionId]);

    useEffect(() => {
        if (!detailQuery.data?.unread || !selectedSubmissionId || markReadMutation.isPending) return;
        void markReadMutation.mutateAsync(selectedSubmissionId);
    }, [detailQuery.data?.unread, markReadMutation, selectedSubmissionId]);

    const handleDownloadAttachment = async (attachmentId: string) => {
        const blob = await downloadAttachment.mutateAsync(attachmentId);
        const url = URL.createObjectURL(blob);
        const linkEl = document.createElement("a");
        linkEl.href = url;
        linkEl.download = attachmentId;
        document.body.appendChild(linkEl);
        linkEl.click();
        linkEl.remove();
        URL.revokeObjectURL(url);
    };

    const handleSubmitReview = async (values: {score: number; feedback: string; revisionRequested: boolean}) => {
        if (!selectedSubmissionId) return;
        await reviewMutation.mutateAsync({
            submissionId: selectedSubmissionId,
            body: values,
        });
    };

    const handleRetryAll = async () => {
        await Promise.all([
            inboxQuery.refetch(),
            unreadCountQuery.refetch(),
            summaryQuery.refetch(),
            selectedSubmissionId ? detailQuery.refetch() : Promise.resolve(),
        ]);
    };

    const listForbidden = parseApiError(inboxQuery.error).status === 403 || parseApiError(summaryQuery.error).status === 403;

    return (
        <div className="space-y-6 p-6">
            <HomeworkStatusSummary
                summary={summaryQuery.data}
                unreadCount={unreadCountQuery.data ?? inboxQuery.data?.unreadCount ?? 0}
                onRetry={handleRetryAll}
                forbidden={listForbidden}
            />

            {inboxQuery.isLoading ? (
                <div className="flex min-h-[220px] items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white/90 p-8 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                    <Inbox className="h-4 w-4 text-blue-600"/>
                    Homework inbox yuklanmoqda...
                </div>
            ) : inboxQuery.isError ? (
                <ErrorState error={inboxQuery.error} onRetry={handleRetryAll}/>
            ) : !inboxQuery.data?.items.length ? (
                <EmptyState title="Submission yo‘q" description="Bu kurs bo‘yicha hali homework submission kelmagan."/>
            ) : selectedSubmissionId ? (
                <HomeworkDetailPanel
                    detail={detailQuery.data}
                    isLoading={detailQuery.isLoading}
                    error={detailQuery.error}
                    isSubmitting={reviewMutation.isPending}
                    onBack={() => setSelectedSubmissionId(null)}
                    onRetry={() => {
                        void detailQuery.refetch();
                    }}
                    onDownloadAttachment={handleDownloadAttachment}
                    onSubmitReview={handleSubmitReview}
                />
            ) : (
                <HomeworkInboxList
                    items={filteredItems}
                    selectedSubmissionId={selectedSubmissionId}
                    filter={filter}
                    onFilterChange={setFilter}
                    onSelect={setSelectedSubmissionId}
                />
            )}

            {filteredItems.length ? (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        Sahifa {page + 1} / {Math.max(Math.ceil(((inboxQuery.data?.totalSubmissions || 0) / (inboxQuery.data?.size || PAGE_SIZE))), 1)}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setPage(Math.max(page - 1, 0))} disabled={page === 0}>
                            Oldingi
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={(page + 1) * (inboxQuery.data?.size || PAGE_SIZE) >= (inboxQuery.data?.totalSubmissions || 0)}
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            ) : null}

            {(detailQuery.error && !selectedSubmissionId) || summaryQuery.error ? (
                <div className="hidden">
                    <AlertCircle className="h-4 w-4"/>
                </div>
            ) : null}
        </div>
    );
}
