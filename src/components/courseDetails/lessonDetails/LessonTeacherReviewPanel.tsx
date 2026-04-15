import {FormEvent, ReactNode, useEffect, useMemo, useState} from "react";
import {
    AlertCircle,
    ArrowUpRight,
    Download,
    FileQuestion,
    LoaderCircle,
    MessageSquareReply,
    Paperclip,
    Send,
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
    useHomeworkSubmissions,
    useLessonDiscussions,
    useLessonTasksReview,
    useQuizResults,
    useQuizSessionDetail,
    useReplyDiscussion,
    useReviewHomeworkSubmission,
} from "../../../api/lessonReview/useLessonReview.ts";
import {parseApiError} from "../../../utils/apiError.ts";
import ComponentCard from "../../common/ComponentCard.tsx";

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
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-500">
            {icon}
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
);

const LoadingBlock = ({label}: {label: string}) => (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-8 text-sm text-gray-500">
        <LoaderCircle className="h-4 w-4 animate-spin"/>
        {label}
    </div>
);

export default function LessonTeacherReviewPanel({lessonId}: Props) {
    const {data: user} = useUser();
    const canAccess = isTeacherSideRole(user?.roleName);
    const discussionsQuery = useLessonDiscussions(canAccess ? lessonId : undefined);
    const tasksQuery = useLessonTasksReview(canAccess ? lessonId : undefined);
    const replyMutation = useReplyDiscussion(lessonId);
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

    const lessonTasks = tasksQuery.data || [];
    const homeworkTasks = useMemo(
        () => lessonTasks.filter((task) => task.type.includes("HOMEWORK")),
        [lessonTasks]
    );
    const quizTasks = useMemo(
        () => lessonTasks.filter((task) => task.type.includes("QUIZ")),
        [lessonTasks]
    );

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
    const quizResultsQuery = useQuizResults(selectedQuizTaskId || undefined);
    const quizSessionDetailQuery = useQuizSessionDetail(selectedSessionId || undefined, !!selectedSessionId);

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
                <TabsList className="mb-6 h-auto flex-wrap rounded-2xl border border-slate-200 bg-white p-1">
                    <TabsTrigger value="discussion" className="gap-2 px-5 py-3">
                        <MessageSquareReply className="h-4 w-4"/>
                        Discussion
                    </TabsTrigger>
                    <TabsTrigger value="homework" className="gap-2 px-5 py-3">
                        <Paperclip className="h-4 w-4"/>
                        Homework
                    </TabsTrigger>
                    <TabsTrigger value="quiz-results" className="gap-2 px-5 py-3">
                        <FileQuestion className="h-4 w-4"/>
                        Quiz Results
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="discussion" className="mt-0">
                    <ComponentCard
                        title="Discussion"
                        desc="Teacher va Business Admin student commentiga reply yoza oladi."
                    >
                        <div>
                            <p className="text-sm text-gray-600">
                                Teacher va Business Admin student commentiga reply yoza oladi.
                            </p>
                        </div>

                        <div className="mt-5">
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
                                            onOpenReply={() => {
                                                setOpenReplyId((current) => current === thread.id ? null : thread.id);
                                                setReplyDraft("");
                                            }}
                                            onReplyDraftChange={setReplyDraft}
                                            onSubmit={handleReplySubmit}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </ComponentCard>
                </TabsContent>

                <TabsContent value="homework" className="mt-0">
                    <section className="grid gap-6 xl:grid-cols-[320px_minmax(420px,1fr)]">
                        <ComponentCard
                            title="Homework Tasks"
                            desc="Lesson ichidagi `HOMEWORK` tasklar shu yerda chiqadi."
                        >
                            <p className="text-sm text-gray-600">
                                Lesson ichidagi `HOMEWORK` tasklar shu yerda chiqadi.
                            </p>

                            <div className="mt-5">
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
                                                className={`w-full rounded-2xl border p-4 text-left transition ${
                                                    selectedHomeworkTaskId === task.id
                                                        ? "border-blue-300 bg-blue-50"
                                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                                }`}
                                            >
                                                <p className="font-semibold text-gray-900">{task.title}</p>
                                                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{task.type}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ComponentCard>

                        <ComponentCard
                            title="Homework Submissions"
                            desc="Student submission comment, link, file, score va feedback shu yerda ko‘rinadi."
                        >
                            <p className="text-sm text-gray-600">
                                Student submission comment, link, file, score va feedback shu yerda ko‘rinadi.
                            </p>

                            <div className="mt-5">
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
                                            <div key={submission.submissionId} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{submission.studentName}</p>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Submitted: {formatDateTime(submission.submittedAt)}
                                                        </p>
                                                        {submission.reviewedAt && (
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                Reviewed: {formatDateTime(submission.reviewedAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button type="button" variant="outline" onClick={() => openReviewDrawer(submission)}>
                                                        Review
                                                    </Button>
                                                </div>

                                                {submission.comment && (
                                                    <p className="mt-4 text-sm text-gray-700">{submission.comment}</p>
                                                )}

                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    {submission.externalUrl && (
                                                        <a
                                                            href={submission.externalUrl}
                                                            target="_blank"
                                                            rel="noreferrer noopener"
                                                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-blue-700"
                                                        >
                                                            <ArrowUpRight className="h-4 w-4"/>
                                                            Open link
                                                        </a>
                                                    )}

                                                    {submission.attachmentIds.map((attachmentId, index) => (
                                                        <button
                                                            key={attachmentId}
                                                            type="button"
                                                            onClick={() => handleAttachmentDownload(attachmentId)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700"
                                                        >
                                                            <Download className="h-4 w-4"/>
                                                            Download file {index + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-xl bg-white p-3">
                                                        <p className="text-xs uppercase tracking-wide text-gray-500">Score</p>
                                                        <p className="mt-1 font-semibold text-gray-900">
                                                            {submission.score ?? "Not graded"}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl bg-white p-3">
                                                        <p className="text-xs uppercase tracking-wide text-gray-500">Feedback</p>
                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {submission.feedback || "Feedback yo‘q"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ComponentCard>
                    </section>
                </TabsContent>

                <TabsContent value="quiz-results" className="mt-0">
                    <section className="grid gap-6 xl:grid-cols-[320px_minmax(420px,1fr)]">
                        <ComponentCard
                            title="Quiz Tasks"
                            desc="Lesson ichidagi `QUIZ` tasklarni tanlab natijalarni ko‘rish mumkin."
                        >
                            <p className="text-sm text-gray-600">
                                Lesson ichidagi `QUIZ` tasklarni tanlab natijalarni ko‘rish mumkin.
                            </p>

                            <div className="mt-5">
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
                                                className={`w-full rounded-2xl border p-4 text-left transition ${
                                                    selectedQuizTaskId === task.id
                                                        ? "border-violet-300 bg-violet-50"
                                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                                }`}
                                            >
                                                <p className="font-semibold text-gray-900">{task.title}</p>
                                                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{task.type}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ComponentCard>

                        <ComponentCard
                            title="Quiz Results"
                            desc="Studentlar bo‘yicha result table va session detail shu yerda ko‘rinadi."
                        >
                            <p className="text-sm text-gray-600">
                                Studentlar bo‘yicha result table va session detail shu yerda ko‘rinadi.
                            </p>

                            <div className="mt-5">
                                {quizResultsQuery.isLoading ? (
                                    <LoadingBlock label="Quiz resultlar yuklanmoqda..."/>
                                ) : quizResultsQuery.isError ? (
                                    <StateCard
                                        title="Quiz resultlar yuklanmadi"
                                        description={parseApiError(quizResultsQuery.error).message}
                                        icon={<AlertCircle className="h-5 w-5"/>}
                                    />
                                ) : !quizResultsQuery.data?.length ? (
                                    <StateCard
                                        title="Hozircha test natijalari yo‘q"
                                        description="Tanlangan quiz task uchun session natijalari hali mavjud emas."
                                        icon={<FileQuestion className="h-5 w-5"/>}
                                    />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead>
                                            <tr className="text-left text-gray-500">
                                                <th className="py-3 pr-4 font-medium">Student</th>
                                                <th className="py-3 pr-4 font-medium">Percentage</th>
                                                <th className="py-3 pr-4 font-medium">Correct/Wrong</th>
                                                <th className="py-3 pr-4 font-medium">Started</th>
                                                <th className="py-3 pr-4 font-medium">Finished</th>
                                                <th className="py-3 font-medium">Action</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                            {quizResultsQuery.data.map((result) => (
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
                            </div>
                        </ComponentCard>
                    </section>
                </TabsContent>
            </Tabs>

            {reviewTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Review Submission</h3>
                                <p className="mt-1 text-sm text-gray-600">{reviewTarget.studentName}</p>
                            </div>
                            <button type="button" onClick={() => setReviewTarget(null)} className="text-gray-400 hover:text-gray-700">
                                <XCircle className="h-5 w-5"/>
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Score</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={reviewScore}
                                    onChange={(event) => setReviewScore(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Feedback</label>
                                <Textarea
                                    value={reviewFeedback}
                                    onChange={(event) => setReviewFeedback(event.target.value)}
                                    className="min-h-[140px]"
                                />
                            </div>
                            <label className="flex items-center gap-3 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={reviewRevisionRequested}
                                    onChange={(event) => setReviewRevisionRequested(event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                Revision requested
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setReviewTarget(null)}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={handleSaveReview} disabled={reviewMutation.isPending}>
                                {reviewMutation.isPending ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin"/>
                                        Saving...
                                    </>
                                ) : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {selectedSessionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Quiz Session Detail</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Student javoblari va to‘g‘ri variantlar.
                                </p>
                            </div>
                            <button type="button" onClick={() => setSelectedSessionId(null)} className="text-gray-400 hover:text-gray-700">
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
                                        <div key={question.orderIndex} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-gray-500">
                                                        Question {question.orderIndex}
                                                    </p>
                                                    <p className="mt-2 font-medium text-gray-900">{question.questionText}</p>
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    question.correct ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                                }`}>
                                                    {question.correct ? "Correct" : "Incorrect"}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                                {[
                                                    {key: "A", value: question.optionA},
                                                    {key: "B", value: question.optionB},
                                                    {key: "C", value: question.optionC},
                                                    {key: "D", value: question.optionD},
                                                ].filter((option) => option.value).map((option) => (
                                                    <div key={option.key} className="rounded-xl bg-white p-3 text-sm text-gray-700">
                                                        <span className="font-semibold text-gray-900">{option.key}.</span> {option.value}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <SummaryCard label="Selected" value={question.selectedOption || "-"}/>
                                                <SummaryCard label="Correct option" value={question.correctOption || "-"}/>
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
    onOpenReply,
    onReplyDraftChange,
    onSubmit,
}: {
    thread: DiscussionThread;
    openReplyId: string | null;
    replyDraft: string;
    isSending: boolean;
    onOpenReply: () => void;
    onReplyDraftChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
    const isOpen = openReplyId === thread.id;

    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="font-semibold text-gray-900">{thread.author}</p>
                    <p className="mt-1 text-sm text-gray-600">{thread.content}</p>
                </div>
                <p className="text-xs text-gray-500">{thread.createdAt}</p>
            </div>

            {thread.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                    {thread.replies.map((reply) => (
                        <div key={reply.id} className="rounded-xl bg-white p-3">
                            <div className="flex items-start justify-between gap-3">
                                <p className="font-medium text-gray-900">{reply.author}</p>
                                <p className="text-xs text-gray-500">{reply.createdAt}</p>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{reply.content}</p>
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
                        className="min-h-[120px] bg-white"
                    />
                    <Button type="submit" disabled={isSending || !replyDraft.trim()}>
                        {isSending ? (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin"/>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4"/>
                                Send reply
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
            <td className="py-3 pr-4 font-medium text-gray-900">{result.studentName}</td>
            <td className="py-3 pr-4 text-gray-700">
                {result.percentage != null ? `${result.percentage}%` : "-"}
            </td>
            <td className="py-3 pr-4 text-gray-700">
                {result.correct ?? "-"} / {result.wrong ?? "-"}
            </td>
            <td className="py-3 pr-4 text-gray-500">{formatDateTime(result.startedAt)}</td>
            <td className="py-3 pr-4 text-gray-500">{formatDateTime(result.finishedAt)}</td>
            <td className="py-3">
                <Button type="button" variant="outline" onClick={onViewDetail}>
                    View detail
                </Button>
            </td>
        </tr>
    );
}

function SummaryCard({label, value}: {label: string; value: string}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-1 font-semibold text-gray-900">{value}</p>
        </div>
    );
}
