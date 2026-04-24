import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    Camera,
    CheckCircle2,
    Eye,
    FolderKanban,
    ImageIcon,
    Link2,
    LoaderCircle,
    MessageSquare,
    Orbit,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta.tsx";
import {Button} from "../../components/ui/button.tsx";
import {Switch} from "../../components/ui/switch.tsx";
import {Textarea} from "../../components/ui/textarea.tsx";
import {Input} from "../../components/ui/input.tsx";
import {useGetCourseById, usePatchCourseActive, useUpdateCourse} from "../../api/courses/useCourse.ts";
import {useAddFile} from "../../api/file/useFile.ts";
import {baseUrlImage} from "../../api/apiClient.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";
import CourseExplorerSidebar from "../../components/courseDetails/CourseExplorerSidebar.tsx";
import UnifiedEditor from "../../components/courseDetails/UnifiedEditor.tsx";
import {useGetModules} from "../../api/module/useModule.ts";
import {useTrackingLinks} from "../../api/trackingLinks/useTrackingLinks.ts";

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

const formatPublishedDate = (value?: string) => {
    if (!value) return "Not published yet";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
    }).format(date);
};

const getSessionMeta = (type: SessionType) => {
    switch (type) {
        case "lesson":
            return {
                title: "Lesson Studio",
                description: "Video, homework, resources va quiz oqimini shu yerda boshqarasiz.",
            };
        case "module":
            return {
                title: "Module Strategy",
                description: "Modul strukturasini, narxini va oqimini bir joydan nazorat qiling.",
            };
        case "analytics":
            return {
                title: "Growth Signals",
                description: "Tracking performance va course acquisition signal’lari shu yerda jamlanadi.",
            };
        case "students":
            return {
                title: "Student Operations",
                description: "Kursdagi studentlar, progress va submission activity shu workspace’da ko‘rinadi.",
            };
        case "homework":
            return {
                title: "Submission Review",
                description: "Student topshiriqlari va feedback workspace shu panelga yig‘iladi.",
            };
        case "discussions":
            return {
                title: "Discussion Desk",
                description: "Comments, replies va moderation oqimi shu yerda boshqariladi.",
            };
        case "quizzes":
            return {
                title: "Assessment Insights",
                description: "Quiz natijalari va sessionlar performance’ini shu yerda ko‘rasiz.",
            };
        case "pricing":
            return {
                title: "Revenue Setup",
                description: "Course monetization va pricing architecture shu workspace’da yuradi.",
            };
        case "course":
            return {
                title: "Course Blueprint",
                description: "Kursning umumiy positioning’i va publishing ritmini shu yerda ko‘rasiz.",
            };
        default:
            return {
                title: "Curriculum Canvas",
                description: "Chapdan modul yoki lesson tanlang, yoki yuqoridagi command center orqali workflow’ni oching.",
            };
    }
};

