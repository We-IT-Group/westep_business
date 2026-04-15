import {ChangeEvent, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate, useParams} from "react-router";
import {useAddLesson, useGetLessonById, useUpdateLesson} from "../../../api/lessons/useLesson.ts";
import {Lesson} from "../../../types/types.ts";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useMobile} from "../../../hooks/useMobile.ts";
import {
    BookOpen,
    CheckCircle2,
    FileQuestion,
    FileTextIcon,
    Link2,
    LoaderCircle,
    Paperclip,
    Save,
    SettingsIcon,
    Upload,
    Video
} from "lucide-react";
import {Input} from "../../ui/input.tsx";
import {ScrollArea} from "../../ui/scroll-area.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../ui/tabs.tsx";
import {Textarea} from "../../ui/textarea.tsx";
import {Button} from "../../ui/button.tsx";
import {useImportLessonQuiz} from "../../../api/lessonQuiz/useLessonQuiz.ts";
import {useToast} from "../../../hooks/useToast.tsx";
import VideoPlayer from "./VedioPlayerComponent.tsx";
import {useCreateLessonHomework, useCreateLessonResource} from "../../../api/lessonMaterials/useLessonMaterials.ts";
import {baseUrlImage} from "../../../api/apiClient.ts";
import LessonTeacherReviewPanel from "./LessonTeacherReviewPanel.tsx";

