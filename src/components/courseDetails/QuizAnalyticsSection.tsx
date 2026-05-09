import {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import moment from "moment";
import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    Check,
    ChevronRight,
    FileQuestion,
    LoaderCircle,
    PieChart,
    ShieldAlert,
    X,
    XCircle,
} from "lucide-react";
import {Lesson, Module} from "../../types/types.ts";
import {useGetModules} from "../../api/module/useModule.ts";
import {
    isCourseManagerRole,
    isStudentRole,
    useUser,
} from "../../api/auth/useAuth.ts";
import {
    useMyQuizResults,
    useMyQuizResultsByLesson,
    useMyQuizSessionDetail,
    useCourseQuizResults,
    useCourseQuizSessionDetail,
} from "../../api/lessonReview/useLessonReview.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs.tsx";
import {Badge} from "../ui/badge.tsx";
import {Button} from "../ui/button.tsx";

type ModuleWithLessons = Module & {lessons?: Lesson[]};

type ResultTab =
    | "student-lesson-quizzes"
    | "manager-lesson-quizzes";

type ResultSummaryBase = {
    sessionId: string;
    courseId?: string;
    moduleId?: string;
    moduleName?: string;
    taskId?: string;
    lessonId?: string;
    lessonName?: string;
    taskTitle?: string;
    studentId?: string;
    studentName?: string;
    status?: string;
    total?: number;
    correct?: number;
    wrong?: number;
    unanswered?: number;
    percentage?: number;
    durationMinutes?: number;
    spentSeconds?: number;
    startedAt?: string;
    endsAt?: string;
    finishedAt?: string;
};

type ResultQuestionBase = {
    orderIndex: number;
    questionText: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    selectedOption?: string;
    correctOption?: string;
    correct?: boolean;
};

type FilterOption = {
    value: string;
    label: string;
};

const formatDateTime = (value?: string) => {
    if (!value) return "No date";
    return moment(value).isValid() ? moment(value).format("MMM D, HH:mm") : value;
};

const getStudentInitial = (name?: string) => {
    const trimmed = (name || "").trim();
    return trimmed ? trimmed[0].toUpperCase() : "S";
};

