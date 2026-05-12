import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {
    ArrowLeft,
    BarChart3,
    LoaderCircle,
    MessageSquare,
    TrendingUp,
    Users,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta.tsx";
import {Switch} from "../../components/ui/switch.tsx";
import {useGetCourseById, usePatchCourseActive} from "../../api/courses/useCourse.ts";
import {showSuccessToast} from "../../utils/toast.tsx";
import CourseModulesBar from "../../components/courseDetails/CourseModulesBar.tsx";
import UnifiedEditor from "../../components/courseDetails/UnifiedEditor.tsx";
import {useGetModules} from "../../api/module/useModule.ts";
import {isCourseManagerRole, useUser} from "../../api/auth/useAuth.ts";
import {useCourseDiscussionUnreadCount} from "../../api/discussionInbox/useDiscussionInbox.ts";

type SessionType =
    | "lesson"
    | "module"
    | "course"
    | "pricing"
    | "analytics"
    | "students"
    | "homework"
    | "discussions"
    | "quizzes"
    | "none";

type ActiveSession = {
    type: SessionType;
    id: string | null;
    moduleId?: string | null;
};

const getSessionMeta = (type: SessionType) => {
    switch (type) {
        case "lesson":
            return {
                title: "Dars",
                description: "Video, vazifa, resurs va quiz shu yerda boshqariladi.",
            };
        case "module":
            return {
                title: "Modul",
                description: "Modul ma'lumotlari va darslar tartibi.",
            };
        case "analytics":
            return {
                title: "Tahlillar",
                description: "Tracking linklar va kurs ko‘rsatkichlari.",
            };
        case "students":
            return {
                title: "O‘quvchilar",
                description: "Kursdagi o‘quvchilar va progress.",
            };
        case "homework":
            return {
                title: "Vazifalar",
                description: "Topshiriqlar va feedback.",
            };
        case "discussions":
            return {
                title: "Muhokamalar",
                description: "Student fikrlari va replylar.",
            };
        case "quizzes":
            return {
                title: "Test natijalari",
                description: "Quiz natijalari va urinishlar.",
            };
        case "pricing":
            return {
                title: "Narx",
                description: "Kurs narxi va monetizatsiya.",
            };
        case "course":
            return {
                title: "Kurs sozlamalari",
                description: "Kursning umumiy ma'lumotlari.",
            };
        default:
            return {
                title: "Kontent",
                description: "Modul yoki darsni tanlang.",
            };
    }
};

const CourseDetails = () => {
    const navigate = useNavigate();
    const params = useParams<{ id: string; lessonId?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const courseId = params.id;
    const {data: user} = useUser();
    const canManageCourse = isCourseManagerRole(user?.roleName);
    const {data: unreadDiscussionCount = 0} = useCourseDiscussionUnreadCount(courseId, canManageCourse);

    const {data: course, isLoading: isCourseLoading} = useGetCourseById(courseId);
    const {data: modules = []} = useGetModules(courseId);
    const {mutateAsync: toggleCourseActive, isPending: isPatchingActive} = usePatchCourseActive();

    const [activeSession, setActiveSession] = useState<ActiveSession>({
        type: canManageCourse ? "none" : "quizzes",
        id: canManageCourse ? null : courseId || null,
        moduleId: null,
    });
    const focusedStudentId = searchParams.get("studentId");

    useEffect(() => {
        if (!canManageCourse) {
            setActiveSession({type: "quizzes", id: courseId || null, moduleId: null});
        }
    }, [canManageCourse, courseId]);

    useEffect(() => {
        if (!params.lessonId) return;
        setActiveSession((prev) => ({type: "lesson", id: params.lessonId ?? null, moduleId: prev.moduleId ?? null}));
    }, [params.lessonId]);

    useEffect(() => {
        const requestedView = searchParams.get("view");
        if (!requestedView || !courseId) return;

        const allowedViews: SessionType[] = ["students", "homework", "discussions", "quizzes", "analytics", "none"];
        if (!allowedViews.includes(requestedView as SessionType)) return;

        setActiveSession({
            type: requestedView as SessionType,
            id: courseId,
            moduleId: null,
        });
    }, [courseId, searchParams]);

    const totalLessons = useMemo(
        () => modules.reduce((sum: number, module: {lessonCount?: number}) => sum + (module.lessonCount || 0), 0),
        [modules],
    );

    const workspaceActions: {id: SessionType; label: string; icon: typeof TrendingUp}[] = canManageCourse
        ? [
            {id: "none", label: "Kontent", icon: TrendingUp},
            {id: "students", label: "O‘quvchilar", icon: Users},
            {id: "analytics", label: "Tahlillar", icon: TrendingUp},
            {id: "homework", label: "Vazifalar", icon: BarChart3},
            {id: "discussions", label: "Muhokamalar", icon: MessageSquare},
            {id: "quizzes", label: "Testlar", icon: BarChart3},
        ]
        : [
            {id: "quizzes", label: "Testlar", icon: BarChart3},
        ];

    const sessionMeta = getSessionMeta(activeSession.type);
    const showEditorPanel = activeSession.type !== "none" && activeSession.type !== "module" && activeSession.type !== "course";
    const showLessonEditor = activeSession.type === "lesson";
    const showModulesSidebar = canManageCourse && (activeSession.type === "none" || activeSession.type === "module");

    const handleBack = () => {
        navigate("/courses");
    };

    const handleToggleActive = (checked: boolean) => {
        if (!course) return;

        toggleCourseActive(
            {
                id: course.id,
                value: checked,
                source: course.active ? "business" : "inactive",
            },
            {
                onSuccess: () => {
                    showSuccessToast(checked ? "Kurs active qilindi" : "Kurs non-active qilindi");
                },
            },
        );
    };

    const handleWorkspaceAction = (type: SessionType) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("studentId");
            next.delete("view");
            return next;
        });

        if (type === "none") {
            setActiveSession({type: "none", id: null, moduleId: null});
            return;
        }

        setActiveSession({type, id: courseId || null, moduleId: null});
    };

    const handleLessonBack = () => {
        setActiveSession({
            type: activeSession.moduleId ? "module" : "none",
            id: activeSession.moduleId ?? null,
            moduleId: activeSession.moduleId ?? null,
        });
    };

    if (isCourseLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <LoaderCircle className="h-5 w-5 animate-spin text-blue-600"/>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Kurs yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 pb-8">
            <PageMeta
                title={`Darslar | ${course?.name || "Kurs"}`}
                description="Westep course content manager"
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                            <ArrowLeft className="h-5 w-5"/>
                        </button>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kurs kontenti</p>
                            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">{course?.name || "Kurs"}</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Modullar markazda turadi. Darsni tanlasangiz ichki ma'lumotlari o‘ng panelda ochiladi.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 xl:items-end">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                            {modules.length} modul · {totalLessons} dars
                        </div>
                        {canManageCourse ? (
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Studentlarga ko‘rinishi</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Switch yoqilsa kurs ko‘rinadi.</p>
                                </div>
                                <Switch
                                    checked={course?.active}
                                    onCheckedChange={handleToggleActive}
                                    disabled={isPatchingActive}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-wrap gap-2">
                    {workspaceActions.map((action) => {
                        const isActive = activeSession.type === action.id || (action.id === "none" && activeSession.type === "none");
                        return (
                            <button
                                key={action.id}
                                onClick={() => handleWorkspaceAction(action.id)}
                                className={`relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                }`}
                            >
                                <action.icon className="h-4 w-4"/>
                                {action.label}
                                {action.id === "discussions" && unreadDiscussionCount > 0 ? (
                                    <span className={`absolute -right-1.5 -top-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[11px] font-bold shadow-sm ${
                                        isActive
                                            ? "border-white/70 bg-white text-blue-600"
                                            : "border-blue-500/20 bg-blue-600 text-white dark:border-blue-400/30 dark:bg-blue-500"
                                    }`}>
                                        {unreadDiscussionCount > 99 ? "99+" : unreadDiscussionCount}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </section>

            {showLessonEditor ? (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <UnifiedEditor
                                session={activeSession}
                                courseName={course?.name}
                                focusedStudentId={focusedStudentId || undefined}
                                onBack={handleLessonBack}
                            />
                </section>
            ) : (
                <div className={`grid min-h-[760px] gap-4 ${
                    showModulesSidebar && showEditorPanel ? "xl:grid-cols-[460px_minmax(0,1fr)]" : "grid-cols-1"
                }`}>
                    {showModulesSidebar ? (
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <CourseModulesBar
                                id={courseId || ""}
                                activeSession={activeSession}
                                onSelectionChange={(type, id, meta) => setActiveSession({type, id, moduleId: meta?.moduleId ?? null})}
                            />
                        </section>
                    ) : null}

                    {showEditorPanel ? (
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{sessionMeta.title}</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sessionMeta.description}</p>
                                </div>
                            </div>
                            <UnifiedEditor
                                session={activeSession}
                                courseName={course?.name}
                                focusedStudentId={focusedStudentId || undefined}
                            />
                        </section>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default CourseDetails;
