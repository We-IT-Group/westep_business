import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    FileQuestion,
    FileTextIcon,
    Link2,
    Paperclip,
    Save,
    Upload,
    Video,
} from "lucide-react";
import {Lesson, LessonType} from "../../../types/types.ts";
import {useAddLesson, useGetLessonById, useUpdateLesson} from "../../../api/lessons/useLesson.ts";
import {useImportLessonQuiz} from "../../../api/lessonQuiz/useLessonQuiz.ts";
import {useCreateLessonHomework, useCreateLessonResource} from "../../../api/lessonMaterials/useLessonMaterials.ts";
import {useLessonTasksReview} from "../../../api/lessonReview/useLessonReview.ts";
import {useToast} from "../../../hooks/useToast.tsx";
import {useMobile} from "../../../hooks/useMobile.ts";
import {Input} from "../../ui/input.tsx";
import {Button} from "../../ui/button.tsx";
import {ScrollArea} from "../../ui/scroll-area.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger} from "../../ui/select.tsx";
import VideoPlayer from "./VedioPlayerComponent.tsx";

type LessonMaterialFormState = {
    title: string;
    links: string[];
    files: File[];
};

type HomeworkFormState = LessonMaterialFormState & {
    maxScore: string;
};

type ResourceListItem = {
    id: string;
    title: string;
    description?: string;
    links: string[];
    fileName?: string;
    fileUrl?: string;
};

type AddLessonProps = {
    lessonId?: string;
    courseId?: string;
    moduleId?: string;
    onBack?: () => void;
};

type LessonEditorValues = Omit<Lesson, "id" | "createdAt">;
type ComposerSection = "video" | "homework" | "resource" | "quiz";

const MAX_EXTERNAL_LINKS = 3;
const MAX_FILES = 3;
const LESSON_TYPE_LABELS: Record<LessonType, string> = {
    LESSON: "Dars",
    PRACTICE: "Mashq",
};
const MATERIAL_ACCEPT =
    ".xls,.xlsx,.pdf,.doc,.docx,.ppt,.pptx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

const createEmptyMaterialForm = (): LessonMaterialFormState => ({
    title: "",
    links: [],
    files: [],
});

const createEmptyHomeworkForm = (): HomeworkFormState => ({
    ...createEmptyMaterialForm(),
    maxScore: "",
});

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const asString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : undefined;

const resolveLessonModuleId = (lessonData: unknown, fallbackModuleId?: string) => {
    const record = asRecord(lessonData);
    if (!record) return fallbackModuleId ?? "";

    const nestedModule =
        asRecord(record.module) ||
        asRecord(record.moduleResponse) ||
        asRecord(record.lessonModule);

    return (
        asString(record.moduleId) ||
        asString(record.moduleUUID) ||
        asString(record.module_id) ||
        asString(nestedModule?.id) ||
        asString(nestedModule?.moduleId) ||
        fallbackModuleId ||
        ""
    );
};

const isValidExternalLink = (value: string) => /^https?:\/\//i.test(value.trim());

const normalizeFileUrl = (value?: string) => {
    if (!value) return undefined;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return value.startsWith("/") ? value : undefined;
};

const mapResourceItem = (item: unknown, fallbackIndex: number): ResourceListItem | null => {
    const record = asRecord(item);
    if (!record) return null;

    const attachment = asRecord(record.attachment) || asRecord(record.file);
    const fileUrl = normalizeFileUrl(
        asString(record.fileUrl) ||
        asString(record.attachmentUrl) ||
        asString(record.url) ||
        asString(record.storagePath) ||
        asString(attachment?.url) ||
        asString(attachment?.attachmentUrl) ||
        asString(attachment?.storagePath),
    );

    const fileName =
        asString(record.fileName) ||
        asString(record.originalFileName) ||
        asString(record.attachmentName) ||
        asString(attachment?.fileName) ||
        asString(attachment?.originalFileName) ||
        asString(attachment?.name);

    const links = Array.from(
        new Set(
            [
                ...(Array.isArray(record.links) ? record.links : []),
                record.link,
                record.externalLink,
            ]
                .map((value) => asString(value))
                .filter((value): value is string => Boolean(value)),
        ),
    );

    const title = asString(record.title) || asString(record.name) || fileName || links[0] || `Resource ${fallbackIndex + 1}`;

    if (!title && links.length === 0 && !fileUrl) return null;

    return {
        id: asString(record.id) || `${fallbackIndex}`,
        title,
        description: asString(record.description),
        links,
        fileName,
        fileUrl,
    };
};

