import {FormEvent, ReactNode, useEffect, useMemo, useState} from "react";
import {
    AlertCircle,
    ArrowUpRight,
    Download,
    Edit3,
    FileQuestion,
    LoaderCircle,
    MessageSquareReply,
    Paperclip,
    Send,
    Trash2,
    XCircle,
} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../ui/tabs.tsx";
import {Button} from "../../ui/button.tsx";
import {Textarea} from "../../ui/textarea.tsx";
import {Input} from "../../ui/input.tsx";
import {useUser} from "../../../api/auth/useAuth.ts";
import {
    DiscussionThread,
    HomeworkSubmissionReview,
    QuizResultSummary,
} from "../../../api/lessonReview/lessonReviewApi.ts";
import {
    useDownloadAttachment,
    useDeleteDiscussion,
    useHomeworkSubmissions,
    useLessonDiscussions,
    useLessonTasksReview,
    useQuizResultsByLesson,
    useQuizSessionDetail,
    useReplyDiscussion,
    useReviewHomeworkSubmission,
    useUpdateDiscussion,
} from "../../../api/lessonReview/useLessonReview.ts";
import {parseApiError} from "../../../utils/apiError.ts";

type Props = {
    lessonId: string;
};

const isTeacherSideRole = (roleName?: string) => {
    const normalized = (roleName || "").toUpperCase();
    return normalized.includes("TEACHER") || normalized.includes("BUSINESS_ADMIN");
};

const formatDateTime = (value?: string) => value || "No date";

