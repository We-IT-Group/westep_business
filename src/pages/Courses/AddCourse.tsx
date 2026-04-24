import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import * as Yup from "yup";
import {useFormik} from "formik";
import {
    BookOpen,
    Camera,
    FolderKanban,
    ImageIcon,
    LoaderCircle,
    Sparkles,
    WandSparkles,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {Button} from "../../components/ui/button.tsx";
import {Input} from "../../components/ui/input.tsx";
import {Textarea} from "../../components/ui/textarea.tsx";
import {useAddCourse, useGetCourseById, useUpdateCourse} from "../../api/courses/useCourse.ts";
import {useAddFile} from "../../api/file/useFile.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import {useTeacherProfileMe} from "../../api/teacherProfile/useTeacherProfile.ts";
import ModuleList from "../../components/courses/ModuleList.tsx";
import {baseUrlImage} from "../../api/apiClient.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

type CourseFormValues = {
    name: string;
    description: string;
};

export default function AddCourse() {
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();

    const {data: user, isLoading: isUserLoading} = useUser();
    const {data: teacherProfile, isLoading: isTeacherProfileLoading} = useTeacherProfileMe((user?.roleName || "").toUpperCase().includes("TEACHER"));
    const {data: course, isLoading: isCourseLoading} = useGetCourseById(id);
    const {mutateAsync: addCourse, isPending: isAdding} = useAddCourse();
    const {mutateAsync: updateCourse, isPending: isUpdating} = useUpdateCourse();
    const {mutateAsync: uploadFile, isPending: isUploadingFile} = useAddFile();

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const isEditing = Boolean(id);
    const resolvedBusinessId = user?.businessId || teacherProfile?.businessId || "";
    const isLoading = isUserLoading || isTeacherProfileLoading || (isEditing && isCourseLoading);
    const isSubmitting = isAdding || isUpdating || isUploadingFile;

    const formik = useFormik<CourseFormValues>({
        initialValues: {
            name: "",
            description: "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Kurs nomini kiriting"),
            description: Yup.string().max(2000, "Tavsif juda uzun"),
        }),
        onSubmit: async (values) => {
            try {
                let attachmentId = course?.attachmentId || null;

                if (selectedImage) {
                    const formData = new FormData();
                    formData.append("file", selectedImage);
                    const uploadResponse = await uploadFile(formData);
                    attachmentId =
                        typeof uploadResponse === "string"
                            ? uploadResponse
                            : uploadResponse?.id || uploadResponse?.data?.id || null;
                }

                if (isEditing && id) {
                    await updateCourse({
                        id,
                        ...(resolvedBusinessId ? {businessId: resolvedBusinessId} : {}),
                        name: values.name.trim(),
                        description: values.description.trim(),
                        attachmentId,
                    });
                } else {
                    const createdCourse = await addCourse({
                        ...(resolvedBusinessId ? {businessId: resolvedBusinessId} : {}),
                        name: values.name.trim(),
                        description: values.description.trim(),
                        attachmentId,
                    });
                    showSuccessToast("Yangi kurs yaratildi");
                    navigate(createdCourse?.id ? `/courses/details/${createdCourse.id}` : "/courses");
                }
            } catch (error) {
                showErrorToast(error, "Kursni saqlab bo'lmadi");
            }
        },
    });
    const {setValues} = formik;

    useEffect(() => {
        if (!course) return;

        setValues({
            name: course.name || "",
            description: course.description || "",
        });
    }, [course, setValues]);

    useEffect(() => {
        if (!selectedImage) return;

        const objectUrl = URL.createObjectURL(selectedImage);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedImage]);

    const currentImageUrl = useMemo(() => {
        if (previewUrl) return previewUrl;
        if (!course?.attachmentUrl) return "";
        return course.attachmentUrl.startsWith("http")
            ? course.attachmentUrl
            : `${baseUrlImage.replace(/\/api$/, "")}${course.attachmentUrl}`;
    }, [course?.attachmentUrl, previewUrl]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setSelectedImage(null);
            setPreviewUrl("");
            return;
        }

        setSelectedImage(file);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <LoaderCircle className="h-10 w-10 animate-spin text-sky-600"/>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Kurs sozlamasi</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Kurs oynasi yuklanmoqda</h2>
                    </div>
                </div>
            </div>
        );
    }

    const summaryCards = [
        {
            label: "Sozlash rejimi",
            value: isEditing ? "Tahrirlash" : "Yaratish",
            hint: isEditing ? "Mavjud kursni yaxshilang" : "Yangi kurs qobig‘ini ishga tushiring",
            icon: WandSparkles,
            tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
        },
        {
            label: "Modullar",
            value: isEditing ? "Ulangan" : "Keyingi qadam",
            hint: isEditing ? "Asosiy ma'lumotlardan keyin struktura boshqariladi" : "Birinchi saqlashdan keyin modullar ochiladi",
            icon: FolderKanban,
            tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
        },
        {
            label: "Rasm",
            value: currentImageUrl || selectedImage ? "Tayyor" : "Kutilmoqda",
            hint: "Kurs kartasining vizual ko‘rinishi",
            icon: ImageIcon,
            tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
        },
    ];

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title={isEditing ? "Kursni tahrirlash" : "Kurs yaratish"}
                description={isEditing ? "Kurs sozlamasi va strukturasini yangilang" : "Yangi kurs oynasini ishga tushiring"}
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.9))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                Kurs sozlamasi
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                {isEditing ? "Mavjud kurs" : "Yangi boshlanish"}
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                            {isEditing
                                ? "Kurs pozitsiyasi, rasmi va strukturasini bitta kuchli sahifada yangilang"
                                : "Builder oynasiga o‘tishdan oldin yangi kurs qobig‘ini yarating"}
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                            Bu page eski admin form emas, endi course identity va setup oqimini bitta kuchli control surface ichida beradi.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {summaryCards.map((card) => (
                                <div key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${card.tone}`}>
                                        <card.icon className="h-5 w-5"/>
                                    </div>
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{card.label}</p>
                                    <div className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">{card.value}</div>
                                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{card.hint}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(255,255,255,0.98))] p-5 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:text-slate-100 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-500/70 dark:text-slate-500">Builder eslatmasi</p>
                                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Keyingi qadamlar</h2>
                            </div>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-200"/>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-sm font-black text-slate-900 dark:text-slate-100">1. Ma'lumotni kiriting</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">Name, positioning va cover course card ko‘rinishini belgilaydi.</p>
                            </div>
                            <div className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-sm font-black text-slate-900 dark:text-slate-100">2. Kursni saqlang</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">Saqlangach, course business catalog ichida paydo bo‘ladi.</p>
                            </div>
                            <div className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-sm font-black text-slate-900 dark:text-slate-100">3. Modullarni shakllantiring</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">Edit mode’da modul va lesson builder darhol boshqariladi.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <form onSubmit={formik.handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
                <div className="space-y-6">
                    <section className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Asosiy ma'lumot</p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Kurs pozitsiyasi</h2>
                            </div>
                            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                                <BookOpen className="h-5 w-5"/>
                            </div>
                        </div>

                        <div className="mt-6 space-y-5">
                            <div>
                                <label className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                                    Kurs nomi
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Masalan: Performance Marketing from Zero"
                                    className="mt-2 h-14 rounded-2xl border-slate-200 bg-slate-50/80 px-4 text-base font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                                />
                                {formik.touched.name && formik.errors.name ? (
                                    <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.name}</p>
                                ) : null}
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                                    Qisqacha tavsif
                                </label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Kurs kim uchun, qanday natija beradi va qanday usulda o‘qitiladi?"
                                    className="mt-2 min-h-[180px] rounded-[24px] border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-7 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 rounded-2xl bg-slate-950 px-5 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {isEditing ? "O‘zgarishlarni saqlash" : "Kurs yaratish"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/courses")}
                                className="h-12 rounded-2xl px-5 text-xs font-black uppercase tracking-[0.22em]"
                            >
                                Kurslarga qaytish
                            </Button>
                        </div>
                    </section>

                    {isEditing && id ? (
                        <section className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                            <ModuleList courseId={id}/>
                        </section>
                    ) : null}
                </div>

                <aside className="space-y-6">
                    <section className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Vizual ko‘rinish</p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Kurs rasmi</h2>
                            </div>
                            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                <ImageIcon className="h-5 w-5"/>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                            {currentImageUrl ? (
                                <img src={currentImageUrl} alt={formik.values.name || "Kurs rasmi"} className="h-72 w-full object-cover"/>
                            ) : (
                                <div className="flex h-72 flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-400 shadow-sm dark:bg-slate-900 dark:text-slate-500 dark:shadow-none">
                                        <Camera className="h-6 w-6"/>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-base font-black text-slate-950 dark:text-slate-100">Hali kurs rasmi yo‘q</p>
                                        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Kursga kuchli birinchi taassurot beradigan rasm yuklang.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <label className="mt-5 flex cursor-pointer items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 transition hover:bg-slate-100/80 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
                            <div>
                                <p className="text-sm font-black text-slate-950 dark:text-slate-100">Yangi rasm tanlash</p>
                                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">PNG, JPG yoki WebP formatda yuklang.</p>
                            </div>
                            <div className="rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white dark:bg-blue-600">
                                Tanlash
                            </div>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    </section>
                </aside>
            </form>
        </div>
    );
}
