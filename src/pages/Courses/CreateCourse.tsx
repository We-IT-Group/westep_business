import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import {ArrowLeft, Camera, CheckCircle2} from "lucide-react";
import PageMeta from "../../components/common/PageMeta.tsx";
import {Button} from "../../components/ui/button.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Textarea} from "../../components/ui/textarea.tsx";
import {useAddCourse} from "../../api/courses/useCourse.ts";
import {useAddFile} from "../../api/file/useFile.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";
import {
    useCourseLanguages,
    useTaxonomyCategories,
    useTaxonomySkillTags,
    useTaxonomySubcategories,
} from "../../api/taxonomy/useTaxonomy.ts";
import {CoursePayload} from "../../api/courses/courseApi.ts";
import {getItem} from "../../utils/utils.ts";
import {isUnauthorizedError, parseApiError} from "../../utils/apiError.ts";

type CourseFormValues = Required<Pick<CoursePayload,
    | "name"
    | "primaryCategoryId"
    | "subcategoryId"
    | "description"
    | "fullDescription"
    | "languageId"
    | "trailerVideoUrl"
>> & {
    skillTagIds: string[];
    attachmentId: string;
};

const isYoutubeUrl = (value?: string) => {
    if (!value) return true;
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/i.test(value.trim());
};

const getSessionErrorMessage = () => "Sessiya topilmadi yoki tugagan. Qayta login qiling.";