const StateCard = ({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: ReactNode;
}) => (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400 dark:shadow-none">
            {icon}
        </div>
        <h3 className="mt-5 text-lg font-black tracking-tight text-slate-950 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

const LoadingBlock = ({label}: {label: string}) => (
    <div className="flex items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-8 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <LoaderCircle className="h-4 w-4 animate-spin text-sky-600"/>
        {label}
    </div>
);

const ReviewSection = ({
    title,
    description,
    children,
    accent = "sky",
}: {
    title: string;
    description: string;
    children: ReactNode;
    accent?: "sky" | "emerald" | "violet";
}) => {
    const accentClasses = {
        sky: "bg-sky-50 text-sky-700",
        emerald: "bg-emerald-50 text-emerald-700",
        violet: "bg-violet-50 text-violet-700",
    };

    return (
        <section className="rounded-[30px] border border-white/80 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Review surface</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">{title}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <div className={`rounded-2xl p-3 ${accentClasses[accent]}`}>
                    {accent === "sky" ? <MessageSquareReply className="h-5 w-5"/> : null}
                    {accent === "emerald" ? <Paperclip className="h-5 w-5"/> : null}
                    {accent === "violet" ? <FileQuestion className="h-5 w-5"/> : null}
                </div>
            </div>

            <div className="mt-6">{children}</div>
        </section>
    );
};

export default function LessonTeacherReviewPanel({lessonId}: Props) {
    const {data: user} = useUser();
    const canAccess = isTeacherSideRole(user?.roleName);
    const discussionsQuery = useLessonDiscussions(canAccess ? lessonId : undefined);
    const tasksQuery = useLessonTasksReview(canAccess ? lessonId : undefined);
    const replyMutation = useReplyDiscussion(lessonId);
    const updateDiscussionMutation = useUpdateDiscussion(lessonId);
    const deleteDiscussionMutation = useDeleteDiscussion(lessonId);
    const downloadAttachment = useDownloadAttachment();

    const [openReplyId, setOpenReplyId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [selectedHomeworkTaskId, setSelectedHomeworkTaskId] = useState("");
    const [selectedQuizTaskId, setSelectedQuizTaskId] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [reviewTarget, setReviewTarget] = useState<HomeworkSubmissionReview | null>(null);
    const [reviewScore, setReviewScore] = useState("");
    const [reviewFeedback, setReviewFeedback] = useState("");
    const [reviewRevisionRequested, setReviewRevisionRequested] = useState(false);

    const lessonTasks = useMemo(() => tasksQuery.data || [], [tasksQuery.data]);
    const homeworkTasks = useMemo(
        () => lessonTasks.filter((task) => task.type.includes("HOMEWORK")),
        [lessonTasks]
    );
    const quizTasks = useMemo(
        () => lessonTasks.filter((task) => task.type.includes("QUIZ")),
        [lessonTasks]
    );

    useEffect(() => {
        setSelectedHomeworkTaskId("");
        setSelectedQuizTaskId("");
        setSelectedSessionId(null);
    }, [lessonId]);

    useEffect(() => {
        if (!selectedHomeworkTaskId && homeworkTasks[0]?.id) {
            setSelectedHomeworkTaskId(homeworkTasks[0].id);
        }
    }, [homeworkTasks, selectedHomeworkTaskId]);

    useEffect(() => {
        if (!selectedQuizTaskId && quizTasks[0]?.id) {
            setSelectedQuizTaskId(quizTasks[0].id);
        }
    }, [quizTasks, selectedQuizTaskId]);

    const homeworkSubmissionsQuery = useHomeworkSubmissions(selectedHomeworkTaskId || undefined);
    const reviewMutation = useReviewHomeworkSubmission(selectedHomeworkTaskId || undefined);
    const lessonQuizResultsQuery = useQuizResultsByLesson(canAccess ? lessonId : undefined);
    const quizSessionDetailQuery = useQuizSessionDetail(selectedSessionId || undefined, !!selectedSessionId);
    const filteredQuizResults = useMemo(
        () => (lessonQuizResultsQuery.data || []).filter((result) =>
            selectedQuizTaskId ? result.taskId === selectedQuizTaskId : true
        ),
        [lessonQuizResultsQuery.data, selectedQuizTaskId],
    );

    if (!canAccess) return null;

    const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!openReplyId || !replyDraft.trim()) return;

        await replyMutation.mutateAsync({
            commentId: openReplyId,
            content: replyDraft.trim(),
        });

        setReplyDraft("");
        setOpenReplyId(null);
    };

    const handleAttachmentDownload = async (attachmentId: string) => {
        const blob = await downloadAttachment.mutateAsync(attachmentId);
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = attachmentId;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
    };

    const openReviewDrawer = (submission: HomeworkSubmissionReview) => {
        setReviewTarget(submission);
        setReviewScore(submission.score?.toString() || "");
        setReviewFeedback(submission.feedback || "");
        setReviewRevisionRequested(false);
    };

    const handleSaveReview = async () => {
        if (!reviewTarget) return;

        await reviewMutation.mutateAsync({
            submissionId: reviewTarget.submissionId,
            score: Number(reviewScore || 0),
            feedback: reviewFeedback,
            revisionRequested: reviewRevisionRequested,
        });

        setReviewTarget(null);
    };

    return (
        <>
            <Tabs defaultValue="discussion" className="w-full">
                <TabsList className="mb-6 h-auto flex-wrap rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                    <TabsTrigger value="discussion" className="gap-2 px-5 py-3">
                        <MessageSquareReply className="h-4 w-4"/>
                        Muhokama
                    </TabsTrigger>
                    <TabsTrigger value="homework" className="gap-2 px-5 py-3">
                        <Paperclip className="h-4 w-4"/>
                        Vazifalar
                    </TabsTrigger>
                    <TabsTrigger value="quiz-results" className="gap-2 px-5 py-3">
                        <FileQuestion className="h-4 w-4"/>
                        Quiz natijalari
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="discussion" className="mt-0">
                    <ReviewSection
                        title="Discussion"
                        description="Teacher va Business Admin student commentiga reply yoza oladi."
                        accent="sky"
                    >
                        {discussionsQuery.isLoading ? (
                            <LoadingBlock label="Discussion yuklanmoqda..."/>
                        ) : discussionsQuery.isError ? (
                            <StateCard
                                title="Discussion yuklanmadi"
                                description={parseApiError(discussionsQuery.error).message}
                                icon={<AlertCircle className="h-5 w-5"/>}
                            />
                        ) : !discussionsQuery.data?.length ? (
                            <StateCard
                                title="Hozircha fikrlar yo‘q"
                                description="Student commentlar hali mavjud emas."
                                icon={<MessageSquareReply className="h-5 w-5"/>}
                            />
                        ) : (
                            <div className="space-y-4">
                                {discussionsQuery.data.map((thread) => (
                                    <DiscussionThreadCard
                                        key={thread.id}
                                        thread={thread}
                                        openReplyId={openReplyId}
                                        replyDraft={replyDraft}
                                        isSending={replyMutation.isPending && openReplyId === thread.id}
                                        isUpdating={updateDiscussionMutation.isPending}
                                        isDeleting={deleteDiscussionMutation.isPending}
                                        onOpenReply={() => {
                                            setOpenReplyId((current) => current === thread.id ? null : thread.id);
                                            setReplyDraft("");
                                        }}
                                        onReplyDraftChange={setReplyDraft}
                                        onSubmit={handleReplySubmit}
                                        onUpdate={async (commentId, content) => {
                                            await updateDiscussionMutation.mutateAsync({commentId, content});
                                        }}
                                        onDelete={async (commentId) => {
                                            await deleteDiscussionMutation.mutateAsync(commentId);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </ReviewSection>
                </TabsContent>

                <TabsContent value="homework" className="mt-0">
                    <section className="grid gap-6 xl:grid-cols-[320px_minmax(420px,1fr)]">
                        <ReviewSection
                            title="Homework Tasks"
                            description="Lesson ichidagi `HOMEWORK` tasklar shu yerda chiqadi."
                            accent="emerald"
                        >
                            {tasksQuery.isLoading ? (
                                <LoadingBlock label="Homework tasklar yuklanmoqda..."/>
                            ) : tasksQuery.isError ? (
                                <StateCard
                                    title="Tasklar yuklanmadi"
                                    description={parseApiError(tasksQuery.error).message}
                                    icon={<AlertCircle className="h-5 w-5"/>}
                                />
                            ) : !homeworkTasks.length ? (
                                <StateCard
                                    title="Homework topilmadi"
                                    description="Bu lesson uchun homework task hali mavjud emas."
                                    icon={<Paperclip className="h-5 w-5"/>}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {homeworkTasks.map((task) => (
                                        <button
                                            key={task.id}
                                            type="button"
                                            onClick={() => setSelectedHomeworkTaskId(task.id)}
                                            className={`w-full rounded-[22px] border p-4 text-left transition ${
                                                selectedHomeworkTaskId === task.id
                                                    ? "border-emerald-300 bg-emerald-50"
                                                    : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                                            }`}
                                        >
                                            <p className="font-black text-slate-950">{task.title}</p>
                                            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{task.type}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ReviewSection>

                        <ReviewSection
                            title="Homework Submissions"
                            description="Student submission comment, link, file, score va feedback shu yerda ko‘rinadi."
                            accent="emerald"
                        >
                            {homeworkSubmissionsQuery.isLoading ? (
                                <LoadingBlock label="Homework submissionlar yuklanmoqda..."/>
                            ) : homeworkSubmissionsQuery.isError ? (
                                <StateCard
                                    title="Submissionlar yuklanmadi"
                                    description={parseApiError(homeworkSubmissionsQuery.error).message}
                                    icon={<AlertCircle className="h-5 w-5"/>}
                                />
                            ) : !homeworkSubmissionsQuery.data?.length ? (
                                <StateCard
                                    title="Hozircha homework submission yo‘q"
                                    description="Tanlangan homework task uchun hali submission kelmagan."
                                    icon={<Paperclip className="h-5 w-5"/>}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {homeworkSubmissionsQuery.data.map((submission) => (
                                        <div key={submission.submissionId} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <p className="font-black text-slate-950">{submission.studentName}</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                                        Submitted: {formatDateTime(submission.submittedAt)}
                                                    </p>
                                                    {submission.reviewedAt && (
                                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                                            Reviewed: {formatDateTime(submission.reviewedAt)}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button type="button" variant="outline" onClick={() => openReviewDrawer(submission)} className="rounded-2xl">
                                                    Review
                                                </Button>
                                            </div>

                                            {submission.comment && (
                                                <p className="mt-4 text-sm font-medium leading-6 text-slate-600">{submission.comment}</p>
                                            )}

                                            <div className="mt-4 flex flex-wrap gap-3">
                                                {submission.externalUrl && (
                                                    <a
                                                        href={submission.externalUrl}
                                                        target="_blank"
                                                        rel="noreferrer noopener"
                                                        className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-slate-900 dark:text-sky-200"
                                                    >
                                                        <ArrowUpRight className="h-4 w-4"/>
                                                        Havolani ochish
                                                    </a>
                                                )}

                                                {submission.attachmentIds.map((attachmentId, index) => (
                                                    <button
                                                        key={attachmentId}
                                                        type="button"
                                                        onClick={() => handleAttachmentDownload(attachmentId)}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-200"
                                                    >
                                                        <Download className="h-4 w-4"/>
                                                        Faylni yuklash {index + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <SummaryCard label="Ball" value={(submission.score ?? "Baholanmagan").toString()}/>
                                                <SummaryCard label="Feedback" value={submission.feedback || "Feedback yo‘q"}/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ReviewSection>
                    </section>
                </TabsContent>

                <TabsContent value="quiz-results" className="mt-0">
                    <section className="grid gap-6 xl:grid-cols-[320px_minmax(420px,1fr)]">
                        <ReviewSection
                            title="Quiz Tasks"
                            description="Lesson ichidagi `QUIZ` tasklarni tanlab natijalarni ko‘rish mumkin."
                            accent="violet"
                        >
                            {tasksQuery.isLoading ? (
                                <LoadingBlock label="Quiz tasklar yuklanmoqda..."/>
                            ) : tasksQuery.isError ? (
                                <StateCard
                                    title="Quiz tasklar yuklanmadi"
                                    description={parseApiError(tasksQuery.error).message}
                                    icon={<AlertCircle className="h-5 w-5"/>}
                                />
                            ) : !quizTasks.length ? (
                                <StateCard
                                    title="Quiz topilmadi"
                                    description="Bu lesson uchun quiz task hali mavjud emas."
                                    icon={<FileQuestion className="h-5 w-5"/>}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {quizTasks.map((task) => (
                                        <button
                                            key={task.id}
                                            type="button"
                                            onClick={() => setSelectedQuizTaskId(task.id)}
                                            className={`w-full rounded-[22px] border p-4 text-left transition ${
                                                selectedQuizTaskId === task.id
                                                    ? "border-violet-300 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-500/10"
                                                    : "border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                                            }`}
                                        >
                                            <p className="font-black text-slate-950 dark:text-slate-100">{task.title}</p>
                                            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{task.type}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ReviewSection>

                        <ReviewSection
                            title="Quiz Results"
                            description="Studentlar bo‘yicha result table va session detail shu yerda ko‘rinadi."
                            accent="violet"
                        >
                            {lessonQuizResultsQuery.isLoading ? (
                                <LoadingBlock label="Quiz resultlar yuklanmoqda..."/>
                            ) : lessonQuizResultsQuery.isError ? (
                                <StateCard
                                    title="Quiz resultlar yuklanmadi"
                                    description={parseApiError(lessonQuizResultsQuery.error).message}
                                    icon={<AlertCircle className="h-5 w-5"/>}
                                />
                            ) : !filteredQuizResults.length ? (
                                <StateCard
                                    title="Hozircha test natijalari yo‘q"
                                    description="Tanlangan quiz task uchun session natijalari hali mavjud emas."
                                    icon={<FileQuestion className="h-5 w-5"/>}
                                />
                            ) : (
                                <div className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800">
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-50/80 dark:bg-slate-900">
                                        <tr className="text-left text-slate-500 dark:text-slate-400">
                                            <th className="py-3 pr-4 pl-4 font-black uppercase tracking-[0.18em] text-[11px]">Talaba</th>
                                            <th className="py-3 pr-4 font-black uppercase tracking-[0.18em] text-[11px]">Foiz</th>
                                            <th className="py-3 pr-4 font-black uppercase tracking-[0.18em] text-[11px]">To‘g‘ri/Noto‘g‘ri</th>
                                            <th className="py-3 pr-4 font-black uppercase tracking-[0.18em] text-[11px]">Boshlagan</th>
                                            <th className="py-3 pr-4 font-black uppercase tracking-[0.18em] text-[11px]">Tugatgan</th>
                                            <th className="py-3 pr-4 font-black uppercase tracking-[0.18em] text-[11px]">Amal</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
                                        {filteredQuizResults.map((result) => (
                                            <QuizResultRow
                                                key={result.sessionId}
                                                result={result}
                                                onViewDetail={() => setSelectedSessionId(result.sessionId)}
                                            />
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </ReviewSection>
                    </section>
                </TabsContent>
            </Tabs>

            {reviewTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-xl rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 shadow-[0_32px_90px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Review drawer</p>
                                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Vazifani tekshirish</h3>
                                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{reviewTarget.studentName}</p>
                            </div>
                            <button type="button" onClick={() => setReviewTarget(null)} className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200">
                                <XCircle className="h-5 w-5"/>
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Ball</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={reviewScore}
                                    onChange={(event) => setReviewScore(event.target.value)}
                                    className="h-12 rounded-2xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Izoh</label>
                                <Textarea
                                    value={reviewFeedback}
                                    onChange={(event) => setReviewFeedback(event.target.value)}
                                    className="min-h-[140px] rounded-[24px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={reviewRevisionRequested}
                                    onChange={(event) => setReviewRevisionRequested(event.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                Qayta ishlash so‘ralsin
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setReviewTarget(null)}>
                                Bekor qilish
                            </Button>
                            <Button type="button" onClick={handleSaveReview} disabled={reviewMutation.isPending}>
                                {reviewMutation.isPending ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin"/>
                                        Saqlanmoqda...
                                    </>
                                ) : "Saqlash"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {selectedSessionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-4xl rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 shadow-[0_32px_90px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Session detail</p>
                                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Quiz session tafsiloti</h3>
                                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Student javoblari va to‘g‘ri variantlar.
                                </p>
                            </div>
                            <button type="button" onClick={() => setSelectedSessionId(null)} className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200">
                                <XCircle className="h-5 w-5"/>
                            </button>
                        </div>

                        <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">
                            {quizSessionDetailQuery.isLoading ? (
                                <LoadingBlock label="Session detail yuklanmoqda..."/>
                            ) : quizSessionDetailQuery.isError ? (
                                <StateCard
                                    title="Session detail yuklanmadi"
                                    description={parseApiError(quizSessionDetailQuery.error).message}
                                    icon={<AlertCircle className="h-5 w-5"/>}
                                />
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-3 sm:grid-cols-4">
                                        <SummaryCard label="Student" value={quizSessionDetailQuery.data?.summary?.studentName || "-"}/>
                                        <SummaryCard label="Percentage" value={quizSessionDetailQuery.data?.summary?.percentage != null ? `${quizSessionDetailQuery.data.summary.percentage}%` : "-"}/>
                                        <SummaryCard label="Correct" value={quizSessionDetailQuery.data?.summary?.correct?.toString() || "-"}/>
                                        <SummaryCard label="Wrong" value={quizSessionDetailQuery.data?.summary?.wrong?.toString() || "-"}/>
                                    </div>

                                    {quizSessionDetailQuery.data?.questions.map((question) => (
                                        <div key={question.orderIndex} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                                                        Savol {question.orderIndex}
                                                    </p>
                                                    <p className="mt-2 font-semibold text-slate-950 dark:text-slate-100">{question.questionText}</p>
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${
                                                    question.correct ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
                                                }`}>
                                                    {question.correct ? "To‘g‘ri" : "Noto‘g‘ri"}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                                {[
                                                    {key: "A", value: question.optionA},
                                                    {key: "B", value: question.optionB},
                                                    {key: "C", value: question.optionC},
                                                    {key: "D", value: question.optionD},
                                                ].filter((option) => option.value).map((option) => (
                                                    <div key={option.key} className="rounded-xl bg-white p-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">{option.key}.</span> {option.value}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <SummaryCard label="Tanlangan" value={question.selectedOption || "-"}/>
                                                <SummaryCard label="To‘g‘ri javob" value={question.correctOption || "-"}/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function DiscussionThreadCard({
    thread,
    openReplyId,
    replyDraft,
    isSending,
    isUpdating,
    isDeleting,
    onOpenReply,
    onReplyDraftChange,
    onSubmit,
    onUpdate,
    onDelete,
}: {
    thread: DiscussionThread;
    openReplyId: string | null;
    replyDraft: string;
    isSending: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    onOpenReply: () => void;
    onReplyDraftChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    onUpdate: (commentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
}) {
    const isOpen = openReplyId === thread.id;
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState("");

    const startEdit = (commentId: string, content: string) => {
        setEditingId(commentId);
        setEditDraft(content);
    };

    const stopEdit = () => {
        setEditingId(null);
        setEditDraft("");
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!editDraft.trim()) return;
        await onUpdate(commentId, editDraft.trim());
        stopEdit();
    };

    const handleDelete = async (commentId: string) => {
        const shouldDelete = window.confirm("Shu yozuvni o'chirmoqchimisiz?");
        if (!shouldDelete) return;
        await onDelete(commentId);
        if (editingId === commentId) {
            stopEdit();
        }
    };

    return (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="font-black text-slate-950 dark:text-slate-100">{thread.author}</p>
                    {editingId === thread.id ? (
                        <div className="mt-3 space-y-3">
                            <Textarea
                                value={editDraft}
                                onChange={(event) => setEditDraft(event.target.value)}
                                className="min-h-[110px] rounded-[20px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" onClick={() => handleSaveEdit(thread.id)} disabled={isUpdating || !editDraft.trim()}>
                                    {isUpdating ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                    Saqlash
                                </Button>
                                <Button type="button" variant="outline" onClick={stopEdit}>
                                    Bekor qilish
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">{thread.content}</p>
                    )}
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{thread.createdAt}</p>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => startEdit(thread.id, thread.content)} className="h-9 rounded-xl px-3">
                            <Edit3 className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleDelete(thread.id)} disabled={isDeleting} className="h-9 rounded-xl px-3 text-rose-600">
                            {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {thread.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                    {thread.replies.map((reply) => (
                        <div key={reply.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{reply.author}</p>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{reply.createdAt}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" onClick={() => startEdit(reply.id, reply.content)} className="h-8 rounded-xl px-3">
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Edit
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => handleDelete(reply.id)} disabled={isDeleting} className="h-8 rounded-xl px-3 text-rose-600">
                                        {isDeleting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        Delete
                                    </Button>
                                </div>
                            </div>
                            {editingId === reply.id ? (
                                <div className="mt-3 space-y-3">
                                    <Textarea
                                        value={editDraft}
                                        onChange={(event) => setEditDraft(event.target.value)}
                                        className="min-h-[100px] rounded-[16px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" onClick={() => handleSaveEdit(reply.id)} disabled={isUpdating || !editDraft.trim()} className="h-9 rounded-xl px-3">
                                            {isUpdating ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                            Saqlash
                                        </Button>
                                        <Button type="button" variant="outline" onClick={stopEdit} className="h-9 rounded-xl px-3">
                                            Bekor qilish
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">{reply.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <Button type="button" variant="outline" onClick={onOpenReply}>
                    Reply
                </Button>
            </div>

            {isOpen && (
                <form onSubmit={onSubmit} className="mt-4 space-y-3">
                    <Textarea
                        value={replyDraft}
                        onChange={(event) => onReplyDraftChange(event.target.value)}
                        placeholder="Savolingiz bo‘yicha javob..."
                        className="min-h-[120px] rounded-[24px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <Button type="submit" disabled={isSending || !replyDraft.trim()}>
                        {isSending ? (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin"/>
                                Yuborilmoqda...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4"/>
                                Javob yuborish
                            </>
                        )}
                    </Button>
                </form>
            )}
        </div>
    );
}

function QuizResultRow({
    result,
    onViewDetail,
}: {
    result: QuizResultSummary;
    onViewDetail: () => void;
}) {
    return (
        <tr className="align-top">
            <td className="py-3 pr-4 pl-4 font-semibold text-slate-950 dark:text-slate-100">{result.studentName}</td>
            <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-300">
                {result.percentage != null ? `${result.percentage}%` : "-"}
            </td>
            <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-300">
                {result.correct ?? "-"} / {result.wrong ?? "-"}
            </td>
            <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{formatDateTime(result.startedAt)}</td>
            <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{formatDateTime(result.finishedAt)}</td>
            <td className="py-3">
                <Button type="button" variant="outline" onClick={onViewDetail} className="rounded-2xl">
                    Tafsilotni ko‘rish
                </Button>
            </td>
        </tr>
    );
}

function SummaryCard({label, value}: {label: string; value: string}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}
