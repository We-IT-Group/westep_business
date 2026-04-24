import {useEffect, useMemo, useState} from "react";
import {useQueries} from "@tanstack/react-query";
import {
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    LoaderCircle,
    MessageSquare,
    Phone,
    Users,
} from "lucide-react";
import {Button} from "../ui/button.tsx";
import {useCourseStudents} from "../../api/courseStudents/useCourseStudents.ts";
import {useGetModules} from "../../api/module/useModule.ts";
import {getAllLessons} from "../../api/lessons/lessonApi.ts";
import {
    DiscussionThread,
    getHomeworkSubmissionsReview,
    getLessonDiscussions,
    getLessonTasksReview,
    getQuizResultsByTask,
    HomeworkSubmissionReview,
    LessonTaskReview,
    QuizResultSummary,
} from "../../api/lessonReview/lessonReviewApi.ts";
import {Lesson} from "../../types/types.ts";

type StudentTab = "homework" | "quiz" | "message";

const formatDateTime = (value?: string) => {
    if (!value) return "Faollik yo‘q";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("uz-UZ", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const matchesStudent = (
    entry: {studentId?: string; studentName?: string; author?: string},
    selectedStudent: {studentId: string; studentName: string},
) => {
    if (entry.studentId && selectedStudent.studentId) {
        return entry.studentId === selectedStudent.studentId;
    }

    const left = (entry.studentName || entry.author || "").trim().toLowerCase();
    const right = selectedStudent.studentName.trim().toLowerCase();
    return Boolean(left && right && left === right);
};

const tabs: Array<{id: StudentTab; label: string; icon: typeof ClipboardCheck}> = [
    {id: "homework", label: "Uyga vazifa", icon: ClipboardCheck},
    {id: "quiz", label: "Test", icon: CheckCircle2},
    {id: "message", label: "Message", icon: MessageSquare},
];

export default function CourseStudentsSection({courseId}: {courseId: string}) {
    const {data: students = [], isLoading: isStudentsLoading, isError, error} = useCourseStudents(courseId);
    const {data: modules = [], isLoading: isModulesLoading} = useGetModules(courseId);
    const [selectedStudentCourseId, setSelectedStudentCourseId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<StudentTab>("homework");

    const lessonQueries = useQueries({
        queries: modules.map((module) => ({
            queryKey: ["lessons", module.id],
            queryFn: () => getAllLessons(module.id),
            enabled: modules.length > 0,
            staleTime: 60_000,
        })),
    });

    const lessons = useMemo(
        () => lessonQueries.flatMap((query) => (query.data || []) as Lesson[]),
        [lessonQueries],
    );

    useEffect(() => {
        if (!students.length) {
            setSelectedStudentCourseId(null);
            return;
        }

        setSelectedStudentCourseId((prev) =>
            prev && students.some((student) => student.studentCourseId === prev)
                ? prev
                : students[0].studentCourseId,
        );
    }, [students]);

    const selectedStudent = useMemo(
        () => students.find((student) => student.studentCourseId === selectedStudentCourseId) || null,
        [selectedStudentCourseId, students],
    );

    const taskQueries = useQueries({
        queries: lessons.map((lesson) => ({
            queryKey: ["lesson-review-tasks", lesson.id],
            queryFn: () => getLessonTasksReview(lesson.id),
            enabled: lessons.length > 0,
            staleTime: 60_000,
        })),
    });

    const allTasks = useMemo(
        () => taskQueries.flatMap((query) => (query.data || []) as LessonTaskReview[]),
        [taskQueries],
    );

    const homeworkTaskIds = useMemo(
        () => allTasks.filter((task) => task.type === "HOMEWORK").map((task) => task.id),
        [allTasks],
    );

    const quizTaskIds = useMemo(
        () => allTasks.filter((task) => task.type === "QUIZ").map((task) => task.id),
        [allTasks],
    );

    const homeworkQueries = useQueries({
        queries: homeworkTaskIds.map((taskId) => ({
            queryKey: ["lesson-homework-submissions", taskId],
            queryFn: () => getHomeworkSubmissionsReview(taskId),
            enabled: !!selectedStudent && homeworkTaskIds.length > 0,
            staleTime: 60_000,
        })),
    });

    const quizQueries = useQueries({
        queries: quizTaskIds.map((taskId) => ({
            queryKey: ["lesson-quiz-results", taskId],
            queryFn: () => getQuizResultsByTask(taskId),
            enabled: !!selectedStudent && quizTaskIds.length > 0,
            staleTime: 60_000,
        })),
    });

    const discussionQueries = useQueries({
        queries: lessons.map((lesson) => ({
            queryKey: ["lesson-discussions", lesson.id],
            queryFn: () => getLessonDiscussions(lesson.id),
            enabled: !!selectedStudent && lessons.length > 0,
            staleTime: 60_000,
        })),
    });

    const homeworkItems = useMemo(() => {
        if (!selectedStudent) return [];

        return homeworkQueries
            .flatMap((query) => (query.data || []) as HomeworkSubmissionReview[])
            .filter((item) => matchesStudent(item, selectedStudent));
    }, [homeworkQueries, selectedStudent]);

    const quizItems = useMemo(() => {
        if (!selectedStudent) return [];

        return quizQueries
            .flatMap((query) => (query.data || []) as QuizResultSummary[])
            .filter((item) => matchesStudent(item, selectedStudent));
    }, [quizQueries, selectedStudent]);

    const messageItems = useMemo(() => {
        if (!selectedStudent) return [];

        return discussionQueries
            .flatMap((query) => (query.data || []) as DiscussionThread[])
            .flatMap((thread) => {
                const entries = [];

                if (matchesStudent({author: thread.author, studentId: thread.studentId}, selectedStudent)) {
                    entries.push({
                        id: thread.id,
                        type: "comment",
                        content: thread.content,
                        createdAt: thread.createdAt,
                    });
                }

                thread.replies.forEach((reply) => {
                    if (matchesStudent({author: reply.author, studentId: reply.studentId}, selectedStudent)) {
                        entries.push({
                            id: reply.id,
                            type: "reply",
                            content: reply.content,
                            createdAt: reply.createdAt,
                        });
                    }
                });

                return entries;
            })
            .sort((left, right) => (right.createdAt || "").localeCompare(left.createdAt || ""));
    }, [discussionQueries, selectedStudent]);

    const isDetailLoading =
        lessonQueries.some((query) => query.isLoading || query.isFetching)
        || taskQueries.some((query) => query.isLoading)
        || homeworkQueries.some((query) => query.isLoading)
        || quizQueries.some((query) => query.isLoading)
        || discussionQueries.some((query) => query.isLoading);

    return (
        <div className="flex min-h-[760px] flex-col">
            <div className="grid h-full grid-cols-1 lg:grid-cols-12">
                <div className="border-r border-slate-100 bg-slate-50/30 p-6 lg:col-span-5">
                    <div className="mb-6">
                        <h3 className="text-lg font-black tracking-tight text-slate-900">Kurs studentlari</h3>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Course audience monitor</p>
                    </div>

                    {isStudentsLoading || isModulesLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-blue-600" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Studentlar yuklanmoqda...</p>
                        </div>
                    ) : isError ? (
                        <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-5 text-sm font-medium text-rose-600">
                            {error instanceof Error ? error.message : "Studentlar yuklanmadi."}
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                            <Users className="mb-4 h-12 w-12 text-slate-300" />
                            <h4 className="text-lg font-black text-slate-900">Studentlar topilmadi</h4>
                            <p className="mt-2 text-sm font-medium text-slate-400">Bu kursga hali student biriktirilmagan.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {students.map((student) => {
                                const isActive = student.studentCourseId === selectedStudentCourseId;
                                return (
                                    <button
                                        key={student.studentCourseId}
                                        type="button"
                                        onClick={() => {
                                            setSelectedStudentCourseId(student.studentCourseId);
                                            setActiveTab("homework");
                                        }}
                                        className={`w-full rounded-[28px] border p-5 text-left transition ${
                                            isActive
                                                ? "border-blue-200 bg-white shadow-xl shadow-slate-200/50"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="text-lg font-black tracking-tight text-slate-900">{student.studentName}</div>
                                                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                                                    <Phone className="h-4 w-4" />
                                                    {student.phone || "Telefon yo‘q"}
                                                </div>
                                            </div>
                                            <div className="rounded-2xl bg-blue-50 px-3 py-2 text-right">
                                                <div className="text-xl font-black text-blue-700">{student.progressPercentage}%</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">Progress</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-3">
                                            <StatPill label="Darslar" value={`${student.completedLessons}/${student.totalLessons}`} />
                                            <StatPill label="Homework" value={student.homeworkSubmissionsCount} />
                                            <StatPill label="Test" value={student.quizAttemptsCount} />
                                            <StatPill label="Message" value={student.messageCount} />
                                            <StatPill label="Faollik" value={formatDateTime(student.lastActivityAt)} wide />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex flex-col p-8 lg:col-span-7">
                    {selectedStudent ? (
                        <>
                            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <h4 className="text-2xl font-black tracking-tight text-slate-900">{selectedStudent.studentName}</h4>
                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Homework, test va message detallarini bitta joyda ko‘ring.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <Button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`h-11 rounded-2xl px-5 text-xs font-black uppercase tracking-[0.2em] ${
                                                    isActive
                                                        ? "bg-slate-900 text-white hover:bg-black"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                            >
                                                <tab.icon className="h-4 w-4" />
                                                {tab.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            {isDetailLoading ? (
                                <div className="flex flex-1 flex-col items-center justify-center py-20">
                                    <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-blue-600" />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Student detail yuklanmoqda...</p>
                                </div>
                            ) : activeTab === "homework" ? (
                                <HomeworkDetailList items={homeworkItems} />
                            ) : activeTab === "quiz" ? (
                                <QuizDetailList items={quizItems} />
                            ) : (
                                <MessageDetailList items={messageItems} />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                            <Users className="mb-4 h-12 w-12 text-slate-300" />
                            <h4 className="text-lg font-black text-slate-900">Studentni tanlang</h4>
                            <p className="mt-2 max-w-sm text-sm font-medium text-slate-400">Chap tomondan student tanlasangiz, homework, test va message detail shu yerda ochiladi.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatPill({label, value, wide = false}: {label: string; value: string | number; wide?: boolean}) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 ${wide ? "col-span-2 xl:col-span-3" : ""}`}>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
            <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
        </div>
    );
}

function EmptyState({title, description}: {title: string; description: string}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-slate-300" />
            <h5 className="text-lg font-black text-slate-900">{title}</h5>
            <p className="mt-2 max-w-md text-sm font-medium text-slate-400">{description}</p>
        </div>
    );
}

function HomeworkDetailList({items}: {items: HomeworkSubmissionReview[]}) {
    if (!items.length) {
        return <EmptyState title="Homework topilmadi" description="Bu student uchun homework submission hozircha yo‘q." />;
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.submissionId} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg font-black text-slate-900">{item.taskTitle || "Homework"}</div>
                            <div className="mt-2 text-sm font-medium text-slate-500">{item.lessonName || "Lesson"}</div>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                            <div className="text-sm font-black text-emerald-700">{item.score ?? "-"}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Score</div>
                        </div>
                    </div>
                    <div className="mt-4 text-sm leading-7 text-slate-600">{item.comment || "Izoh qoldirilmagan."}</div>
                    <div className="mt-4 text-xs font-semibold text-slate-400">
                        Yuborilgan vaqt: {formatDateTime(item.submittedAt)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function QuizDetailList({items}: {items: QuizResultSummary[]}) {
    if (!items.length) {
        return <EmptyState title="Test natijalari topilmadi" description="Bu student uchun quiz urinishlari hozircha yo‘q." />;
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.sessionId} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg font-black text-slate-900">{item.taskTitle || "Quiz"}</div>
                            <div className="mt-2 text-sm font-medium text-slate-500">{item.lessonName || "Lesson"}</div>
                        </div>
                        <div className="rounded-2xl bg-blue-50 px-3 py-2 text-right">
                            <div className="text-sm font-black text-blue-700">{item.percentage ?? 0}%</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">Natija</div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <StatPill label="To‘g‘ri" value={item.correct ?? 0} />
                        <StatPill label="Jami" value={item.total ?? 0} />
                    </div>
                    <div className="mt-4 text-xs font-semibold text-slate-400">
                        Tugagan vaqt: {formatDateTime(item.finishedAt || item.startedAt)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function MessageDetailList({items}: {items: Array<{id: string; type: string; content: string; createdAt?: string}>}) {
    if (!items.length) {
        return <EmptyState title="Message topilmadi" description="Bu student uchun discussion yoki comment hozircha topilmadi." />;
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-black uppercase tracking-widest text-slate-400">
                            {item.type === "reply" ? "Reply" : "Comment"}
                        </div>
                        <div className="text-xs font-semibold text-slate-400">{formatDateTime(item.createdAt)}</div>
                    </div>
                    <div className="mt-4 text-sm leading-7 text-slate-600">{item.content}</div>
                </div>
            ))}
        </div>
    );
}
