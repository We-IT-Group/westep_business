import {useCallback, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import {
    Camera,
    CheckCircle2,
} from "lucide-react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Textarea} from "../ui/textarea";
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

interface CourseCreationFlowProps {
    open: boolean;
    onClose: () => void;
    onComplete?: (courseData: { id?: string; title: string; description: string }) => void;
}

type Step = 1 | 2 | 3;

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

export function CourseCreationFlow({open, onClose, onComplete}: CourseCreationFlowProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [imageError, setImageError] = useState("");

    const {mutateAsync: addCourse, isSuccess, isPending} = useAddCourse();
    const {mutateAsync: uploadFile, isPending: isUploadingFile} = useAddFile();
    const {data: categories = []} = useTaxonomyCategories();
    const {data: subcategories = []} = useTaxonomySubcategories();
    const {data: skillTags = []} = useTaxonomySkillTags();
    const {data: languages = []} = useCourseLanguages();

    const formSectionClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
    const labelClass = "text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";
    const selectClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white";

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
            primaryCategoryId: Yup.string().required("Kategoriya tanlang"),
            subcategoryId: Yup.string().required("Subkategoriya tanlang"),
            description: Yup.string().trim().required("Qisqa tavsif kiriting").max(500, "Qisqa tavsif juda uzun"),
            fullDescription: Yup.string().max(5000, "To‘liq tavsif juda uzun"),
            languageId: Yup.string().required("Kurs tilini tanlang"),
            trailerVideoUrl: Yup.string().test("youtube-url", "Faqat YouTube link qabul qilinadi", isYoutubeUrl),
        }),
        onSubmit: async () => {
            try {
                let attachmentId = formik.values.attachmentId || null;

                if (selectedImage) {
                    const formData = new FormData();
                    formData.append("file", selectedImage);

                    const uploadResponse = await uploadFile(formData);
                    attachmentId =
                        typeof uploadResponse === "string"
                            ? uploadResponse
                            : uploadResponse?.id || uploadResponse?.data?.id || null;
                }

                const createdCourse = await addCourse({
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

                onComplete?.({
                    id: createdCourse?.id,
                    title: formik.values.name,
                    description: formik.values.description,
                });
                showSuccessToast("Yangi kurs yaratildi");
                if (createdCourse?.id) {
                    navigate(`/courses/details/${createdCourse.id}`);
                }
            } catch (error) {
                formik.setStatus(error instanceof Error ? error.message : "Kurs yaratishda xatolik yuz berdi");
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

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedImage]);

    const handleNext = () => {
        if (step === 1) {
            formik.setTouched({
                name: true,
                primaryCategoryId: true,
                subcategoryId: true,
                description: true,
                languageId: true,
                trailerVideoUrl: true,
            });
            const hasRequiredFields =
                formik.values.name.trim()
                && formik.values.primaryCategoryId
                && formik.values.subcategoryId
                && formik.values.description.trim()
                && formik.values.languageId
                && isYoutubeUrl(formik.values.trailerVideoUrl);
            if (!hasRequiredFields) return;
            setStep(2);
            return;
        }

        if (step === 2) {
            setImageError("");
            setStep(3);
        }
    };

    const handleReset = useCallback(() => {
        setStep(1);
        setSelectedImage(null);
        setPreviewUrl("");
        setImageError("");
        formik.resetForm();
    }, [formik]);

    const handleClose = useCallback(() => {
        handleReset();
        onClose();
    }, [handleReset, onClose]);

    useEffect(() => {
        if (isSuccess) {
            handleClose();
        }
    }, [handleClose, isSuccess]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="h-[min(88vh,940px)] w-[min(95vw,1720px)] max-w-[min(95vw,1720px)] overflow-hidden border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-0 shadow-[0_32px_90px_rgba(15,23,42,0.16)]">
                <div className="h-full min-h-0 overflow-y-auto p-6 md:p-8 xl:p-12">
                    <div className="mx-auto flex h-full max-w-7xl flex-col">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                formik.handleSubmit();
                                return false;
                            }}
                            className="flex min-h-full flex-col"
                        >
                            <DialogHeader className="text-left">
                                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                                    3 bosqichdan {step}-bosqich
                                </div>
                                <DialogTitle className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                                    {step === 1
                                        ? "Kurs ma'lumotlarini kiriting"
                                        : step === 2
                                            ? "Kurs rasmini yuklang"
                                            : "Tekshirish va yaratish"}
                                </DialogTitle>
                                <p className="mt-3 max-w-4xl text-base font-medium leading-7 text-slate-500">
                                    {step === 1
                                        ? "Kurs nomi va tavsifini qulay formatda kiriting."
                                        : step === 2
                                            ? "Course card uchun yaxshi cover tanlang."
                                            : "Ma'lumotlarni tekshirib, kursni yarating."}
                                </p>
                            </DialogHeader>

                            <div className="min-h-[420px] flex-1">
                                    {step === 1 ? (
                                    <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
                                        <div className={formSectionClass}>
                                            <label className={labelClass}>
                                                Kurs nomi
                                            </label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Masalan: Java Backend"
                                                className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm font-medium"
                                                autoFocus
                                            />
                                            {formik.touched.name && formik.errors.name ? (
                                                <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.name}</p>
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

                                        <div className={`${formSectionClass} lg:col-span-2`}>
                                            <label className={labelClass}>
                                                Qisqacha tavsif
                                            </label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formik.values.description}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Kurs haqida qisqa tavsif"
                                                className="mt-2 min-h-[110px] rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6"
                                            />
                                            {formik.touched.description && formik.errors.description ? (
                                                <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.description}</p>
                                            ) : null}
                                        </div>

                                        <div className={`${formSectionClass} lg:col-span-2`}>
                                            <label className={labelClass}>To‘liq tavsif</label>
                                            <Textarea
                                                id="fullDescription"
                                                name="fullDescription"
                                                value={formik.values.fullDescription}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Kursning to‘liq izohi, natijasi va kimlar uchun ekanini yozing"
                                                className="mt-2 min-h-[150px] rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6"
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
                                                className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">Faqat YouTube link qabul qilinadi. Video 1 daqiqadan oshmasligi kerak.</p>
                                            {formik.touched.trailerVideoUrl && formik.errors.trailerVideoUrl ? (
                                                <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.trailerVideoUrl}</p>
                                            ) : null}
                                        </div>

                                        <div className={formSectionClass}>
                                            <label className={labelClass}>Skill taglar</label>
                                            <div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                                                {skillTags.map((skill) => {
                                                    const checked = formik.values.skillTagIds.includes(skill.id);
                                                    return (
                                                        <label
                                                            key={skill.id}
                                                            className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-medium ${
                                                                checked
                                                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                                                    : "border-slate-200 bg-slate-50 text-slate-600"
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
                                ) : null}

                                {step === 2 ? (
                                    <div className="mx-auto max-w-5xl space-y-7">
                                        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50/80">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Course preview" className="h-80 w-full object-cover"/>
                                            ) : (
                                                <div className="flex h-80 flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]">
                                                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-white text-slate-400 shadow-sm">
                                                        <Camera className="h-7 w-7"/>
                                                    </div>
                                                <div className="text-center">
                                                        <p className="text-lg font-black text-slate-950">Kurs rasmini yuklang</p>
                                                        <p className="mt-2 text-sm font-medium text-slate-500">Ixtiyoriy. PNG, JPG yoki WebP format tavsiya etiladi.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <label className="flex cursor-pointer items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/80 px-5 py-5 transition hover:bg-slate-100/80">
                                            <div>
                                                <p className="text-base font-black text-slate-950">Kurs rasmi</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-500">Catalog preview uchun ishlatiladi.</p>
                                            </div>
                                            <div className="rounded-xl bg-slate-950 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                                                Tanlash
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                                className="hidden"
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0] || null;
                                                    setSelectedImage(file);
                                                    if (file) setImageError("");
                                                }}
                                            />
                                        </label>
                                        {imageError ? <p className="text-sm font-semibold text-red-500">{imageError}</p> : null}
                                    </div>
                                ) : null}

                                {step === 3 ? (
                                    <div className="space-y-6">
                                        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.9),rgba(255,255,255,0.98))] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                                        Kurs xulosasi
                                                    </div>
                                                    <h4 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{formik.values.name}</h4>
                                                    <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                                                        {formik.values.description || "Hali tavsif kiritilmagan."}
                                                    </p>
                                                    {formik.status ? (
                                                        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{formik.status}</p>
                                                    ) : null}
                                                </div>
                                                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                                                    <CheckCircle2 className="h-5 w-5"/>
                                                </div>
                                            </div>

                                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                                <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Builder</p>
                                                    <p className="mt-2 text-sm font-black text-slate-950">Modullar uchun tayyor</p>
                                                </div>
                                                <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Rasm</p>
                                                    <p className="mt-2 text-sm font-black text-slate-950">{selectedImage ? "Biriktirilgan" : "Ixtiyoriy"}</p>
                                                </div>
                                                <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Holat</p>
                                                    <p className="mt-2 text-sm font-black text-slate-950">Qoralama kurs</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={step === 1 ? handleClose : () => setStep((current) => (current - 1) as Step)}
                                    className="rounded-2xl px-4 text-xs font-black uppercase tracking-[0.2em]"
                                >
                                    {step === 1 ? "Bekor qilish" : "Orqaga"}
                                </Button>

                                <div className="flex gap-2">
                                    {step < 3 ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={(step === 1 && !formik.values.name.trim()) || isPending}
                                            className="h-11 rounded-2xl bg-blue-600 px-5 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-blue-700"
                                        >
                                            Davom etish
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isPending || isUploadingFile}
                                            className="h-11 rounded-2xl bg-emerald-600 px-5 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-700"
                                        >
                                            {isPending || isUploadingFile ? "Yaratilmoqda..." : "Kurs yaratish"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
