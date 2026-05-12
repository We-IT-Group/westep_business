import {useEffect, useMemo, useState} from "react";
import moment from "moment";
import {
    AlertCircle,
    Download,
    FileText,
    Inbox,
    Link as LinkIcon,
    LoaderCircle,
    Send,
    XCircle,
} from "lucide-react";
import {Lesson, Module} from "../../types/types.ts";
import {useGetModules} from "../../api/module/useModule.ts";
import {
    isStudentRole,
    isTeacherSideRole,
    useUser,
} from "../../api/auth/useAuth.ts";
import type {HomeworkSubmissionReview} from "../../api/lessonReview/lessonReviewApi.ts";
import {
    useDownloadAttachment,
    useHomeworkSubmissions,
    useLessonTasksReview,
    useMyHomeworkSubmissionsByLesson,
    useReviewHomeworkSubmission,
    useSubmitHomework,
} from "../../api/lessonReview/useLessonReview.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {Button} from "../ui/button.tsx";
import {Textarea} from "../ui/textarea.tsx";
import {Badge} from "../ui/badge.tsx";

type ModuleWithLessons = Module & {lessons?: Lesson[]};

function formatDate(value?: string) {
    if (!value) return "No date";
    return moment(value).isValid() ? moment(value).format("MMM D, HH:mm") : value;
}