const CourseDetails = () => {
    const navigate = useNavigate();
    const params = useParams<{ id: string; lessonId?: string }>();
    const courseId = params.id;

    const {data: course, isLoading: isCourseLoading} = useGetCourseById(courseId);
    const {data: modules = []} = useGetModules(courseId);
    const {data: trackingLinks} = useTrackingLinks(courseId || "");
    const {mutateAsync: editCourse, isPending: isSavingCourse} = useUpdateCourse();
    const {mutateAsync: toggleCourseActive, isPending: isPatchingActive} = usePatchCourseActive();
    const {mutateAsync: uploadFile, isPending: isUploadingImage} = useAddFile();

    const [activeSession, setActiveSession] = useState<ActiveSession>({type: "none", id: null, moduleId: null});
    const [courseTitle, setCourseTitle] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [localImageUrl, setLocalImageUrl] = useState("");

    useEffect(() => {
        if (!course) return;
        setCourseTitle(course.name);
        setCourseDescription(course.description || "");
    }, [course]);

    useEffect(() => {
        if (!params.lessonId) return;
        setActiveSession((prev) => ({type: "lesson", id: params.lessonId, moduleId: prev.moduleId ?? null}));
    }, [params.lessonId]);

    const courseImageUrl = localImageUrl || (course?.attachmentUrl
        ? (course.attachmentUrl.startsWith("http")
            ? course.attachmentUrl
            : `${baseUrlImage.replace(/\/api$/, "")}${course.attachmentUrl}`)
        : "");

    const totalLessons = useMemo(
        () => modules.reduce((sum, module) => sum + (module.lessonCount || 0), 0),
        [modules],
    );

    const activePromoLinks = useMemo(
        () => (trackingLinks?.content || []).filter((item) => item.isActive).length,
        [trackingLinks],
    );

    const heroStats = [
        {
            label: "Modules",
            value: modules.length,
            hint: "Curriculum blocks",
            icon: FolderKanban,
            tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
        },
        {
            label: "Lessons",
            value: totalLessons,
            hint: "Delivery units",
            icon: BookOpen,
            tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
        },
        {
            label: "Promo Links",
            value: activePromoLinks,
            hint: "Active acquisition paths",
            icon: Link2,
            tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
        },
    ];

    const workspaceActions: {id: SessionType; label: string; icon: typeof TrendingUp}[] = [
        {id: "none", label: "Curriculum", icon: Orbit},
        {id: "students", label: "Students", icon: Users},
        {id: "analytics", label: "Analytics", icon: TrendingUp},
        {id: "homework", label: "Submissions", icon: CheckCircle2},
        {id: "discussions", label: "Discussions", icon: MessageSquare},
        {id: "quizzes", label: "Quiz Results", icon: Sparkles},
        {id: "pricing", label: "Pricing", icon: Eye},
    ];

    const sessionMeta = getSessionMeta(activeSession.type);

    const handleBack = () => {
        navigate("/courses");
    };

    const updateCourseField = async (payload: {name?: string; description?: string; attachmentId?: string | null}) => {
        if (!course) return;
        await editCourse({...course, ...payload});
    };

    const handleTitleBlur = async () => {
        if (!course) return;

        const trimmedTitle = courseTitle.trim();
        if (!trimmedTitle) {
            setCourseTitle(course.name || "");
            return;
        }

        if (trimmedTitle === course.name) return;
        await updateCourseField({name: trimmedTitle});
    };

    const handleDescriptionBlur = async () => {
        if (!course) return;
        if ((courseDescription || "") === (course.description || "")) return;
        await updateCourseField({description: courseDescription});
    };

    const handleToggleActive = (checked: boolean) => {
        if (!course) return;

        toggleCourseActive(
            {
                id: course.id,
                value: checked,
                source: course.active ? "business" : "archived",
            },
            {
                onSuccess: () => {
                    showSuccessToast(`Course ${checked ? "activated" : "archived"} successfully`);
                },
            },
        );
    };

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !course) return;

        const previewUrl = URL.createObjectURL(file);
        setLocalImageUrl(previewUrl);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const uploadResponse = await uploadFile(formData);
            const attachmentId = typeof uploadResponse === "string"
                ? uploadResponse
                : (uploadResponse as {id?: string; data?: {id?: string}})?.id
                    || (uploadResponse as {id?: string; data?: {id?: string}})?.data?.id;

            await updateCourseField({attachmentId: attachmentId || null});
            showSuccessToast("Course cover updated");
        } catch (error) {
            setLocalImageUrl("");
            showErrorToast(error, "Failed to upload image");
        }
    };

    const handleWorkspaceAction = (type: SessionType) => {
        if (type === "none") {
            setActiveSession({type: "none", id: null, moduleId: null});
            return;
        }

        setActiveSession({type, id: courseId || null, moduleId: null});
    };

    if (isCourseLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <LoaderCircle className="h-10 w-10 animate-spin text-sky-600"/>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Course Builder</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Workspace is loading</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title={`Builder | ${course?.name || "Course"}`}
                description="Westep course builder workspace"
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.88))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-slate-800 md:px-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-slate-600 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:shadow-[0_18px_40px_rgba(2,6,23,0.35)] dark:hover:text-slate-100"
                            >
                                <ArrowLeft className="h-5 w-5"/>
                            </button>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                        Course Builder
                                    </span>
                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${
                                        course?.active
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
                                    }`}>
                                        {course?.active ? "Live course" : "Archive mode"}
                                    </span>
                                </div>
                                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.5rem]">
                                    Launch and refine your course operation from one workspace
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                                    Curriculum, tracking, submissions va discussion management endi bitta premium operator panel ichiga yig‘ildi.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
                            {heroStats.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-[0_20px_45px_rgba(2,6,23,0.35)]"
                                >
                                    <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${item.tone}`}>
                                        <item.icon className="h-5 w-5"/>
                                    </div>
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{item.label}</p>
                                    <div className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{item.value}</div>
                                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.hint}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.3fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                                        Workspace identity
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                        Published {formatPublishedDate(course?.publishedAt)}
                                    </span>
                                </div>

                                <Input
                                    value={courseTitle}
                                    onChange={(event) => setCourseTitle(event.target.value)}
                                    onBlur={handleTitleBlur}
                                    placeholder="Course title"
                                    className="mt-5 h-auto border-0 bg-transparent px-0 text-3xl font-black tracking-tight text-slate-950 shadow-none placeholder:text-slate-300 focus-visible:ring-0 dark:text-slate-100 dark:placeholder:text-slate-600 md:text-[2.7rem]"
                                />

                                <Textarea
                                    value={courseDescription}
                                    onChange={(event) => setCourseDescription(event.target.value)}
                                    onBlur={handleDescriptionBlur}
                                    placeholder="Describe the promise, positioning and learning outcome of this course."
                                    className="mt-2 min-h-[128px] resize-none rounded-[26px] border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-7 text-slate-600 shadow-inner focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                                />
                            </div>

                            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[280px] lg:grid-cols-1">
                                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Visibility</p>
                                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900 dark:shadow-none">
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">{course?.active ? "Visible to learners" : "Archived from business"}</p>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toggle course availability instantly.</p>
                                        </div>
                                        <Switch
                                            checked={course?.active}
                                            onCheckedChange={handleToggleActive}
                                            disabled={isPatchingActive}
                                            className="data-[state=checked]:bg-emerald-600"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Save state</p>
                                    <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900 dark:shadow-none">
                                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">{isSavingCourse ? "Syncing updates" : "Changes stay connected"}</p>
                                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                                            Title, description va cover o‘zgarishlari API orqali darhol yangilanadi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {workspaceActions.map((action) => {
                                const isActive = activeSession.type === action.id || (action.id === "none" && activeSession.type === "none");
                                return (
                                    <button
                                        key={action.id}
                                        onClick={() => handleWorkspaceAction(action.id)}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                                            isActive
                                            ? "border-blue-600 bg-blue-600 text-white shadow-[0_20px_40px_rgba(59,130,246,0.16)]"
                                            : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:text-blue-200"
                                        }`}
                                    >
                                        <action.icon className="h-4 w-4"/>
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(255,255,255,0.98))] p-5 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:text-slate-100 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Course cover</p>
                                    <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">Visual identity</h3>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
                                        Cover course card, builder preview va workspace contextida ishlatiladi.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                    <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-200"/>
                                </div>
                            </div>

                            <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                {courseImageUrl ? (
                                    <img src={courseImageUrl} alt={course?.name} className="h-52 w-full object-cover"/>
                                ) : (
                                    <div className="flex h-52 flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                                            <Camera className="h-6 w-6 text-slate-500 dark:text-slate-300"/>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">No cover uploaded</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Give the course a stronger visual anchor.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">Upload new cover</p>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">PNG yoki JPG orqali workspace preview’ni yangilang.</p>
                                </div>
                                <div className="rounded-xl bg-blue-600 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                                    {isUploadingImage ? "Uploading" : "Choose"}
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
                            </label>
                        </div>

                        <div className="rounded-[30px] border border-white/75 bg-white/85 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Operator note</p>
                            <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">{sessionMeta.title}</h3>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{sessionMeta.description}</p>
                            <Button
                                onClick={() => setActiveSession({type: "course", id: courseId || null, moduleId: null})}
                                className="mt-5 h-11 w-full rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-blue-700"
                            >
                                Open course blueprint
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid min-h-[760px] gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <CourseExplorerSidebar
                    courseId={courseId || ""}
                    courseName={course?.name}
                    isCourseActive={Boolean(course?.active)}
                    moduleCount={modules.length}
                    lessonCount={totalLessons}
                    activeSession={activeSession}
                    onSelectionChange={(type, id, meta) => setActiveSession({type, id, moduleId: meta?.moduleId ?? null})}
                />

                <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/86 shadow-[0_32px_90px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                    <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(255,255,255,0.82))] px-6 py-5 dark:border-slate-800 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.88))] md:px-8">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Active workspace</p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">{sessionMeta.title}</h2>
                                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{sessionMeta.description}</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                <Sparkles className="h-4 w-4 text-sky-600"/>
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">Builder synced with live APIs</p>
                                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Modules, lessons, tracking va review panellari shu shell ichida ishlaydi.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <UnifiedEditor session={activeSession} courseName={course?.name}/>
                </section>
            </div>
        </div>
    );
};

export default CourseDetails;