type LessonMaterialFormState = {
    title: string;
    description: string;
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

const MATERIAL_ACCEPT =
    ".xls,.xlsx,.pdf,.doc,.docx,.ppt,.pptx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

const isValidExternalLink = (value: string) => /^https?:\/\//i.test(value.trim());
const MAX_EXTERNAL_LINKS = 5;

const getInvalidFiles = (files: File[]) => {
    const allowedExtensions = [".xls", ".xlsx", ".pdf", ".doc", ".docx", ".ppt", ".pptx"];

    return files.filter((file) => {
        const lowerName = file.name.toLowerCase();
        return !allowedExtensions.some((extension) => lowerName.endsWith(extension));
    });
};

const createEmptyMaterialForm = (): LessonMaterialFormState => ({
    title: "",
    description: "",
    links: [""],
    files: [],
});

const createEmptyHomeworkForm = (): HomeworkFormState => ({
    ...createEmptyMaterialForm(),
    maxScore: "",
});

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? value as Record<string, unknown> : null;

const asString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : undefined;

const normalizeFileUrl = (value?: string) => {
    if (!value) return undefined;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${baseUrlImage.replace(/\/api$/, "")}${value}`;
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
        asString(attachment?.storagePath)
    );

    const fileName =
        asString(record.fileName) ||
        asString(record.originalFileName) ||
        asString(record.attachmentName) ||
        asString(attachment?.fileName) ||
        asString(attachment?.originalFileName) ||
        asString(attachment?.name);

    const links = Array.from(new Set(
        [
            ...(Array.isArray(record.links) ? record.links : []),
            record.link,
            record.externalLink,
        ]
            .map((value) => asString(value))
            .filter((value): value is string => Boolean(value))
    ));

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

function AddLesson() {
    const {lessonId, id} = useParams<{ lessonId: string, id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useMobile();
    const toast = useToast();
    const locationState = location.state as { moduleId?: string; lessonLength?: number } | null;
    const moduleId = locationState?.moduleId ?? "";
    const lessonLength = locationState?.lessonLength ?? 0;

    const {data} = useGetLessonById(lessonId);

    const {mutateAsync: addLesson, isSuccess: isAddingSucess} = useAddLesson(id);
    const {mutateAsync: updateLesson, isSuccess: isUpdateSuccess} = useUpdateLesson();
    const {mutateAsync: importQuiz, isPending: isImportingQuiz} = useImportLessonQuiz(lessonId);
    const {mutateAsync: createHomework, isPending: isCreatingHomework} = useCreateLessonHomework(lessonId);
    const {mutateAsync: createResource, isPending: isCreatingResource} = useCreateLessonResource(lessonId);

    const [quizFile, setQuizFile] = useState<File | null>(null);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [lastImportedFileName, setLastImportedFileName] = useState<string | null>(null);
    const [homeworkForm, setHomeworkForm] = useState<HomeworkFormState>(createEmptyHomeworkForm);
    const [resourceForm, setResourceForm] = useState<LessonMaterialFormState>(createEmptyMaterialForm);
    const [homeworkError, setHomeworkError] = useState<string | null>(null);
    const [resourceError, setResourceError] = useState<string | null>(null);
    const lessonResources = useMemo(() => extractLessonResources(data), [data]);

    const initialValues = useMemo<Omit<Lesson, "id" | "createdAt">>(() => {
        if (data && lessonId) {
            return {
                name: data.name,
                description: data.description ?? "",
                moduleId: data.moduleId,
                orderIndex: data.orderIndex,
                estimatedDuration: data.estimatedDuration,
                videoUrl: data.vedioUrl ?? "",
            };
        }

        return {
            name: "",
            description: "",
            moduleId,
            orderIndex: 0,
            estimatedDuration: 0,
            videoUrl: "",
        };
    }, [data, lessonId, moduleId]);

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .required("Nomini kiriting!"),
            moduleId: Yup.string()
                .required("Kurs tanlang!"),
            estimatedDuration: Yup.number().required("Dars davomiyligini kiriting"),
            videoUrl: Yup.string()
                .required("Vedio link kiriting!"),
        }),
        onSubmit: async () => {
            if (lessonId) {
                await updateLesson({body: {...formik.values, id: lessonId}});
            } else {
                await addLesson({body: {...formik.values, orderIndex: lessonLength + 1}});
            }

        },
    });

    useEffect(() => {
        if (isUpdateSuccess || isAddingSucess) {
            if (isMobile) {
                navigate(`/courses/details/${id}`);
            } else {
                navigate(-1);
            }
        }
    }, [id, isAddingSucess, isMobile, isUpdateSuccess, navigate]);

    const handleSave = async () => {
        if (!lessonId) return;
        const errors = await formik.validateForm();
        formik.setTouched({
            ...formik.touched,
            name: true,
        });

        if (errors.name) return;
        await updateLesson({body: {...formik.values, id: lessonId}});
    };

    const quizFileName = useMemo(() => {
        return quizFile?.name || lastImportedFileName;
    }, [lastImportedFileName, quizFile]);

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
        if (!lessonId) {
            setQuizError("Avval lesson yaratilgan bo‘lishi kerak.");
            return;
        }

        if (!quizFile) {
            setQuizError(".docx fayl tanlang.");
            return;
        }

        setQuizError(null);

        try {
            const hasVideoLink = Boolean(formik.values.videoUrl?.trim());
            const useModuleEndpoint = !hasVideoLink && Boolean(formik.values.moduleId);

            if (useModuleEndpoint && !formik.values.moduleId) {
                setQuizError("Module aniqlanmadi.");
                return;
            }

            await importQuiz({
                lessonId,
                moduleId: formik.values.moduleId,
                file: quizFile,
                useModuleEndpoint,
            });
            setLastImportedFileName(quizFile.name);
            setQuizFile(null);
            toast.success("Lesson test muvaffaqiyatli import qilindi.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Quiz import qilishda xatolik yuz berdi.";
            setQuizError(message);
            toast.error("Lesson test import bo‘lmadi.", message);
        }
    };

    const handleMaterialFilesChange = (
        event: ChangeEvent<HTMLInputElement>,
        target: "homework" | "resource"
    ) => {
        const selectedFiles = Array.from(event.target.files || []);
        const invalidFiles = getInvalidFiles(selectedFiles);

        if (target === "homework") {
            setHomeworkError(null);
        } else {
            setResourceError(null);
        }

        if (invalidFiles.length > 0) {
            const message = "Faqat Excel, PDF, Word va PowerPoint fayllarini yuklash mumkin.";

            if (target === "homework") {
                setHomeworkError(message);
                setHomeworkForm((prev) => ({...prev, files: []}));
            } else {
                setResourceError(message);
                setResourceForm((prev) => ({...prev, files: []}));
            }

            event.target.value = "";
            return;
        }

        if (target === "homework") {
            setHomeworkForm((prev) => ({...prev, files: selectedFiles}));
        } else {
            setResourceForm((prev) => ({...prev, files: selectedFiles}));
        }

        event.target.value = "";
    };

    const handleHomeworkSubmit = async () => {
        if (!lessonId) return;

        const normalizedLinks = homeworkForm.links.map((link) => link.trim()).filter(Boolean);

        if (normalizedLinks.length > MAX_EXTERNAL_LINKS) {
            setHomeworkError(`Ko‘pi bilan ${MAX_EXTERNAL_LINKS} ta link kiritish mumkin.`);
            return;
        }

        if (normalizedLinks.some((link) => !isValidExternalLink(link))) {
            setHomeworkError("Har bir link http:// yoki https:// bilan boshlanishi kerak.");
            return;
        }

        try {
            setHomeworkError(null);

            await createHomework({
                lessonId,
                title: homeworkForm.title,
                description: homeworkForm.description,
                maxScore: homeworkForm.maxScore ? Number(homeworkForm.maxScore) : undefined,
                links: normalizedLinks,
                files: homeworkForm.files,
            });

            setHomeworkForm(createEmptyHomeworkForm());
            toast.success("Homework qo‘shildi.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Homework saqlanmadi.";
            setHomeworkError(message);
        }
    };

    const handleResourceSubmit = async () => {
        if (!lessonId) return;

        const normalizedLinks = resourceForm.links.map((link) => link.trim()).filter(Boolean);
        const hasLink = normalizedLinks.length > 0;
        const hasFiles = resourceForm.files.length > 0;

        if (normalizedLinks.length > MAX_EXTERNAL_LINKS) {
            setResourceError(`Ko‘pi bilan ${MAX_EXTERNAL_LINKS} ta link kiritish mumkin.`);
            return;
        }

        if (normalizedLinks.some((link) => !isValidExternalLink(link))) {
            setResourceError("Har bir link http:// yoki https:// bilan boshlanishi kerak.");
            return;
        }

        if (!hasLink && !hasFiles) {
            setResourceError("Kamida file yoki link kiriting");
            return;
        }

        try {
            setResourceError(null);

            await createResource({
                lessonId,
                title: resourceForm.title,
                description: resourceForm.description,
                links: hasLink ? normalizedLinks : undefined,
                files: resourceForm.files,
            });

            setResourceForm(createEmptyMaterialForm());
            toast.success("Resource qo‘shildi.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Resource saqlanmadi.";
            setResourceError(message);
        }
    };


    if (!lessonId) {
        return (
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div
                        className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                        <FileTextIcon className="w-12 h-12 text-gray-400"/>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No lesson selected</h3>
                    <p className="text-gray-600 mb-6">
                        Select a lesson from the course structure to start editing, or create a new one to get started.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                        <p className="text-sm text-blue-900">
                            <strong>💡 Quick tip:</strong> Double-click any lesson or module name to rename it.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-white flex flex-col relative">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex-1 max-w-2xl">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Lesson Title
                        </label>
                        <Input
                            id={'name'}
                            name={'name'}
                            value={formik.values.name}
                            onChange={formik?.handleChange}
                            onBlur={formik?.handleBlur}
                            type="text"
                            placeholder="Enter lesson title"
                            className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 h-auto py-2"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="mt-2 text-sm text-red-600">{formik.errors.name}</p>
                        )}
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={!formik.dirty}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 h-11 px-6 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Save className="w-5 h-5"/>
                        {formik.dirty ? "Save Changes" : "Saved"}
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-8">
                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="mb-6 bg-gray-100 p-1 h-auto">
                            <TabsTrigger value="content"
                                         className="gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileTextIcon className="w-4 h-4"/>
                                Content
                            </TabsTrigger>
                            <TabsTrigger value="resources"
                                         className="gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Paperclip className="w-4 h-4"/>
                                Resources
                            </TabsTrigger>
                            <TabsTrigger value="teacher-review"
                                         className="gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <FileQuestion className="w-4 h-4"/>
                                Teacher Review
                            </TabsTrigger>
                            <TabsTrigger value="settings"
                                         className="gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <SettingsIcon className="w-4 h-4"/>
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        {/* Content Tab */}
                        <TabsContent value="content" className="space-y-8 mt-0">
                            {/* Video Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Video className="w-5 h-5 text-gray-700"/>
                                    <h3 className="text-lg font-semibold text-gray-900">Video Content</h3>
                                </div>


                                <VideoPlayer videoUrl={formik.values.videoUrl ?? ""}/>

                                <div className="mt-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Embed Video URL
                                    </label>
                                    <Input
                                        id={'videoUrl'}
                                        name={'videoUrl'}
                                        value={formik.values.videoUrl}
                                        onChange={formik?.handleChange}
                                        onBlur={formik?.handleBlur}
                                        type="text"
                                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                        className="h-12"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Paste a YouTube, Vimeo, or other video platform URL
                                    </p>
                                </div>
                            </div>

                            {/* Text Content Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FileTextIcon className="w-5 h-5 text-gray-700"/>
                                    <h3 className="text-lg font-semibold text-gray-900">Written Content</h3>
                                </div>
                                <div
                                    className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                    <Textarea
                                        id={'description'}
                                        name={'description'}
                                        value={formik.values.description}
                                        onChange={formik?.handleChange}
                                        onBlur={formik?.handleBlur}
                                        placeholder="Write your lesson content here...

You can use markdown formatting:
- **bold text**
- *italic text*
- # Headings
- Lists and more"
                                        className="min-h-[400px] border-0 focus-visible:ring-0 text-base leading-relaxed resize-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-xs text-gray-500">
                                        💡 Supports Markdown formatting
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {/*{content.length} characters*/}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="teacher-review" className="space-y-6 mt-0">
                            <LessonTeacherReviewPanel lessonId={lessonId}/>
                        </TabsContent>

                        {/* Resources Tab */}
                        <TabsContent value="resources" className="space-y-6 mt-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Quiz Import</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Teacher yaratilgan lesson uchun `.docx` test faylini import qilishi mumkin.
                                </p>

                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                            <FileQuestion className="w-7 h-7 text-blue-600"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-semibold text-gray-900">
                                                Import quiz from Word
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Endpoint: video link bo‘lsa `/api/lesson-tasks/lesson/{lessonId}/quiz/import`,
                                                bo‘lmasa `/api/module-tests/module/{moduleId}/import`
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Faqat `.docx` fayl yuboriladi va quiz aynan shu lesson ichiga
                                                yoki module-level test sifatida qo‘shiladi.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                                        <div
                                            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-700">Selected file</p>
                                                <p className="mt-1 truncate text-sm text-gray-900">
                                                    {quizFileName || "Hali fayl tanlanmagan"}
                                                </p>
                                            </div>
                                            <label className="inline-flex">
                                                <input
                                                    type="file"
                                                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    onChange={handleQuizFileChange}
                                                    className="sr-only"
                                                />
                                                <span
                                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-400 hover:text-blue-600">
                                                    <Upload className="w-4 h-4"/>
                                                    Choose .docx
                                                </span>
                                            </label>
                                        </div>

                                        {quizError && (
                                            <p className="mt-3 text-sm text-red-600">{quizError}</p>
                                        )}

                                        {lastImportedFileName && !quizError && (
                                            <div
                                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                                                <CheckCircle2 className="w-4 h-4"/>
                                                Oxirgi import: {lastImportedFileName}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            type="button"
                                            onClick={handleImportQuiz}
                                            disabled={!lessonId || isImportingQuiz}
                                            className="gap-2"
                                        >
                                            {isImportingQuiz ? (
                                                <>
                                                    <LoaderCircle className="w-4 h-4 animate-spin"/>
                                                    Import qilinmoqda...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4"/>
                                                    Import Lesson Test
                                                </>
                                            )}
                                        </Button>
                                        <div className="text-xs text-gray-500 self-center">
                                            Lesson ID: {lessonId || "lesson hali yaratilmagan"}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                                    <p className="text-sm text-amber-900">
                                        <strong>Important:</strong> Avval lesson yaratiladi, keyin test shu lessonga
                                        import qilinadi.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div className="grid gap-6 xl:grid-cols-2">
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                                <BookOpen className="h-6 w-6 text-blue-600"/>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Create Homework</h3>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Teacher homework uchun file, external link yoki ikkalasini ham
                                                    qo‘sha oladi.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Homework title
                                                </label>
                                                <Input
                                                    value={homeworkForm.title}
                                                    onChange={(event) => {
                                                        setHomeworkError(null);
                                                        setHomeworkForm((prev) => ({
                                                            ...prev,
                                                            title: event.target.value,
                                                        }));
                                                    }}
                                                    placeholder="Homework title"
                                                    className="h-11"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Homework description
                                                </label>
                                                <Textarea
                                                    value={homeworkForm.description}
                                                    onChange={(event) => {
                                                        setHomeworkError(null);
                                                        setHomeworkForm((prev) => ({
                                                            ...prev,
                                                            description: event.target.value,
                                                        }));
                                                    }}
                                                    placeholder="Homework description"
                                                    className="min-h-[120px]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Max score
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={homeworkForm.maxScore}
                                                    onChange={(event) => {
                                                        setHomeworkError(null);
                                                        setHomeworkForm((prev) => ({
                                                            ...prev,
                                                            maxScore: event.target.value,
                                                        }));
                                                    }}
                                                    placeholder="100"
                                                    className="h-11"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    External links
                                                </label>
                                                <div className="space-y-3">
                                                    {homeworkForm.links.map((link, index) => (
                                                        <div key={`homework-link-${index}`} className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Link2
                                                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                                                <Input
                                                                    value={link}
                                                                    onChange={(event) => {
                                                                        setHomeworkError(null);
                                                                        setHomeworkForm((prev) => ({
                                                                            ...prev,
                                                                            links: prev.links.map((item, itemIndex) =>
                                                                                itemIndex === index ? event.target.value : item
                                                                            ),
                                                                        }));
                                                                    }}
                                                                    placeholder="https://docs.google.com/..."
                                                                    className="h-11 pl-10"
                                                                />
                                                            </div>
                                                            {homeworkForm.links.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setHomeworkError(null);
                                                                        setHomeworkForm((prev) => ({
                                                                            ...prev,
                                                                            links: prev.links.filter((_, itemIndex) => itemIndex !== index),
                                                                        }));
                                                                    }}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={homeworkForm.links.length >= MAX_EXTERNAL_LINKS}
                                                        onClick={() => {
                                                            setHomeworkError(null);
                                                            setHomeworkForm((prev) => ({
                                                                ...prev,
                                                                links: [...prev.links, ""],
                                                            }));
                                                        }}
                                                        className="w-full"
                                                    >
                                                        Add link ({homeworkForm.links.length}/{MAX_EXTERNAL_LINKS})
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    File upload
                                                </label>
                                                <label
                                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-medium text-gray-700 transition hover:border-blue-400 hover:text-blue-600">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept={MATERIAL_ACCEPT}
                                                        onChange={(event) => handleMaterialFilesChange(event, "homework")}
                                                        className="sr-only"
                                                    />
                                                    <Upload className="h-4 w-4"/>
                                                    Upload files
                                                </label>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Excel, PDF, Word va PowerPoint fayllari qo‘llab-quvvatlanadi.
                                                </p>
                                                {homeworkForm.files.length > 0 && (
                                                    <p className="mt-2 text-sm text-gray-700">
                                                        {homeworkForm.files.map((file) => file.name).join(", ")}
                                                    </p>
                                                )}
                                            </div>

                                            {homeworkError && (
                                                <p className="text-sm text-red-600">{homeworkError}</p>
                                            )}

                                            <Button
                                                type="button"
                                                onClick={handleHomeworkSubmit}
                                                disabled={isCreatingHomework}
                                                className="w-full gap-2"
                                            >
                                                {isCreatingHomework ? (
                                                    <>
                                                        <LoaderCircle className="h-4 w-4 animate-spin"/>
                                                        Saqlanmoqda...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4"/>
                                                        Add Homework
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                                <Paperclip className="h-6 w-6 text-emerald-600"/>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Create Resource</h3>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Resource uchun kamida link yoki file bo‘lishi kerak.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Resource title
                                                </label>
                                                <Input
                                                    value={resourceForm.title}
                                                    onChange={(event) => {
                                                        setResourceError(null);
                                                        setResourceForm((prev) => ({
                                                            ...prev,
                                                            title: event.target.value,
                                                        }));
                                                    }}
                                                    placeholder="Resource title"
                                                    className="h-11"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    Resource description
                                                </label>
                                                <Textarea
                                                    value={resourceForm.description}
                                                    onChange={(event) => {
                                                        setResourceError(null);
                                                        setResourceForm((prev) => ({
                                                            ...prev,
                                                            description: event.target.value,
                                                        }));
                                                    }}
                                                    placeholder="Resource description"
                                                    className="min-h-[120px]"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    External links
                                                </label>
                                                <div className="space-y-3">
                                                    {resourceForm.links.map((link, index) => (
                                                        <div key={`resource-link-${index}`} className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Link2
                                                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                                                <Input
                                                                    value={link}
                                                                    onChange={(event) => {
                                                                        setResourceError(null);
                                                                        setResourceForm((prev) => ({
                                                                            ...prev,
                                                                            links: prev.links.map((item, itemIndex) =>
                                                                                itemIndex === index ? event.target.value : item
                                                                            ),
                                                                        }));
                                                                    }}
                                                                    placeholder="https://docs.google.com/..."
                                                                    className="h-11 pl-10"
                                                                />
                                                            </div>
                                                            {resourceForm.links.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setResourceError(null);
                                                                        setResourceForm((prev) => ({
                                                                            ...prev,
                                                                            links: prev.links.filter((_, itemIndex) => itemIndex !== index),
                                                                        }));
                                                                    }}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={resourceForm.links.length >= MAX_EXTERNAL_LINKS}
                                                        onClick={() => {
                                                            setResourceError(null);
                                                            setResourceForm((prev) => ({
                                                                ...prev,
                                                                links: [...prev.links, ""],
                                                            }));
                                                        }}
                                                        className="w-full"
                                                    >
                                                        Add link ({resourceForm.links.length}/{MAX_EXTERNAL_LINKS})
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                    File upload
                                                </label>
                                                <label
                                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-medium text-gray-700 transition hover:border-emerald-400 hover:text-emerald-600">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept={MATERIAL_ACCEPT}
                                                        onChange={(event) => handleMaterialFilesChange(event, "resource")}
                                                        className="sr-only"
                                                    />
                                                    <Upload className="h-4 w-4"/>
                                                    Upload files
                                                </label>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Kamida file yoki link kiriting.
                                                </p>
                                                {resourceForm.files.length > 0 && (
                                                    <p className="mt-2 text-sm text-gray-700">
                                                        {resourceForm.files.map((file) => file.name).join(", ")}
                                                    </p>
                                                )}
                                            </div>

                                            {resourceError && (
                                                <p className="text-sm text-red-600">{resourceError}</p>
                                            )}

                                            <Button
                                                type="button"
                                                onClick={handleResourceSubmit}
                                                disabled={isCreatingResource}
                                                className="w-full gap-2"
                                            >
                                                {isCreatingResource ? (
                                                    <>
                                                        <LoaderCircle className="h-4 w-4 animate-spin"/>
                                                        Saqlanmoqda...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4"/>
                                                        Add Resource
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-sm text-blue-900">
                                        <strong>Supported link examples:</strong> Google Docs, Google Sheets, Notion,
                                        Drive va boshqa `http://` yoki `https://` bilan boshlanadigan tashqi linklar.
                                    </p>
                                </div>

                                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Added Resources</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Lessonga biriktirilgan mavjud resource va linklar shu yerda chiqadi.
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                                            {lessonResources.length} ta
                                        </div>
                                    </div>

                                    {lessonResources.length === 0 ? (
                                        <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
                                            Hozircha resource qo‘shilmagan.
                                        </div>
                                    ) : (
                                        <div className="mt-5 space-y-3">
                                            {lessonResources.map((resource) => (
                                                <div
                                                    key={resource.id}
                                                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 rounded-lg bg-white p-2 text-gray-600">
                                                            <Paperclip className="h-4 w-4"/>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900">
                                                                {resource.title}
                                                            </p>

                                                            {resource.description && (
                                                                <p className="mt-1 text-sm text-gray-600">
                                                                    {resource.description}
                                                                </p>
                                                            )}

                                                            <div className="mt-3 space-y-2 text-sm">
                                                                {resource.links.map((link, index) => (
                                                                    <a
                                                                        key={`${resource.id}-link-${index}`}
                                                                        href={link}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                                                    >
                                                                        <Link2 className="h-4 w-4 shrink-0"/>
                                                                        <span className="truncate">{link}</span>
                                                                    </a>
                                                                ))}

                                                                {resource.fileUrl && (
                                                                    <a
                                                                        href={resource.fileUrl}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                                                                    >
                                                                        <Upload className="h-4 w-4 shrink-0"/>
                                                                        <span className="truncate">
                                                                            {resource.fileName || "Open file"}
                                                                        </span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-8 mt-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Lesson Settings</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Duration
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                id={'estimatedDuration'}
                                                name={'estimatedDuration'}
                                                value={formik.values.estimatedDuration ?? ""}
                                                onChange={formik?.handleChange}
                                                onBlur={formik?.handleBlur}
                                                placeholder="0"
                                                className="w-32 h-11"
                                                min="0"
                                            />
                                            <span className="text-sm text-gray-600">minutes</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Estimated time to complete this lesson
                                        </p>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">Lesson Access</h4>
                                        <div className="space-y-3">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        Allow preview
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Let users preview this lesson before enrolling
                                                    </p>
                                                </div>
                                            </label>

                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        Mark as prerequisite
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Students must complete this before moving forward
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">Assessment</h4>
                                        <div className="space-y-3">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        Add quiz
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Test student understanding after this lesson
                                                    </p>
                                                </div>
                                            </label>

                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        Assignment required
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Students must submit an assignment to continue
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScrollArea>

            {/*<div*/}
            {/*    className={'border w-full flex items-center justify-center overflow-hidden aspect-video border-blue-200 bg-white rounded-[20px]'}>*/}

            {/*    {*/}
            {/*        formik.values.videoUrl ? <Vedio videoUrl={formik.values.videoUrl}/>*/}
            {/*            : <p className={''}>Dars vediosi</p>*/}
            {/*    }*/}

            {/*</div>*/}

            {/*<form*/}
            {/*    onSubmit={(e) => {*/}
            {/*        e.preventDefault();*/}
            {/*        formik.handleSubmit();*/}
            {/*        return false;*/}
            {/*    }}>*/}
            {/*    <div className="grid grid-cols-1 gap-6 mt-5">*/}
            {/*        /!*<Input type="text" formik={formik} name={'name'} label={'Dars nomi'} placeholder={'Dars nomi'}/>*!/*/}
            {/*        /!*<Input type="text" formik={formik} name={'description'} label={'Dars tavsifi'}*!/*/}
            {/*        /!*       placeholder={'Tavsif'}/>*!/*/}
            {/*        /!*<Input type="number" formik={formik} name={'estimatedDuration'} label={'Dars davomiyligi'}*!/*/}
            {/*        /!*       placeholder={'Davomiyligi'}/>*!/*/}
            {/*        /!*<Input type="text" formik={formik} name={'videoUrl'} label={'Dars video link'}*!/*/}
            {/*        /!*       placeholder={'link'}/>*!/*/}
            {/*    </div>*/}
            {/*    <div className={'mt-5 flex'}>*/}
            {/*        <Button type="submit" variant='outline' isPending={isAdding || isUpdating}*/}
            {/*                disabled={isAdding || isUpdating} className={'w-full border border-blue-600  rounded-full'}>*/}
            {/*            <p className={'text-blue-600 text-lg'}>*/}
            {/*                {*/}
            {/*                    lessonId ? 'Darsni tahrirlash' : "Dars qo'shish"*/}
            {/*                }*/}
            {/*            </p>*/}
            {/*        </Button>*/}
            {/*    </div>*/}
            {/*</form>*/}
        </div>
    );
}

export default AddLesson;