function EmptyState({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
                {icon}
            </div>
            <h4 className="mt-4 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">{title}</h4>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

function LoadingState({label}: {label: string}) {
    return (
        <div className="flex min-h-[220px] items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white/90 p-8 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin text-blue-600"/>
            {label}
        </div>
    );
}

function RevisionBadge({visible}: {visible?: boolean}) {
    if (!visible) return null;

    return (
        <Badge className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            Revision requested
        </Badge>
    );
}

export default function HomeworkReviewSection({
    courseId,
    initialStudentId,
}: {
    courseId: string;
    initialStudentId?: string;
}) {
    const {data: user} = useUser();
    const {data: modules, isLoading: isModulesLoading} = useGetModules(courseId);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const allLessons = ((modules as ModuleWithLessons[] | undefined)
        ?.flatMap((module) => module.lessons || [])) || [];
    const isStudent = isStudentRole(user?.roleName);
    const canReview = isTeacherSideRole(user?.roleName);

    useEffect(() => {
        if (!selectedLessonId && allLessons[0]?.id) {
            setSelectedLessonId(allLessons[0].id);
        }
    }, [allLessons, selectedLessonId]);

    return (
        <div className="flex min-h-[700px] flex-col p-6">
            <LessonHomeworkPanel
                lessonId={selectedLessonId}
                lessons={allLessons}
                isLessonsLoading={isModulesLoading}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
                onSelectLesson={(lessonId) => {
                    setSelectedLessonId(lessonId);
                    setSelectedTaskId(null);
                }}
                isStudent={isStudent}
                canReview={canReview}
                initialStudentId={initialStudentId}
            />
        </div>
    );
}

function LessonHomeworkPanel({
    lessonId,
    lessons,
    isLessonsLoading,
    selectedTaskId,
    onSelectTask,
    onSelectLesson,
    isStudent,
    canReview,
    initialStudentId,
}: {
    lessonId: string | null;
    lessons: Lesson[];
    isLessonsLoading: boolean;
    selectedTaskId: string | null;
    onSelectTask: (taskId: string | null) => void;
    onSelectLesson: (lessonId: string) => void;
    isStudent: boolean;
    canReview: boolean;
    initialStudentId?: string;
}) {
    const tasksQuery = useLessonTasksReview(lessonId || undefined, !!lessonId);
    const homeworkTasks = useMemo(
        () => (tasksQuery.data || []).filter((task) => task.type.includes("HOMEWORK")),
        [tasksQuery.data],
    );

    useEffect(() => {
        if (!selectedTaskId && homeworkTasks[0]?.id) {
            onSelectTask(homeworkTasks[0].id);
        }
    }, [homeworkTasks, onSelectTask, selectedTaskId]);

    return (
        <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Homework tasks</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Lesson homework oqimi</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                        Student comment, link va file yuboradi. Staff submissionni ko‘rib feedback, score va revision request beradi.
                    </p>
                </div>

                <div className="mt-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Lesson tanlang</p>
                    {isLessonsLoading ? (
                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({length: 4}).map((_, index) => (
                                <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"/>
                            ))}
                        </div>
                    ) : !lessons.length ? (
                        <div className="mt-4">
                            <EmptyState
                                title="Lesson topilmadi"
                                description="Homework oqimi uchun avval lesson bo‘lishi kerak."
                                icon={<Inbox className="h-7 w-7"/>}
                            />
                        </div>
                    ) : (
                        <div className="mt-3 flex flex-wrap gap-3">
                            {lessons.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => onSelectLesson(lesson.id)}
                                    className={`rounded-2xl border px-5 py-3 text-left transition ${
                                        lessonId === lesson.id
                                            ? "border-blue-200 bg-blue-50 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10"
                                            : "border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <p className="font-black text-slate-950 dark:text-slate-100">{lesson.name}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {tasksQuery.isLoading ? (
                    <LoadingState label="Homework tasklar yuklanmoqda..."/>
                ) : tasksQuery.isError ? (
                    <EmptyState
                        title="Tasklar yuklanmadi"
                        description={parseApiError(tasksQuery.error).message}
                        icon={<AlertCircle className="h-7 w-7"/>}
                    />
                ) : !homeworkTasks.length ? (
                    <EmptyState
                        title="Homework topilmadi"
                        description="Bu lesson uchun homework task hali yaratilmagan."
                        icon={<XCircle className="h-7 w-7"/>}
                    />
                ) : (
                    <div className="mt-6 flex flex-wrap gap-3">
                        {homeworkTasks.map((task) => (
                            <button
                                key={task.id}
                                type="button"
                                onClick={() => onSelectTask(task.id)}
                                className={`rounded-2xl border px-5 py-3 text-left transition ${
                                    selectedTaskId === task.id
                                        ? "border-blue-200 bg-blue-50 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10"
                                        : "border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                                }`}
                            >
                                <p className="font-black text-slate-950 dark:text-slate-100">{task.title}</p>
                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{task.type}</p>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {selectedTaskId ? (
                isStudent ? (
                    <StudentHomeworkPanel lessonId={lessonId || ""} taskId={selectedTaskId}/>
                ) : canReview ? (
                    <StaffHomeworkPanel taskId={selectedTaskId} initialStudentId={initialStudentId}/>
                ) : (
                    <EmptyState
                        title="Homework paneli yopiq"
                        description="Bu role uchun homework oqimi ruxsat etilmagan."
                        icon={<AlertCircle className="h-7 w-7"/>}
                    />
                )
            ) : (
                <EmptyState
                    title="Task tanlanmagan"
                    description="Davom etish uchun homework task tanlang."
                    icon={<FileText className="h-7 w-7"/>}
                />
            )}
        </div>
    );
}

function StudentHomeworkPanel({lessonId, taskId}: {lessonId: string; taskId: string}) {
    const submissionsQuery = useMyHomeworkSubmissionsByLesson(lessonId);
    const submitMutation = useSubmitHomework(taskId, lessonId);
    const downloadMutation = useDownloadAttachment();
    const [comment, setComment] = useState("");
    const [link, setLink] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const filteredSubmissions = useMemo(
        () => (submissionsQuery.data || []).filter((submission) => submission.taskId === taskId),
        [submissionsQuery.data, taskId],
    );

    const handleSubmit = async () => {
        await submitMutation.mutateAsync({
            comment: comment.trim() || undefined,
            link: link.trim() || undefined,
            files,
        });
        setComment("");
        setLink("");
        setFiles([]);
    };

    const handleDownload = async (attachmentId: string) => {
        const blob = await downloadMutation.mutateAsync(attachmentId);
        const blobUrl = URL.createObjectURL(blob);
        const linkEl = document.createElement("a");
        linkEl.href = blobUrl;
        linkEl.download = attachmentId;
        document.body.appendChild(linkEl);
        linkEl.click();
        linkEl.remove();
        URL.revokeObjectURL(blobUrl);
    };

    return (
        <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                <div>
                    <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Homework submit</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                        Comment, external link va file yuboring. Keyin own submissions history pastda ko‘rinadi.
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    <Textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Homework bo‘yicha izoh yoki tushuntirish yozing..."
                        className="min-h-[110px] rounded-[24px] border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60"
                    />
                    <input
                        type="url"
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                        placeholder="https://..."
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-200 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                    <input
                        type="file"
                        multiple
                        onChange={(event) => setFiles(Array.from(event.target.files || []))}
                        className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                    />
                    {files.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {files.map((file) => (
                                <Badge key={file.name + file.size} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {file.name}
                                </Badge>
                            ))}
                        </div>
                    ) : null}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending || (!comment.trim() && !link.trim() && files.length === 0)}
                            className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {submitMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                            Homework yuborish
                        </Button>
                    </div>
                </div>
            </section>

            {submissionsQuery.isLoading ? (
                <LoadingState label="Own submissions yuklanmoqda..."/>
            ) : submissionsQuery.isError ? (
                <EmptyState
                    title="Own submissions yuklanmadi"
                    description={parseApiError(submissionsQuery.error).message}
                    icon={<AlertCircle className="h-7 w-7"/>}
                />
            ) : !filteredSubmissions.length ? (
                <EmptyState
                    title="Submission hali yo‘q"
                    description="Tanlangan task bo‘yicha hali homework yubormagansiz."
                    icon={<Inbox className="h-7 w-7"/>}
                />
            ) : (
                <div className="space-y-4">
                    {filteredSubmissions.map((submission) => (
                        <article key={submission.submissionId} className="rounded-[28px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-lg font-black text-slate-950 dark:text-slate-100">{submission.taskTitle || "Homework submission"}</h4>
                                        <RevisionBadge visible={submission.revisionRequested}/>
                                    </div>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                        Submitted: {formatDate(submission.submittedAt)}
                                        {submission.reviewedAt ? ` • Reviewed: ${formatDate(submission.reviewedAt)}` : ""}
                                    </p>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        Score: {submission.score ?? "-"}
                                    </Badge>
                                    <Badge className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                        Files: {submission.attachmentIds.length}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Comment</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{submission.comment || "Comment yo‘q"}</p>
                                </div>
                                <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Feedback</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{submission.feedback || "Feedback hali yo‘q"}</p>
                                </div>
                            </div>

                            {submission.externalUrl ? (
                                <a
                                    href={submission.externalUrl}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                                >
                                    <LinkIcon className="h-4 w-4"/>
                                    External linkni ochish
                                </a>
                            ) : null}

                            {submission.attachmentIds.length ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {submission.attachmentIds.map((attachmentId, index) => (
                                        <Button key={attachmentId} type="button" variant="outline" onClick={() => handleDownload(attachmentId)} className="rounded-2xl">
                                            <Download className="h-4 w-4"/>
                                            File {index + 1}
                                        </Button>
                                    ))}
                                </div>
                            ) : null}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

function StaffHomeworkPanel({taskId, initialStudentId}: {taskId: string; initialStudentId?: string}) {
    const submissionsQuery = useHomeworkSubmissions(taskId);
    const [reviewTarget, setReviewTarget] = useState<HomeworkSubmissionReview | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const studentBuckets = useMemo(() => {
        const grouped = new Map<string, {
            studentId: string;
            studentName: string;
            submissions: HomeworkSubmissionReview[];
        }>();

        (submissionsQuery.data || []).forEach((submission) => {
            const existing = grouped.get(submission.studentId);
            if (existing) {
                existing.submissions.push(submission);
                return;
            }

            grouped.set(submission.studentId, {
                studentId: submission.studentId,
                studentName: submission.studentName,
                submissions: [submission],
            });
        });

        return Array.from(grouped.values());
    }, [submissionsQuery.data]);

    const selectedStudentBucket = useMemo(
        () => studentBuckets.find((student) => student.studentId === selectedStudentId) || null,
        [selectedStudentId, studentBuckets],
    );

    useEffect(() => {
        if (!initialStudentId || selectedStudentId) return;
        const matchingStudent = studentBuckets.find((student) => student.studentId === initialStudentId);
        if (matchingStudent) {
            setSelectedStudentId(matchingStudent.studentId);
        }
    }, [initialStudentId, selectedStudentId, studentBuckets]);

    return (
        <div className="space-y-6">
            {submissionsQuery.isLoading ? (
                <LoadingState label="Homework submissions yuklanmoqda..."/>
            ) : submissionsQuery.isError ? (
                <EmptyState
                    title="Submissions yuklanmadi"
                    description={parseApiError(submissionsQuery.error).message}
                    icon={<AlertCircle className="h-7 w-7"/>}
                />
            ) : !submissionsQuery.data?.length ? (
                <EmptyState
                    title="Submission topilmadi"
                    description="Bu task bo‘yicha studentlar hali homework yubormagan."
                    icon={<Inbox className="h-7 w-7"/>}
                />
            ) : selectedStudentBucket ? (
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => setSelectedStudentId(null)} className="rounded-2xl">
                            <XCircle className="h-4 w-4"/>
                            Orqaga
                        </Button>
                        <div>
                            <h4 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">{selectedStudentBucket.studentName}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Student yuborgan homeworklar ro‘yxati.</p>
                        </div>
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1100px] px-4 pb-6">
                                <div className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 px-2 py-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                                    <div>Lesson</div>
                                    <div>Vazifa</div>
                                    <div>Topshirilgan</div>
                                    <div>Baho</div>
                                    <div>Tekshirildi</div>
                                    <div>Holat</div>
                                    <div>Amal</div>
                                </div>

                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {selectedStudentBucket.submissions.map((submission) => {
                                        const isReviewed = submission.score != null || Boolean(submission.feedback?.trim());
                                        return (
                                            <div
                                                key={submission.submissionId}
                                                className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_1fr_1fr_1fr] gap-4 rounded-2xl px-2 py-6 transition hover:bg-white/70 dark:hover:bg-white/[0.03]"
                                            >
                                                <div className="self-center">
                                                    <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{submission.lessonName || "-"}</div>
                                                </div>

                                                <div className="self-center">
                                                    <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{submission.taskTitle || "-"}</div>
                                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Homework task</div>
                                                </div>

                                                <div className="self-center text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {formatDate(submission.submittedAt)}
                                                </div>

                                                <div className="self-center text-base font-semibold text-slate-900 dark:text-slate-100">
                                                    {submission.score ?? "-"}
                                                </div>

                                                <div className="self-center text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {submission.reviewedAt ? formatDate(submission.reviewedAt) : "-"}
                                                </div>

                                                <div className="self-center">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${isReviewed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                                                            {isReviewed ? "Reviewed" : "Pending"}
                                                        </Badge>
                                                        <RevisionBadge visible={submission.revisionRequested}/>
                                                    </div>
                                                </div>

                                                <div className="self-center">
                                                    <Button type="button" onClick={() => setReviewTarget(submission)} className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700">
                                                        Tekshirish
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="overflow-x-auto">
                        <div className="min-w-[980px] px-4 pb-6">
                            <div className="grid grid-cols-[2.2fr_1fr_0.9fr_0.9fr_1fr_1fr] gap-4 border-b border-slate-200 px-2 py-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-3">
                                    <span>O‘quvchi</span>
                                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                                        {studentBuckets.length}
                                    </span>
                                </div>
                                <div>Lessonlar</div>
                                <div>Topshiriq</div>
                                <div>Tekshirilgan</div>
                                <div>Oxirgi topshirgan</div>
                                <div>Amal</div>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {studentBuckets.map((student) => {
                                    const submissionCount = student.submissions.length;
                                    const reviewedCount = student.submissions.filter((submission) => submission.score != null || Boolean(submission.feedback?.trim())).length;
                                    const latestSubmission = [...student.submissions].sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""))[0];
                                    return (
                                        <button
                                            key={student.studentId}
                                            type="button"
                                            onClick={() => setSelectedStudentId(student.studentId)}
                                            className="grid w-full grid-cols-[2.2fr_1fr_0.9fr_0.9fr_1fr_1fr] gap-4 rounded-2xl px-2 py-6 text-left transition hover:bg-white/70 dark:hover:bg-white/[0.03]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white dark:bg-white dark:text-slate-950">
                                                    {(student.studentName || "S").trim().charAt(0).toUpperCase()}
                                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#48bf45] ring-2 ring-white dark:ring-slate-950" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{student.studentName}</div>
                                                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Student homeworklari</div>
                                                </div>
                                            </div>

                                            <div className="self-center text-base font-semibold text-slate-900 dark:text-slate-100">
                                                {new Set(student.submissions.map((submission) => submission.lessonId)).size}
                                            </div>

                                            <div className="self-center text-base font-semibold text-slate-900 dark:text-slate-100">
                                                {submissionCount}
                                            </div>

                                            <div className="self-center text-base font-semibold text-slate-900 dark:text-slate-100">
                                                {reviewedCount}
                                            </div>

                                            <div className="self-center text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {latestSubmission ? formatDate(latestSubmission.submittedAt) : "-"}
                                            </div>

                                            <div className="self-center">
                                                <Button type="button" className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700">
                                                    Ko‘rish
                                                </Button>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {reviewTarget ? (
                <HomeworkReviewDrawer submission={reviewTarget} taskId={taskId} onClose={() => setReviewTarget(null)}/>
            ) : null}
        </div>
    );
}

function HomeworkReviewDrawer({
    submission,
    taskId,
    onClose,
}: {
    submission: HomeworkSubmissionReview;
    taskId: string;
    onClose: () => void;
}) {
    const reviewMutation = useReviewHomeworkSubmission(taskId);
    const downloadMutation = useDownloadAttachment();
    const [score, setScore] = useState<number>(submission.score || 0);
    const [feedback, setFeedback] = useState(submission.feedback || "");
    const [revisionRequested, setRevisionRequested] = useState(Boolean(submission.revisionRequested));

    const handleDownload = async (attachmentId: string) => {
        const blob = await downloadMutation.mutateAsync(attachmentId);
        const blobUrl = URL.createObjectURL(blob);
        const linkEl = document.createElement("a");
        linkEl.href = blobUrl;
        linkEl.download = attachmentId;
        document.body.appendChild(linkEl);
        linkEl.click();
        linkEl.remove();
        URL.revokeObjectURL(blobUrl);
    };

    const handleSave = async () => {
        await reviewMutation.mutateAsync({
            submissionId: submission.submissionId,
            score,
            feedback,
            revisionRequested,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[36px] border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">Homework feedback</h3>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{submission.studentName} • {submission.taskTitle}</p>
                    </div>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <XCircle className="h-4 w-4"/>
                        Yopish
                    </Button>
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                    <div className="space-y-5">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Student comment</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{submission.comment || "Comment yo‘q"}</p>
                        </div>

                        {submission.externalUrl ? (
                            <a
                                href={submission.externalUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
                            >
                                <LinkIcon className="h-4 w-4"/>
                                External linkni ochish
                            </a>
                        ) : null}

                        {submission.attachmentIds.length ? (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Attachments</p>
                                <div className="flex flex-wrap gap-2">
                                    {submission.attachmentIds.map((attachmentId, index) => (
                                        <Button key={attachmentId} type="button" variant="outline" onClick={() => handleDownload(attachmentId)} className="rounded-2xl">
                                            <Download className="h-4 w-4"/>
                                            File {index + 1}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-5">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Score</p>
                            <div className="mt-2 flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={score}
                                    onChange={(event) => setScore(Number(event.target.value))}
                                    className="h-3 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600 dark:bg-slate-800"
                                />
                                <span className="inline-flex min-w-16 justify-center rounded-2xl bg-blue-600 px-3 py-2 text-lg font-black text-white">{score}</span>
                            </div>
                        </div>

                        <Textarea
                            value={feedback}
                            onChange={(event) => setFeedback(event.target.value)}
                            placeholder="Feedback yozing..."
                            className="min-h-[150px] rounded-[24px] border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60"
                        />

                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <input
                                type="checkbox"
                                checked={revisionRequested}
                                onChange={(event) => setRevisionRequested(event.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <p className="font-black text-slate-950 dark:text-slate-100">Revision request</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Student qayta topshirishi kerak bo‘lsa yoqing.</p>
                            </div>
                        </label>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Bekor qilish</Button>
                            <Button type="button" onClick={handleSave} disabled={reviewMutation.isPending} className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700">
                                {reviewMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                Feedback saqlash
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