const getStatusTone = (status?: string) => {
    switch ((status || "").toUpperCase()) {
        case "FINISHED":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
        case "IN_PROGRESS":
            return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
        case "EXPIRED":
            return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
        default:
            return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
};

const getPercentageTone = (value?: number) => {
    if ((value ?? 0) >= 80) return "text-emerald-600";
    if ((value ?? 0) >= 50) return "text-amber-600";
    return "text-rose-600";
};

const getPercentageDotTone = (value?: number) => {
    if ((value ?? 0) >= 80) return "bg-emerald-400";
    if ((value ?? 0) >= 50) return "bg-amber-400";
    return "bg-orange-500";
};

const formatPercentage = (value?: number) => `${(value ?? 0).toFixed(2)}%`;

function EmptyState({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 dark:bg-slate-950 dark:text-slate-500">
                {icon}
            </div>
            <h4 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h4>
            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

function LoadingState({label}: {label: string}) {
    return (
        <div className="flex h-full min-h-[220px] items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <LoaderCircle className="h-5 w-5 animate-spin text-blue-600"/>
            {label}
        </div>
    );
}

function ErrorState({error}: {error: unknown}) {
    const parsedError = parseApiError(error);
    const isAccessDenied = parsedError.status === 403;

    return (
        <EmptyState
            title={isAccessDenied ? "Access denied" : "Natijalar yuklanmadi"}
            description={isAccessDenied ? "Bu sahifani ko‘rish uchun sizda ruxsat yo‘q." : parsedError.message}
            icon={isAccessDenied ? <ShieldAlert className="h-7 w-7"/> : <AlertCircle className="h-7 w-7"/>}
        />
    );
}

function StatusBadge({status}: {status?: string}) {
    return (
        <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${getStatusTone(status)}`}>
            {status || "UNKNOWN"}
        </Badge>
    );
}

function PercentageBadge({value}: {value?: number}) {
    return (
        <div className="min-w-[72px] text-right">
            <p className={`text-xl font-semibold leading-none ${getPercentageTone(value)}`}>{formatPercentage(value)}</p>
        </div>
    );
}

function SummaryCard({label, value}: {label: string; value: string}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
    );
}

function ResultsSidebar({
    title,
    description,
    options,
    selectedId,
    onSelect,
    emptyTitle,
    emptyDescription,
    isLoading,
    icon,
}: {
    title: string;
    description: string;
    options: FilterOption[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    emptyTitle: string;
    emptyDescription: string;
    isLoading?: boolean;
    icon: ReactNode;
}) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <LoadingState label="Ro‘yxat yuklanmoqda..."/>
            ) : options.length === 0 ? (
                <div className="p-4">
                    <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                        icon={<AlertCircle className="h-7 w-7"/>}
                    />
                </div>
            ) : (
                <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                    {options.map((option) => {
                        const isActive = option.value === selectedId;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onSelect(option.value)}
                                className={`w-full rounded-xl border p-3 text-left transition ${
                                    isActive
                                        ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
                                        : "border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{option.label}</p>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}/>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ResultDetailView({
    title,
    subtitle,
    summary,
    questions,
    onBack,
    showStudentName,
}: {
    title: string;
    subtitle: string;
    summary?: ResultSummaryBase;
    questions: ResultQuestionBase[];
    onBack: () => void;
    showStudentName?: boolean;
}) {
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const questionRefs = useRef<Array<HTMLDivElement | null>>([]);

    useEffect(() => {
        setActiveQuestionIndex(0);
    }, [summary?.sessionId]);
    const questionStateList = useMemo(
        () =>
            questions.map((question) => {
                if (!question.selectedOption) return "unanswered" as const;
                return question.correct ? ("correct" as const) : ("wrong" as const);
            }),
        [questions],
    );

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={onBack} className="rounded-xl">
                            <ArrowLeft className="h-4 w-4"/>
                            Orqaga
                        </Button>
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-black italic uppercase tracking-wide text-slate-900 dark:text-white">
                                {title}
                            </h3>
                            <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                    <StatusBadge status={summary?.status}/>
                    <PercentageBadge value={summary?.percentage}/>
                </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 bg-slate-50/30 p-4 dark:bg-slate-950 sm:p-6">
                    <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {showStudentName ? <SummaryCard label="Student" value={summary?.studentName || "-"}/> : null}
                        <SummaryCard label="Test nomi" value={summary?.taskTitle || summary?.moduleName || summary?.lessonName || "-"}/>
                        <SummaryCard label="To‘g‘ri" value={(summary?.correct ?? 0).toString()}/>
                        <SummaryCard label="Noto‘g‘ri" value={(summary?.wrong ?? 0).toString()}/>
                        <SummaryCard label="Jami" value={(summary?.total ?? 0).toString()}/>
                        <SummaryCard label="Boshlangan" value={formatDateTime(summary?.startedAt)}/>
                        <SummaryCard label="Tugagan" value={formatDateTime(summary?.finishedAt)}/>
                    </div>

                    {questions.length === 0 ? (
                        <EmptyState
                            title="Savollar topilmadi"
                            description="Bu urinish uchun question breakdown qaytmadi."
                            icon={<FileQuestion className="h-7 w-7"/>}
                        />
                    ) : (
                        <div className="space-y-4">
                            {questions.map((question, index) => (
                                <div
                                    key={question.orderIndex}
                                    ref={(node) => {
                                        questionRefs.current[index] = node;
                                    }}
                                    className={`rounded-3xl border bg-white p-5 shadow-sm transition dark:bg-slate-900 sm:p-7 ${
                                        index === activeQuestionIndex
                                            ? "border-blue-200 ring-2 ring-blue-100 dark:border-blue-500/30 dark:ring-blue-500/10"
                                            : "border-slate-100 dark:border-slate-800"
                                    }`}
                                >
                                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                {question.orderIndex}
                                            </span>
                                            <div className="space-y-3">
                                                <p className="text-lg font-bold leading-relaxed text-slate-800 dark:text-slate-200 sm:text-xl">
                                                    {question.questionText}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {question.correct ? (
                                                        <span className="rounded-lg bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                                            To'g'ri belgilangan
                                                        </span>
                                                    ) : question.selectedOption ? (
                                                        <span className="rounded-lg bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                                            Noto'g'ri belgilangan
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                            Belgilanmagan
                                                        </span>
                                                    )}

                                                    {question.selectedOption ? (
                                                        <span className="rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                            Tanlagan: {question.selectedOption}
                                                        </span>
                                                    ) : null}

                                                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                        To'g'ri javob: {question.correctOption || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {[
                                            {key: "A", value: question.optionA},
                                            {key: "B", value: question.optionB},
                                            {key: "C", value: question.optionC},
                                            {key: "D", value: question.optionD},
                                        ].filter((option) => option.value).map((option) => {
                                            const isSelected = question.selectedOption === option.key;
                                            const isCorrect = question.correctOption === option.key;

                                            let optionStyle =
                                                "border-slate-100 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400";

                                            if (isCorrect) {
                                                optionStyle =
                                                    "border-green-200 bg-green-50 text-green-700 ring-2 ring-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/30";
                                            } else if (isSelected) {
                                                optionStyle =
                                                    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300";
                                            }

                                            return (
                                                <div
                                                    key={option.key}
                                                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 transition-all ${optionStyle}`}
                                                >
                                                    <div
                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-black ${
                                                            isCorrect
                                                                ? "border-green-200 bg-green-200 text-green-800 dark:border-green-800 dark:bg-green-800 dark:text-green-100"
                                                                : isSelected
                                                                    ? "border-red-200 bg-red-200 text-red-800 dark:border-red-800 dark:bg-red-800 dark:text-red-100"
                                                                    : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                                                        }`}
                                                    >
                                                        {option.key}
                                                    </div>
                                                    <span className="text-[14px] font-bold">{option.value}</span>
                                                    {isCorrect ? (
                                                        <Check className="ml-auto h-5 w-5 shrink-0 text-green-500 dark:text-green-400"/>
                                                    ) : isSelected ? (
                                                        <X className="ml-auto h-5 w-5 shrink-0 text-red-500 dark:text-red-400"/>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!questions.length ? null : (
                    <aside className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:border-l lg:border-t-0">
                        <div className="border-b border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500">
                                Savollar
                            </h3>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-6">
                            {questions.map((question, index) => {
                                const state = questionStateList[index];
                                const isActive = index === activeQuestionIndex;
                                const stateClasses =
                                    state === "correct"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400"
                                        : state === "wrong"
                                            ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400"
                                            : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500";

                                return (
                                    <button
                                        key={question.orderIndex}
                                        type="button"
                                        onClick={() => {
                                            setActiveQuestionIndex(index);
                                            questionRefs.current[index]?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                        }}
                                        className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-black transition-all ${
                                            isActive
                                                ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none"
                                                : stateClasses
                                        }`}
                                    >
                                        {question.orderIndex}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

function ManagerResultsTable({
    title,
    description,
    results,
    onSelect,
    showStudentColumn = false,
}: {
    title: string;
    description: string;
    results: ResultSummaryBase[];
    onSelect: (sessionId: string) => void;
    showStudentColumn?: boolean;
}) {
    if (!results.length) {
        return (
            <EmptyState
                title="Natijalar topilmadi"
                description="Tanlangan filterlar bo‘yicha manager resultlar mavjud emas."
                icon={<BarChart3 className="h-7 w-7"/>}
            />
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <Badge className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white dark:bg-slate-100 dark:text-slate-950">
                    {results.length} urinish
                </Badge>
            </div>

            <div className="overflow-x-auto">
                <div className={showStudentColumn ? "min-w-[1040px]" : "min-w-[920px]"}>
                    <div className={`grid gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 ${
                        showStudentColumn
                            ? "grid-cols-[1.3fr_1.6fr_0.6fr_0.6fr_0.6fr_0.7fr_1fr_0.7fr]"
                            : "grid-cols-[1.8fr_0.6fr_0.6fr_0.6fr_0.7fr_1fr_0.7fr]"
                    }`}>
                        {showStudentColumn ? <div>Student</div> : null}
                        <div>Test nomi</div>
                        <div>Total</div>
                        <div>Correct</div>
                        <div>Wrong</div>
                        <div>Foiz</div>
                        <div>Status</div>
                        <div>Sana</div>
                        <div>Action</div>
                    </div>

                    <div className="mt-3 space-y-3">
                        {results.map((result) => (
                            <div
                                key={result.sessionId}
                                className={`grid gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/30 ${
                                    showStudentColumn
                                        ? "grid-cols-[1.3fr_1.6fr_0.6fr_0.6fr_0.6fr_0.7fr_1fr_0.7fr]"
                                        : "grid-cols-[1.8fr_0.6fr_0.6fr_0.6fr_0.7fr_1fr_0.7fr]"
                                }`}
                            >
                                {showStudentColumn ? (
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-slate-950 dark:text-slate-100">{result.studentName || "-"}</p>
                                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{result.studentId || "-"}</p>
                                    </div>
                                ) : null}
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-950 dark:text-slate-100">{result.taskTitle || "-"}</p>
                                    <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{result.lessonName || "-"}</p>
                                </div>
                                <div className="flex items-center text-sm font-semibold text-slate-900 dark:text-slate-100">{result.total ?? 0}</div>
                                <div className="flex items-center text-sm font-semibold text-emerald-600">{result.correct ?? 0}</div>
                                <div className="flex items-center text-sm font-semibold text-rose-600">{result.wrong ?? 0}</div>
                                <div className="flex items-center">
                                    <span className={`text-lg font-black ${getPercentageTone(result.percentage)}`}>{result.percentage ?? 0}%</span>
                                </div>
                                <div className="flex items-center">
                                    <StatusBadge status={result.status}/>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{formatDateTime(result.startedAt)}</p>
                                    <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{formatDateTime(result.finishedAt)}</p>
                                </div>
                                <div className="flex items-center">
                                    <Button type="button" size="sm" onClick={() => onSelect(result.sessionId)} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                        Ko‘rish
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LessonHistoryCardList({
    results,
    onSelect,
}: {
    results: ResultSummaryBase[];
    onSelect: (sessionId: string) => void;
}) {
    if (!results.length) {
        return (
            <EmptyState
                title="Natijalar topilmadi"
                description="Bu kurs bo‘yicha ishlangan lesson testlar hali yo‘q."
                icon={<BarChart3 className="h-7 w-7"/>}
            />
        );
    }

    return (
        <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="overflow-x-auto">
                <div className="min-w-[1120px] px-4 pb-6">
                    <div className="grid grid-cols-[2.1fr_1.3fr_0.9fr_0.9fr_0.8fr_0.8fr_1.1fr] gap-4 border-b border-slate-200 px-2 py-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                            <span>O‘quvchi</span>
                            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                                {results.length}
                            </span>
                        </div>
                        <div>Lesson</div>
                        <div>Umumiy test</div>
                        <div>Natija</div>
                        <div>To'g'ri</div>
                        <div>Xato</div>
                        <div>Sana</div>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {results.map((result) => (
                            <button
                                key={result.sessionId}
                                type="button"
                                onClick={() => onSelect(result.sessionId)}
                                className="grid w-full grid-cols-[2.1fr_1.3fr_0.9fr_0.9fr_0.8fr_0.8fr_1.1fr] gap-4 rounded-2xl px-2 py-6 text-left transition hover:bg-white/70 dark:hover:bg-white/[0.03]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white">
                                        {getStudentInitial(result.studentName)}
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#48bf45] ring-2 ring-white dark:ring-slate-950" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{result.studentName || "-"}</div>
                                    </div>
                                </div>

                                <div className="self-center">
                                    <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                                        {result.lessonName || "-"}
                                    </div>
                                </div>

                                <div className="self-center text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {result.total ?? 0}
                                </div>

                                <div className="self-center">
                                    <div className="flex items-center gap-3">
                                        <span className={`h-7 w-7 rounded-full ${getPercentageDotTone(result.percentage)}`} />
                                        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatPercentage(result.percentage)}</span>
                                    </div>
                                </div>

                                <div className="self-center text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {result.correct ?? 0}
                                </div>

                                <div className="self-center text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {result.wrong ?? 0}
                                </div>

                                <div className="self-center">
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatDateTime(result.finishedAt || result.startedAt)}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudentLessonResultsPanel({
    lessons,
    isLessonsLoading,
}: {
    lessons: Lesson[];
    isLessonsLoading: boolean;
}) {
    const allResultsQuery = useMyQuizResults();
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const lessonResultsQuery = useMyQuizResultsByLesson(selectedLessonId || undefined, !!selectedLessonId);
    const detailQuery = useMyQuizSessionDetail(selectedSessionId || undefined, !!selectedSessionId);

    const lessonOptions = useMemo<FilterOption[]>(() => {
        const lessonMap = new Map<string, FilterOption>();

        lessons.forEach((lesson) => {
            lessonMap.set(lesson.id, {
                value: lesson.id,
                label: lesson.name,
            });
        });

        (allResultsQuery.data || []).forEach((result) => {
            if (!lessonMap.has(result.lessonId)) {
                lessonMap.set(result.lessonId, {
                    value: result.lessonId,
                    label: result.lessonName || "Lesson",
                });
            }
        });

        return Array.from(lessonMap.values());
    }, [allResultsQuery.data, lessons]);

    useEffect(() => {
        if (!selectedLessonId && lessonOptions[0]?.value) {
            setSelectedLessonId(lessonOptions[0].value);
        }
    }, [lessonOptions, selectedLessonId]);

    return (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <ResultsSidebar
                title="Lesson quizlar"
                description="Lesson quiz urinishlaringizni lesson kesimida ko‘ring."
                options={lessonOptions}
                selectedId={selectedLessonId}
                onSelect={(id) => {
                    setSelectedLessonId(id);
                    setSelectedSessionId(null);
                }}
                emptyTitle="Lesson quiz topilmadi"
                emptyDescription="Hali o‘zingiz uchun lesson quiz urinishlari mavjud emas."
                isLoading={isLessonsLoading || allResultsQuery.isLoading}
                icon={<PieChart className="h-5 w-5"/>}
            />

            {allResultsQuery.isLoading ? (
                <LoadingState label="Lesson quiz natijalari yuklanmoqda..."/>
            ) : allResultsQuery.isError ? (
                <ErrorState error={allResultsQuery.error}/>
            ) : selectedSessionId ? (
                detailQuery.isLoading ? (
                    <LoadingState label="Lesson quiz urinish detali yuklanmoqda..."/>
                ) : detailQuery.isError ? (
                    <ErrorState error={detailQuery.error}/>
                ) : (
                    <ResultDetailView
                        title={detailQuery.data?.summary?.taskTitle || detailQuery.data?.summary?.lessonName || "Lesson quiz"}
                        subtitle={detailQuery.data?.summary?.lessonName || "Own lesson quiz detali"}
                        summary={detailQuery.data?.summary}
                        questions={detailQuery.data?.questions || []}
                        onBack={() => setSelectedSessionId(null)}
                    />
                )
            ) : lessonResultsQuery.isLoading ? (
                <LoadingState label="Tanlangan lesson quiz natijalari yuklanmoqda..."/>
            ) : lessonResultsQuery.isError ? (
                <ErrorState error={lessonResultsQuery.error}/>
            ) : (
                <ManagerResultsTable
                    title="Mening lesson quiz natijalarim"
                    description="Tanlangan lesson bo‘yicha barcha quiz urinishlaringiz."
                    results={lessonResultsQuery.data || []}
                    onSelect={setSelectedSessionId}
                />
            )}
        </div>
    );
}

function ManagerLessonResultsPanel({
    courseId,
}: {
    courseId: string;
}) {
    const resultsQuery = useCourseQuizResults(courseId);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const detailQuery = useCourseQuizSessionDetail(courseId, selectedSessionId || undefined, !!selectedSessionId);
    const allResults = useMemo(
        () =>
            (resultsQuery.data?.students || []).flatMap((student) =>
                student.attempts.map((attempt) => ({
                    ...attempt,
                    studentId: student.studentId,
                    studentName: student.studentName,
                })),
            ),
        [resultsQuery.data?.students],
    );

    return (
        <div>
            {selectedSessionId ? (
                detailQuery.isLoading ? (
                    <LoadingState label="Lesson quiz manager detail yuklanmoqda..."/>
                ) : detailQuery.isError ? (
                    <ErrorState error={detailQuery.error}/>
                ) : (
                    <ResultDetailView
                        title={detailQuery.data?.summary?.taskTitle || "Lesson quiz"}
                        subtitle="Teacher va Business Admin tanlangan studentning lesson quiz detailini ko‘radi."
                        summary={detailQuery.data?.summary}
                        questions={detailQuery.data?.questions || []}
                        onBack={() => setSelectedSessionId(null)}
                        showStudentName
                    />
                )
            ) : (
                resultsQuery.isLoading ? (
                    <LoadingState label="Lesson quiz manager natijalari yuklanmoqda..."/>
                ) : resultsQuery.isError ? (
                    <ErrorState error={resultsQuery.error}/>
                ) : !allResults.length ? (
                    <EmptyState
                        title="Natijalar topilmadi"
                        description="Bu kurs bo‘yicha ishlangan lesson testlar hali yo‘q."
                        icon={<BarChart3 className="h-7 w-7"/>}
                    />
                ) : (
                    <LessonHistoryCardList
                        results={allResults}
                        onSelect={setSelectedSessionId}
                    />
                )
            )}
        </div>
    );
}

export default function QuizAnalyticsSection({courseId}: {courseId: string}) {
    const {data: user} = useUser();
    const {data: modules, isLoading: isModulesLoading, isError: isModulesError, error: modulesError} = useGetModules(courseId);
    const lessons = useMemo(
        () => (((modules as ModuleWithLessons[] | undefined) || []).flatMap((module) => module.lessons || [])),
        [modules],
    );

    const canSeeStudentResults = isStudentRole(user?.roleName);
    const canSeeManagerResults = isCourseManagerRole(user?.roleName);

    const availableTabs = useMemo<Array<{id: ResultTab; label: string; description: string}>>(() => {
        const tabs: Array<{id: ResultTab; label: string; description: string}> = [];

        if (canSeeStudentResults) {
            tabs.push({
                id: "student-lesson-quizzes",
                label: "Lesson quizlarim",
                description: "Student own lesson quiz natijalari.",
            });
        }

        if (canSeeManagerResults) {
            tabs.push({
                id: "manager-lesson-quizzes",
                label: "Lesson test natijalari",
                description: "Teacher va Business Admin uchun student lesson test natijalari.",
            });
        }

        return tabs;
    }, [canSeeManagerResults, canSeeStudentResults]);

    const [activeTab, setActiveTab] = useState<ResultTab | null>(availableTabs[0]?.id || null);

    useEffect(() => {
        if (!availableTabs.length) {
            setActiveTab(null);
            return;
        }

        if (!activeTab || !availableTabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(availableTabs[0].id);
        }
    }, [activeTab, availableTabs]);

    if (!availableTabs.length) {
        return (
            <EmptyState
                title="Natijalar paneli yopiq"
                description="Bu user role uchun manager result sahifalari ruxsat etilmagan."
                icon={<XCircle className="h-7 w-7"/>}
            />
        );
    }

    if (isModulesError) {
        return <ErrorState error={modulesError}/>;
    }

    return (
        <div className="min-h-[760px] rounded-[28px] border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <Tabs value={activeTab || undefined} onValueChange={(value) => setActiveTab(value as ResultTab)} className="w-full">
                {availableTabs.length > 1 ? (
                    <TabsList className="h-auto flex-wrap rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                        {availableTabs.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id} className="gap-2 px-4 py-2.5">
                                <BarChart3 className="h-4 w-4"/>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                ) : null}

                <TabsContent value="student-lesson-quizzes" className="mt-6">
                    <StudentLessonResultsPanel
                        lessons={lessons}
                        isLessonsLoading={isModulesLoading}
                    />
                </TabsContent>

                <TabsContent value="manager-lesson-quizzes" className="mt-6">
                    <ManagerLessonResultsPanel courseId={courseId}/>
                </TabsContent>
            </Tabs>
        </div>
    );
}