const extractLessonResources = (lessonData: unknown): ResourceListItem[] => {
    const record = asRecord(lessonData);
    if (!record) return [];

    const candidates = [
        record.resources,
        record.lessonResources,
        record.resourceList,
        record.attachments,
        asRecord(record.lessonTask)?.resources,
        asRecord(record.lessonTasks)?.resources,
    ];

    const rawList = candidates.find(Array.isArray);
    if (!Array.isArray(rawList)) return [];

    return rawList
        .map((item, index) => mapResourceItem(item, index))
        .filter((item): item is ResourceListItem => Boolean(item));
};

const normalizeLinks = (links: string[]) => links.map((link) => link.trim()).filter(Boolean);
const previewLinks = (links: string[]) => normalizeLinks(links);
const previewFiles = (files: File[]) => files.map((file) => file.name);

const buildLessonPayload = (
    values: LessonEditorValues,
    moduleId: string,
    fallbackOrderIndex: number,
): LessonEditorValues => {
    const type: LessonType = values.type ?? "LESSON";
    const basePayload: LessonEditorValues = {
        name: values.name.trim(),
        description: values.description?.trim() ?? "",
        moduleId,
        type,
        orderIndex: Number(values.orderIndex ?? fallbackOrderIndex) || fallbackOrderIndex,
        estimatedDuration: type === "LESSON" ? Number(values.estimatedDuration ?? 0) || 0 : null,
        active: Boolean(values.active),
    };

    if (type === "LESSON") {
        basePayload.videoUrl = values.videoUrl?.trim() ?? "";
        basePayload.watchCompletionPercent = Number(values.watchCompletionPercent ?? 80) || 0;
    }

    return basePayload;
};