export default function CreateCourse() {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const {mutateAsync: addCourse, isPending: isAdding} = useAddCourse();
    const {mutateAsync: uploadFile, isPending: isUploadingFile} = useAddFile();
    const {data: categories = []} = useTaxonomyCategories();
    const {data: subcategories = []} = useTaxonomySubcategories();
    const {data: skillTags = []} = useTaxonomySkillTags();
    const {data: languages = []} = useCourseLanguages();

    const formSectionClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950";
    const labelClass = "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400";
    const selectClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100";

    const formik = useFormik<CourseFormValues>({
        initialValues: {
            name: "",
            primaryCategoryId: "",
            subcategoryId: "",
            description: "",
            fullDescription: "",
            skillTagIds: [],
            languageId: "",
            attachmentId: "",
            trailerVideoUrl: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Kurs nomini kiriting"),
            // primaryCategoryId: Yup.string().required("Kategoriya tanlang"),
            // subcategoryId: Yup.string().required("Subkategoriya tanlang"),
            description: Yup.string().trim().required("Qisqa tavsif kiriting").max(500, "Qisqa tavsif juda uzun"),
            fullDescription: Yup.string().max(5000, "To‘liq tavsif juda uzun"),
            // languageId: Yup.string().required("Kurs tilini tanlang"),
            trailerVideoUrl: Yup.string().test("youtube-url", "Faqat YouTube link qabul qilinadi", isYoutubeUrl),
        }),
        onSubmit: async () => {
            if (!getItem<string>("accessToken")) {
                const message = getSessionErrorMessage();
                formik.setStatus(message);
                showErrorToast(new Error(message), "Autentifikatsiya talab qilinadi");
                navigate("/login", {replace: true});
                return;
            }

            try {
                let attachmentId = formik.values.attachmentId || null;

                if (selectedImage) {
                    const formData = new FormData();
                    formData.append("file", selectedImage);
                    let uploadResponse;

                    try {
                        uploadResponse = await uploadFile(formData);
                    } catch (error) {
                        if (isUnauthorizedError(error)) {
                            const message = getSessionErrorMessage();
                            formik.setStatus(message);
                            showErrorToast(new Error(message), "Fayl yuklab bo'lmadi");
                            navigate("/login", {replace: true});
                            return;
                        }
                        throw parseApiError(error, "Kurs rasmi yuklanmadi.");
                    }

                    attachmentId =
                        typeof uploadResponse === "string"
                            ? uploadResponse
                            : uploadResponse?.id || uploadResponse?.data?.id || null;
                }

                let createdCourse;
                try {
                    createdCourse = await addCourse({
                        name: formik.values.name.trim(),
                        primaryCategoryId: formik.values.primaryCategoryId,
                        subcategoryId: formik.values.subcategoryId,
                        description: formik.values.description.trim(),
                        fullDescription: formik.values.fullDescription.trim(),
                        skillTagIds: formik.values.skillTagIds,
                        languageId: formik.values.languageId,
                        attachmentId,
                        trailerVideoUrl: formik.values.trailerVideoUrl.trim(),
                    });
                } catch (error) {
                    if (isUnauthorizedError(error)) {
                        const message = getSessionErrorMessage();
                        formik.setStatus(message);
                        showErrorToast(new Error(message), "Kurs yaratib bo'lmadi");
                        navigate("/login", {replace: true});
                        return;
                    }
                    throw parseApiError(error, "Kurs yaratib bo'lmadi.");
                }

                showSuccessToast("Yangi kurs yaratildi");
                navigate(createdCourse?.id ? `/courses/details/${createdCourse.id}` : "/courses");
            } catch (error) {
                const parsedError = parseApiError(error, "Kurs yaratishda xatolik yuz berdi");
                formik.setStatus(parsedError.message);
                showErrorToast(error, "Kurs yaratib bo'lmadi");
            }
        },
    });

    const filteredSubcategories = useMemo(() => (
        subcategories.filter((subcategory) => (
            !formik.values.primaryCategoryId
            || !subcategory.categoryId
            || subcategory.categoryId === formik.values.primaryCategoryId
            || subcategory.parentId === formik.values.primaryCategoryId
        ))
    ), [formik.values.primaryCategoryId, subcategories]);

    useEffect(() => {
        if (!selectedImage) {
            setPreviewUrl("");
            return;
        }

        const objectUrl = URL.createObjectURL(selectedImage);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    const isSubmitting = isAdding || isUploadingFile;

    return (
        <div className="mx-auto max-w-[1180px] space-y-4 pb-10">
            <PageMeta title="Kurs yaratish" description="Yangi kurs yaratish sahifasi" />

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/courses")}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Yangi kurs yaratish</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ma'lumotlarni kiriting, kurs yaratilgach darslar sahifasi ochiladi.</p>
                    </div>
                </div>
            </section>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <section className="grid gap-4 lg:grid-cols-2">
                    <div className={formSectionClass}>
                        <label className={labelClass}>Kurs nomi</label>
                        <Input
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Masalan: Java Backend"
                            className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm font-medium dark:border-slate-800 dark:bg-slate-900"
                            autoFocus
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.name}</p>
                        ) : null}
                    </div>

                    <div className={formSectionClass}>
                        <label className={labelClass}>Kurs tili</label>
                        <select
                            id="languageId"
                            name="languageId"
                            value={formik.values.languageId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={selectClass}
                        >
                            <option value="">Til tanlang</option>
                            {languages.map((language) => (
                                <option key={language.id} value={language.id}>
                                    {language.name}{language.code ? ` (${language.code})` : ""}
                                </option>
                            ))}
                        </select>
                        {formik.touched.languageId && formik.errors.languageId ? (
                            <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.languageId}</p>
                        ) : null}
                    </div>

                    <div className={formSectionClass}>
                        <label className={labelClass}>Kategoriya</label>
                        <select
                            id="primaryCategoryId"
                            name="primaryCategoryId"
                            value={formik.values.primaryCategoryId}
                            onChange={(event) => {
                                formik.handleChange(event);
                                formik.setFieldValue("subcategoryId", "");
                            }}
                            onBlur={formik.handleBlur}
                            className={selectClass}
                        >
                            <option value="">Kategoriya tanlang</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {formik.touched.primaryCategoryId && formik.errors.primaryCategoryId ? (
                            <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.primaryCategoryId}</p>
                        ) : null}
                    </div>

                    <div className={formSectionClass}>
                        <label className={labelClass}>Subkategoriya</label>
                        <select
                            id="subcategoryId"
                            name="subcategoryId"
                            value={formik.values.subcategoryId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={selectClass}
                        >
                            <option value="">Subkategoriya tanlang</option>
                            {filteredSubcategories.map((subcategory) => (
                                <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                            ))}
                        </select>
                        {formik.touched.subcategoryId && formik.errors.subcategoryId ? (
                            <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.subcategoryId}</p>
                        ) : null}
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-4">
                        <div className={formSectionClass}>
                            <label className={labelClass}>Qisqacha tavsif</label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Kurs haqida qisqa tavsif"
                                className="mt-2 min-h-[110px] rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-900"
                            />
                            {formik.touched.description && formik.errors.description ? (
                                <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.description}</p>
                            ) : null}
                        </div>

                        <div className={formSectionClass}>
                            <label className={labelClass}>To‘liq tavsif</label>
                            <Textarea
                                id="fullDescription"
                                name="fullDescription"
                                value={formik.values.fullDescription}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Kursning to‘liq izohi, natijasi va kimlar uchun ekanini yozing"
                                className="mt-2 min-h-[160px] rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-900"
                            />
                        </div>

                        <div className={formSectionClass}>
                            <label className={labelClass}>Trailer video</label>
                            <Input
                                id="trailerVideoUrl"
                                name="trailerVideoUrl"
                                value={formik.values.trailerVideoUrl}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="https://youtube.com/watch?v=..."
                                className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900"
                            />
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Faqat YouTube link qabul qilinadi. Video 1 daqiqadan oshmasligi kerak.</p>
                            {formik.touched.trailerVideoUrl && formik.errors.trailerVideoUrl ? (
                                <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.trailerVideoUrl}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={formSectionClass}>
                            <label className={labelClass}>Kurs rasmi</label>
                            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Course preview" className="h-48 w-full object-cover" />
                                ) : (
                                    <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
                                        <Camera className="h-7 w-7" />
                                        <p className="text-sm font-medium">Rasm ixtiyoriy</p>
                                    </div>
                                )}
                            </div>
                            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                                Rasm tanlash
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    className="hidden"
                                    onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
                                />
                            </label>
                        </div>

                        <div className={formSectionClass}>
                            <label className={labelClass}>Skill taglar</label>
                            <div className="mt-3 flex max-h-64 flex-wrap gap-2 overflow-y-auto">
                                {skillTags.map((skill) => {
                                    const checked = formik.values.skillTagIds.includes(skill.id);
                                    return (
                                        <label
                                            key={skill.id}
                                            className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-medium ${
                                                checked
                                                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-200"
                                                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={checked}
                                                onChange={() => {
                                                    const next = checked
                                                        ? formik.values.skillTagIds.filter((id) => id !== skill.id)
                                                        : [...formik.values.skillTagIds, skill.id];
                                                    formik.setFieldValue("skillTagIds", next);
                                                }}
                                            />
                                            {skill.name}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {formik.status ? (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-200">{formik.status}</p>
                ) : null}

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <Button type="button" variant="ghost" onClick={() => navigate("/courses")}>
                        Bekor qilish
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700">
                        {isSubmitting ? "Yaratilmoqda..." : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Kurs yaratish
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
