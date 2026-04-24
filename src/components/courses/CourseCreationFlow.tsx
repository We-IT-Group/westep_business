import {useCallback, useEffect, useState} from "react";
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
import {useUser} from "../../api/auth/useAuth.ts";
import {useAddFile} from "../../api/file/useFile.ts";
import {Course} from "../../types/types.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";
import {useTeacherProfileMe} from "../../api/teacherProfile/useTeacherProfile.ts";

interface CourseCreationFlowProps {
    open: boolean;
    onClose: () => void;
    onComplete?: (courseData: { id?: string; title: string; description: string }) => void;
}

type Step = 1 | 2 | 3;

export function CourseCreationFlow({open, onClose, onComplete}: CourseCreationFlowProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [imageError, setImageError] = useState("");

    const {mutateAsync: addCourse, isSuccess, isPending} = useAddCourse();
    const {mutateAsync: uploadFile, isPending: isUploadingFile} = useAddFile();
    const {data: user} = useUser();
    const {data: teacherProfile} = useTeacherProfileMe((user?.roleName || "").toUpperCase().includes("TEACHER"));
    const resolvedBusinessId = user?.businessId || teacherProfile?.businessId || "";

    const formik = useFormik<Pick<Course, "name" | "description" | "attachmentId">>({
        initialValues: {
            name: "",
            description: "",
            attachmentId: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Kurs nomini kiriting"),
            description: Yup.string().max(2000, "Tavsif juda uzun"),
        }),
        onSubmit: async () => {
            if (!selectedImage) {
                setStep(2);
                setImageError("Kurs rasmi tanlanishi kerak.");
                return;
            }

            try {
                const formData = new FormData();
                formData.append("file", selectedImage);

                const uploadResponse = await uploadFile(formData);
                const attachmentId =
                    typeof uploadResponse === "string"
                        ? uploadResponse
                        : uploadResponse?.id || uploadResponse?.data?.id;

                if (!attachmentId) {
                    showErrorToast("Rasm ID qaytmadi.", "Kurs yaratib bo'lmadi");
                    return;
                }

                const createdCourse = await addCourse({
                    ...formik.values,
                    ...(resolvedBusinessId ? {businessId: resolvedBusinessId} : {}),
                    attachmentId,
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
                showErrorToast(error, "Kurs yaratib bo'lmadi");
            }
        },
    });

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
            formik.setTouched({name: true});
            if (!formik.values.name.trim()) return;
            setStep(2);
            return;
        }

        if (step === 2) {
            if (!selectedImage) {
                setImageError("Kurs rasmi tanlanishi kerak.");
                return;
            }

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
                                    <div className="mx-auto max-w-5xl space-y-7">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                                                Kurs nomi
                                            </label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Masalan: Performance Marketing from Zero"
                                                className="mt-2 h-16 rounded-[22px] border-slate-200 bg-slate-50/80 px-5 text-lg font-semibold"
                                                autoFocus
                                            />
                                            {formik.touched.name && formik.errors.name ? (
                                                <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.name}</p>
                                            ) : null}
                                        </div>

                                        <div>
                                            <label className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                                                Qisqacha tavsif
                                            </label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formik.values.description}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Kurs kim uchun, qanday natija beradi va qanday formatda o‘tiladi?"
                                                className="mt-2 min-h-[240px] rounded-[26px] border-slate-200 bg-slate-50/80 px-6 py-5 text-base leading-8"
                                            />
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
                                                        <p className="mt-2 text-sm font-medium text-slate-500">PNG, JPG yoki WebP format tavsiya etiladi.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <label className="flex cursor-pointer items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/80 px-5 py-5 transition hover:bg-slate-100/80">
                                            <div>
                                                <p className="text-base font-black text-slate-950">Kurs rasmi</p>
                                                <p className="mt-1 text-sm font-semibold text-slate-500">Course catalog preview uchun ishlatiladi.</p>
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
                                                    <p className="mt-2 text-sm font-black text-slate-950">{selectedImage ? "Biriktirilgan" : "Yo‘q"}</p>
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