export default function AddLesson({lessonId: propLessonId, courseId: propCourseId, moduleId: propModuleId, onBack}: AddLessonProps = {}) {
    const params = useParams<{ lessonId: string; id: string }>();
    const lessonId = propLessonId ?? params.lessonId;
    const courseId = propCourseId ?? params.id;
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMobile();
    const toast = useToast();
    const locationState = location.state as {moduleId?: string; lessonLength?: number} | null;
    const moduleId = propModuleId ?? locationState?.moduleId ?? "";
    const lessonLength = locationState?.lessonLength ?? 0;

    const lessonQuery = useGetLessonById(lessonId);
    const {mutateAsync: addLesson, isSuccess: isAddingSuccess} = useAddLesson(courseId);
    const {mutateAsync: updateLesson, isSuccess: isUpdateSuccess} = useUpdateLesson();
    const {mutateAsync: importQuiz, isPending: isImportingQuiz} = useImportLessonQuiz(lessonId);
    const {mutateAsync: createHomework, isPending: isCreatingHomework} = useCreateLessonHomework(lessonId);
    const {mutateAsync: createResource, isPending: isCreatingResource} = useCreateLessonResource(lessonId);
    const [activeComposer, setActiveComposer] = useState<ComposerSection>("video");
    const lessonTasksQuery = useLessonTasksReview(
        lessonId,
        activeComposer === "homework" || activeComposer === "resource" || activeComposer === "quiz",
    );

    const lessonData = lessonQuery.data;

    const [quizFile, setQuizFile] = useState<File | null>(null);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [quizTimeLimit, setQuizTimeLimit] = useState("");
    const [lastImportedFileName, setLastImportedFileName] = useState<string | null>(null);
    const [homeworkForm, setHomeworkForm] = useState<HomeworkFormState>(createEmptyHomeworkForm);
    const [resourceForm, setResourceForm] = useState<LessonMaterialFormState>(createEmptyMaterialForm);
    const [homeworkError, setHomeworkError] = useState<string | null>(null);
    const [resourceError, setResourceError] = useState<string | null>(null);

    const lessonResources = useMemo(() => extractLessonResources(lessonData), [lessonData]);
    const lessonTasks = useMemo(() => lessonTasksQuery.data || [], [lessonTasksQuery.data]);
    const homeworkTasks = useMemo(() => lessonTasks.filter((task) => task.type === "HOMEWORK"), [lessonTasks]);
    const quizTasks = useMemo(() => lessonTasks.filter((task) => task.type === "QUIZ"), [lessonTasks]);
    const visibleTasks = activeComposer === "homework" ? homeworkTasks : activeComposer === "quiz" ? quizTasks : [];
    const visibleResources = activeComposer === "resource"
        ? lessonResources.filter((resource) => !lessonTasks.some((task) => task.title === resource.title))
        : [];
    const resolvedModuleId = useMemo(
        () => resolveLessonModuleId(lessonData, moduleId),
        [lessonData, moduleId],
    );
    const blockTypeMeta: Record<string, {label: string; badge: string}> = {
        HOMEWORK: {label: "Vazifa", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"},
        RESOURCE: {label: "Resurs", badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"},
        QUIZ: {label: "Test", badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200"},
    };
    const showComposerPanels = activeComposer === "homework" || activeComposer === "resource" || activeComposer === "quiz";

    const initialValues = useMemo<LessonEditorValues>(() => {
        if (lessonData && lessonId) {
            const lessonType: LessonType = lessonData.type ?? "LESSON";
            return {
                name: lessonData.name || "Lesson nomi",
                description: lessonData.description ?? "",
                moduleId: resolveLessonModuleId(lessonData, moduleId),
                type: lessonType,
                orderIndex: lessonData.orderIndex ?? 0,
                estimatedDuration: lessonData.estimatedDuration ?? 0,
                watchCompletionPercent: lessonData.watchCompletionPercent ?? 80,
                videoUrl: lessonData.videoUrl ?? lessonData.vedioUrl ?? "",
                active: lessonData.active ?? false,
            };
        }

        return {
            name: "Lesson nomi",
            description: "",
            moduleId,
            type: "LESSON",
            orderIndex: 0,
            estimatedDuration: 0,
            watchCompletionPercent: 80,
            videoUrl: "",
            active: false,
        };
    }, [lessonData, lessonId, moduleId]);

    const formik = useFormik<LessonEditorValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string().required("Lesson nomini kiriting"),
            moduleId: Yup.string().required("Module aniqlanmadi"),
            type: Yup.mixed<LessonType>().oneOf(["LESSON", "PRACTICE"]).required("Type tanlang"),
            watchCompletionPercent: Yup.number().min(0, "0 dan kichik bo'lmasin").max(100, "100 dan oshmasin"),
        }),
        onSubmit: async () => {
            if (!resolvedModuleId) {
                toast.error("Modul aniqlanmadi. Lessonni qayta ochib ko‘ring.");
                return;
            }

            const body = buildLessonPayload(formik.values, resolvedModuleId, lessonLength + 1);

            if (lessonId) {
                await updateLesson({
                    body: {
                        ...body,
                        id: lessonId,
                        removeVideo: false,
                    },
                });
            } else {
                await addLesson({
                    body,
                });
            }
        },
    });
    const isLessonType = formik.values.type !== "PRACTICE";

    useEffect(() => {
        if (!isLessonType && (activeComposer === "resource" || activeComposer === "video")) {
            setActiveComposer("homework");
        }
    }, [activeComposer, isLessonType]);

    useEffect(() => {
        if (!propLessonId && (isUpdateSuccess || isAddingSuccess)) {
            if (isMobile) {
                navigate(`/courses/details/${courseId}`);
            } else {
                navigate(-1);
            }
        }
    }, [courseId, isAddingSuccess, isMobile, isUpdateSuccess, navigate, propLessonId]);

    const handleSaveLesson = async () => {
        if (!lessonId) return;
        if (!resolvedModuleId) {
            toast.error("Modul aniqlanmadi. Lessonni qayta ochib ko‘ring.");
            return;
        }

        const errors = await formik.validateForm();
        formik.setTouched({
            ...formik.touched,
            name: true,
            moduleId: true,
            type: true,
            watchCompletionPercent: true,
        });

        if (errors.name || errors.moduleId || errors.type || errors.watchCompletionPercent) return;
        const body = buildLessonPayload(formik.values, resolvedModuleId, lessonLength + 1);

        await updateLesson({
            body: {
                ...body,
                id: lessonId,
                removeVideo: false,
            },
        });
        toast.success("Lesson saqlandi.");
        onBack?.();
    };

    const handleMaterialLinkChange = (
        type: "homework" | "resource",
        index: number,
        value: string,
    ) => {
        if (type === "homework") {
            setHomeworkForm((prev) => ({
                ...prev,
                links: prev.links.map((link, linkIndex) => (linkIndex === index ? value : link)),
            }));
            return;
        }

        setResourceForm((prev) => ({
            ...prev,
            links: prev.links.map((link, linkIndex) => (linkIndex === index ? value : link)),
        }));
    };

    const handleAddLinkField = (type: "homework" | "resource") => {
        if (type === "homework") {
            if (homeworkForm.links.length >= MAX_EXTERNAL_LINKS) {
                setHomeworkError(`Ko‘pi bilan ${MAX_EXTERNAL_LINKS} ta link kiritish mumkin.`);
                return;
            }
            setHomeworkForm((prev) => ({
                ...prev,
                links: [...prev.links, ""],
            }));
            setHomeworkError(null);
            return;
        }

        if (resourceForm.links.length >= MAX_EXTERNAL_LINKS) {
            setResourceError(`Ko‘pi bilan ${MAX_EXTERNAL_LINKS} ta link kiritish mumkin.`);
            return;
        }
        setResourceForm((prev) => ({
            ...prev,
            links: [...prev.links, ""],
        }));
        setResourceError(null);
    };

    const handleRemoveLinkField = (type: "homework" | "resource", index: number) => {
        if (type === "homework") {
            setHomeworkForm((prev) => ({
                ...prev,
                links: prev.links.filter((_, linkIndex) => linkIndex !== index),
            }));
            setHomeworkError(null);
            return;
        }

        setResourceForm((prev) => ({
            ...prev,
            links: prev.links.filter((_, linkIndex) => linkIndex !== index),
        }));
        setResourceError(null);
    };

    const handleFilesChange = (type: "homework" | "resource", event: ChangeEvent<HTMLInputElement>) => {
        const nextFiles = Array.from(event.target.files || []);

        if (nextFiles.length > MAX_FILES) {
            const message = `Ko‘pi bilan ${MAX_FILES} ta fayl yuklash mumkin.`;
            if (type === "homework") {
                setHomeworkError(message);
            } else {
                setResourceError(message);
            }
            return;
        }

        if (type === "homework") {
            setHomeworkError(null);
            setHomeworkForm((prev) => ({...prev, files: nextFiles}));
            return;
        }

        setResourceError(null);
        setResourceForm((prev) => ({...prev, files: nextFiles}));
    };

    const validateLinks = (links: string[], setter: (message: string | null) => void) => {
        const normalizedLinks = normalizeLinks(links);

        if (normalizedLinks.length > MAX_EXTERNAL_LINKS) {
            setter(`Ko‘pi bilan ${MAX_EXTERNAL_LINKS} ta link kiritish mumkin.`);
            return null;
        }

        if (normalizedLinks.some((link) => !isValidExternalLink(link))) {
            setter("Har bir link http:// yoki https:// bilan boshlanishi kerak.");
            return null;
        }

        setter(null);
        return normalizedLinks;
    };

    const handleHomeworkSubmit = async () => {
        if (!lessonId) return;

        const normalizedLinks = validateLinks(homeworkForm.links, setHomeworkError);
        if (!normalizedLinks) return;

        try {
            await createHomework({
                lessonId,
                title: homeworkForm.title,
                description: "",
                maxScore: homeworkForm.maxScore.trim() ? Number(homeworkForm.maxScore) : undefined,
                links: normalizedLinks.length > 0 ? normalizedLinks : undefined,
                files: homeworkForm.files.length > 0 ? homeworkForm.files : undefined,
            });

            setHomeworkForm(createEmptyHomeworkForm());
            setHomeworkError(null);
            toast.success("Homework qo‘shildi.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Homework saqlanmadi.";
            setHomeworkError(message);
        }
    };

    const handleResourceSubmit = async () => {
        if (!lessonId) return;

        const normalizedLinks = validateLinks(resourceForm.links, setResourceError);
        if (!normalizedLinks) return;

        try {
            await createResource({
                lessonId,
                title: resourceForm.title,
                description: "",
                links: normalizedLinks.length > 0 ? normalizedLinks : undefined,
                files: resourceForm.files.length > 0 ? resourceForm.files : undefined,
            });

            setResourceForm(createEmptyMaterialForm());
            setResourceError(null);
            toast.success("Resource qo‘shildi.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Resource saqlanmadi.";
            setResourceError(message);
        }
    };

    const handleQuizFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setQuizError(null);

        if (!file) {
            setQuizFile(null);
            return;
        }

        const isDocx =
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.toLowerCase().endsWith(".docx");

        if (!isDocx) {
            setQuizFile(null);
            setQuizError("Faqat .docx fayl yuklash mumkin.");
            return;
        }

        setQuizFile(file);
    };

    const handleImportQuiz = async () => {
        if (!lessonId) return;
        if (!quizFile) {
            setQuizError(".docx fayl tanlang.");
            return;
        }

        try {
            await importQuiz({
                lessonId,
                file: quizFile,
                timeLimitMinutes: quizTimeLimit.trim() ? Number(quizTimeLimit) : undefined,
            });

            setLastImportedFileName(quizFile.name);
            setQuizFile(null);
            setQuizTimeLimit("");
            setQuizError(null);
            toast.success("Quiz import qilindi.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Quiz import bo‘lmadi.";
            setQuizError(message);
        }
    };

    if (!lessonId) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-6 py-10">
                <div className="max-w-lg rounded-[28px] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Lesson tanlanmagan</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Teacher raw ID bilan ishlamaydi. Avval course, keyin module va lesson tanlang, shundan keyin manage panel shu yerda ochiladi.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-white dark:bg-slate-950">
            <ScrollArea className="flex-1">
                <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8">
                    <section className="grid gap-5">
                        <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => onBack?.()}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Lesson info</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Video va matn shu yerda boshqariladi.</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {isLessonType ? (
                                        <button
                                            type="button"
                                            onClick={() => setActiveComposer("video")}
                                            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                                                activeComposer === "video"
                                                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                            }`}
                                        >
                                            <Video className="h-4 w-4" />
                                            Video
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setActiveComposer("homework")}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                                            activeComposer === "homework"
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                        }`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Vazifa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveComposer("quiz")}
                                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                                            activeComposer === "quiz"
                                                ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                        }`}
                                    >
                                        <FileQuestion className="h-4 w-4" />
                                        Test
                                    </button>
                                    {isLessonType ? (
                                        <button
                                            type="button"
                                            onClick={() => setActiveComposer("resource")}
                                            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                                                activeComposer === "resource"
                                                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                                            }`}
                                        >
                                            <Paperclip className="h-4 w-4" />
                                            Resurs
                                        </button>
                                    ) : null}
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleSaveLesson}
                                    disabled={!formik.dirty}
                                    className="h-11 rounded-2xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    <Save className="h-4 w-4" />
                                    {formik.dirty ? "Saqlash" : "Saqlangan"}
                                </Button>
                            </div>

                            {isLessonType && activeComposer === "video" ? (
                                <>
                                    <div className="mt-6">
                                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                            Lesson nomi
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            type="text"
                                            placeholder="Lesson nomi"
                                            className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                                        />
                                        {formik.touched.name && formik.errors.name ? (
                                            <p className="mt-2 text-xs font-medium text-rose-500">{formik.errors.name}</p>
                                        ) : null}
                                    </div>

                                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                                Type
                                            </label>
                                            <Select
                                                value={formik.values.type ?? "LESSON"}
                                                onValueChange={(value) => formik.setFieldValue("type", value)}
                                            >
                                                <SelectTrigger className="!h-12 rounded-2xl border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                                                    <span className="flex min-w-0 items-center gap-3">
                                                        <span
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                                (formik.values.type ?? "LESSON") === "LESSON"
                                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                                                                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
                                                            }`}
                                                        >
                                                            {(formik.values.type ?? "LESSON") === "LESSON" ? (
                                                                <Video className="h-4 w-4" />
                                                            ) : (
                                                                <FileQuestion className="h-4 w-4" />
                                                            )}
                                                        </span>
                                                        <span className="truncate">{LESSON_TYPE_LABELS[(formik.values.type ?? "LESSON") as LessonType]}</span>
                                                    </span>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                                                    <SelectItem value="LESSON" className="rounded-xl px-3 py-3">
                                                        <span className="flex items-center gap-3">
                                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                                                                <Video className="h-4 w-4" />
                                                            </span>
                                                            <span className="font-semibold text-slate-900 dark:text-slate-100">Dars</span>
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="PRACTICE" className="rounded-xl px-3 py-3">
                                                        <span className="flex items-center gap-3">
                                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                                                                <FileQuestion className="h-4 w-4" />
                                                            </span>
                                                            <span className="font-semibold text-slate-900 dark:text-slate-100">Mashq</span>
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                                Ko‘rish foizi
                                            </label>
                                            <Input
                                                id="watchCompletionPercent"
                                                name="watchCompletionPercent"
                                                value={formik.values.watchCompletionPercent ?? 80}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                type="number"
                                                min="0"
                                                max="100"
                                                className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                                            />
                                            {formik.touched.watchCompletionPercent && formik.errors.watchCompletionPercent ? (
                                                <p className="mt-2 text-xs font-medium text-rose-500">{formik.errors.watchCompletionPercent}</p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                            Tavsif
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formik.values.description ?? ""}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Qisqacha ta'rif"
                                            className="min-h-[88px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                            Video link
                                        </label>
                                        <Input
                                            id="videoUrl"
                                            name="videoUrl"
                                            value={formik.values.videoUrl ?? ""}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            type="text"
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-950"
                                        />
                                    </div>

                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                                            <Video className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Video</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Video va ko‘rish foizi faqat dars uchun ishlatiladi.</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-5">
                                        <div className="mx-auto max-w-3xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
                                            <div className="aspect-video bg-slate-50 dark:bg-slate-900">
                                                <VideoPlayer videoUrl={formik.values.videoUrl ?? ""} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>

                    </section>

                    {showComposerPanels ? (
                    <>
                    <section className="grid gap-5">
                        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
                            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                                {activeComposer === "homework" ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Vazifa qo‘shish</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Link va fayl ixtiyoriy.</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Vazifa nomi</label>
                                            <Input
                                                value={homeworkForm.title}
                                                onChange={(event) => setHomeworkForm({...homeworkForm, title: event.target.value})}
                                                placeholder="Masalan: Amaliy vazifa 1"
                                                className="h-11 rounded-2xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Maksimal ball</label>
                                            <Input
                                                type="number"
                                                value={homeworkForm.maxScore}
                                                onChange={(event) => setHomeworkForm({...homeworkForm, maxScore: event.target.value})}
                                                placeholder="Masalan: 100"
                                                className="h-11 rounded-2xl"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tashqi link</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddLinkField("homework")}
                                                    disabled={homeworkForm.links.length >= MAX_EXTERNAL_LINKS}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-blue-300 dark:disabled:text-slate-500"
                                                >
                                                    Link qo‘shish ({homeworkForm.links.length}/{MAX_EXTERNAL_LINKS})
                                                </button>
                                            </div>
                                            {homeworkForm.links.map((link, index) => (
                                                <div key={`homework-link-${index}`} className="flex items-center gap-2">
                                                    <Input
                                                        value={link}
                                                        onChange={(event) => handleMaterialLinkChange("homework", index, event.target.value)}
                                                        placeholder="https://..."
                                                        className="h-11 rounded-2xl"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLinkField("homework", index)}
                                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                                                    >
                                                        Olib tashlash
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Fayl yuklash</label>
                                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:text-blue-200">
                                                <Upload className="h-4 w-4" />
                                                Fayl tanlash
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept={MATERIAL_ACCEPT}
                                                    className="hidden"
                                                    onChange={(event) => handleFilesChange("homework", event)}
                                                />
                                            </label>
                                            {homeworkForm.files.length > 0 ? (
                                                <div className="mt-2 space-y-1">
                                                    {homeworkForm.files.map((file) => (
                                                        <div key={file.name} className="text-xs text-slate-500 dark:text-slate-400">
                                                            {file.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        {previewLinks(homeworkForm.links).length > 0 || previewFiles(homeworkForm.files).length > 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Hozir qo‘shiladiganlar</p>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    {previewLinks(homeworkForm.links).map((link) => (
                                                        <div key={link} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                            <Link2 className="h-4 w-4 text-blue-500" />
                                                            <span className="truncate">{link}</span>
                                                        </div>
                                                    ))}
                                                    {previewFiles(homeworkForm.files).map((fileName) => (
                                                        <div key={fileName} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                            <Paperclip className="h-4 w-4 text-emerald-500" />
                                                            <span className="truncate">{fileName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        {homeworkError ? <p className="text-xs font-medium text-rose-500">{homeworkError}</p> : null}

                                        <Button
                                            type="button"
                                            onClick={handleHomeworkSubmit}
                                            disabled={isCreatingHomework}
                                            className="h-11 w-full rounded-2xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
                                        >
                                            {isCreatingHomework ? "Saqlanmoqda..." : "Vazifani saqlash"}
                                        </Button>
                                    </div>
                                ) : null}

                                {activeComposer === "resource" && isLessonType ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                                                <Paperclip className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Resurs qo‘shish</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Link va fayl ixtiyoriy.</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Resurs nomi</label>
                                            <Input
                                                value={resourceForm.title}
                                                onChange={(event) => setResourceForm({...resourceForm, title: event.target.value})}
                                                placeholder="Masalan: Qo‘shimcha materiallar"
                                                className="h-11 rounded-2xl"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tashqi link</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddLinkField("resource")}
                                                    disabled={resourceForm.links.length >= MAX_EXTERNAL_LINKS}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-blue-300 dark:disabled:text-slate-500"
                                                >
                                                    Link qo‘shish ({resourceForm.links.length}/{MAX_EXTERNAL_LINKS})
                                                </button>
                                            </div>
                                            {resourceForm.links.map((link, index) => (
                                                <div key={`resource-link-${index}`} className="flex items-center gap-2">
                                                    <Input
                                                        value={link}
                                                        onChange={(event) => handleMaterialLinkChange("resource", index, event.target.value)}
                                                        placeholder="https://..."
                                                        className="h-11 rounded-2xl"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLinkField("resource", index)}
                                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                                                    >
                                                        Olib tashlash
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Fayl yuklash</label>
                                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/30 dark:hover:text-blue-200">
                                                <Upload className="h-4 w-4" />
                                                Fayl tanlash
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept={MATERIAL_ACCEPT}
                                                    className="hidden"
                                                    onChange={(event) => handleFilesChange("resource", event)}
                                                />
                                            </label>
                                            {resourceForm.files.length > 0 ? (
                                                <div className="mt-2 space-y-1">
                                                    {resourceForm.files.map((file) => (
                                                        <div key={file.name} className="text-xs text-slate-500 dark:text-slate-400">
                                                            {file.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        {previewLinks(resourceForm.links).length > 0 || previewFiles(resourceForm.files).length > 0 ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Hozir qo‘shiladiganlar</p>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    {previewLinks(resourceForm.links).map((link) => (
                                                        <div key={link} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                            <Link2 className="h-4 w-4 text-blue-500" />
                                                            <span className="truncate">{link}</span>
                                                        </div>
                                                    ))}
                                                    {previewFiles(resourceForm.files).map((fileName) => (
                                                        <div key={fileName} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                            <Paperclip className="h-4 w-4 text-emerald-500" />
                                                            <span className="truncate">{fileName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        {resourceError ? <p className="text-xs font-medium text-rose-500">{resourceError}</p> : null}

                                        <Button
                                            type="button"
                                            onClick={handleResourceSubmit}
                                            disabled={isCreatingResource}
                                            className="h-11 w-full rounded-2xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            {isCreatingResource ? "Saqlanmoqda..." : "Resursni saqlash"}
                                        </Button>
                                    </div>
                                ) : null}

                                {activeComposer === "quiz" ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                                                <FileQuestion className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Test yuklash</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">`.docx` fayl orqali import qiling.</p>
                                            </div>
                                        </div>

                                        <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Tanlangan fayl</p>
                                            <p className="mt-1 text-sm font-medium text-slate-950 dark:text-slate-100">
                                                {quizFile?.name || lastImportedFileName || "Hali fayl tanlanmagan"}
                                            </p>
                                        </div>

                                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-500/30 dark:hover:text-violet-200">
                                            <Upload className="h-4 w-4" />
                                            `.docx` tanlash
                                            <input
                                                type="file"
                                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleQuizFileChange}
                                                className="hidden"
                                            />
                                        </label>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Vaqt limiti (ixtiyoriy)</label>
                                            <Input
                                                type="number"
                                                value={quizTimeLimit}
                                                onChange={(event) => setQuizTimeLimit(event.target.value)}
                                                placeholder="Masalan: 20"
                                                className="h-11 rounded-2xl"
                                            />
                                        </div>

                                        {quizFile || lastImportedFileName ? (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Hozir qo‘shiladigan fayl</p>
                                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                    <Paperclip className="h-4 w-4 text-violet-500" />
                                                    <span className="truncate">{quizFile?.name || lastImportedFileName}</span>
                                                </div>
                                            </div>
                                        ) : null}

                                        {quizError ? <p className="text-xs font-medium text-rose-500">{quizError}</p> : null}

                                        <Button
                                            type="button"
                                            onClick={handleImportQuiz}
                                            disabled={isImportingQuiz || !lessonId}
                                            className="h-11 w-full rounded-2xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-700"
                                        >
                                            {isImportingQuiz ? "Yuklanmoqda..." : "Testni yuklash"}
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
                            <div className="flex items-center gap-3">
                                <div className={`rounded-2xl p-3 ${
                                    activeComposer === "homework"
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                                        : activeComposer === "resource"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                                            : "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200"
                                }`}>
                                    <FileTextIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-950 dark:text-slate-100">
                                        {activeComposer === "homework" ? "Mavjud vazifalar" : activeComposer === "resource" ? "Mavjud resurslar" : "Mavjud testlar"}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {activeComposer === "homework"
                                            ? "Saqlangan vazifalar shu yerda ko‘rinadi."
                                            : activeComposer === "resource"
                                                ? "Saqlangan resurslar shu yerda ko‘rinadi."
                                                : "Saqlangan testlar shu yerda ko‘rinadi."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {lessonTasksQuery.isLoading ? (
                                    <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                                        Bloklar yuklanmoqda...
                                    </div>
                                ) : visibleTasks.length === 0 && visibleResources.length === 0 ? (
                                    <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                                        {activeComposer === "homework"
                                            ? "Hozircha vazifa birikmagan."
                                            : activeComposer === "resource"
                                                ? "Hozircha resurs birikmagan."
                                                : "Hozircha test birikmagan."}
                                    </div>
                                ) : (
                                    <>
                                        {visibleTasks.map((task) => {
                                            const meta = blockTypeMeta[task.type] || {
                                                label: task.type || "Blok",
                                                badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                                            };

                                            return (
                                                <div
                                                    key={task.id}
                                                    className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-950 dark:text-slate-100">
                                                                {task.title || `${meta.label} blok`}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.badge}`}>
                                                            {meta.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {visibleResources.map((resource) => (
                                                <div
                                                    key={resource.id}
                                                    className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="text-sm font-medium text-slate-950 dark:text-slate-100">{resource.title}</p>
                                                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                                                            Resurs
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {resource.links.map((link) => (
                                                            <span
                                                                key={link}
                                                                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                                                            >
                                                                <Link2 className="h-3 w-3" />
                                                                Link
                                                            </span>
                                                        ))}
                                                        {resource.fileName ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                                <Paperclip className="h-3 w-3" />
                                                                {resource.fileName}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                    </>
                    ) : null}
                </div>
            </ScrollArea>
        </div>
    );
}
