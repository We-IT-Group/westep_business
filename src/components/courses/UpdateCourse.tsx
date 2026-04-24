import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {
    CheckCircle2,
    ImageIcon,
    LoaderCircle,
    Save,
} from "lucide-react";
import {Course} from "../../types/types.ts";
import {useUpdateCourse} from "../../api/courses/useCourse.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import {useTeacherProfileMe} from "../../api/teacherProfile/useTeacherProfile.ts";
import {useAddFile} from "../../api/file/useFile.ts";
import {baseUrlImage} from "../../api/apiClient.ts";
import {Button} from "../ui/button.tsx";
import {Input} from "../ui/input.tsx";
import {Textarea} from "../ui/textarea.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog.tsx";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

type UpdateCourseProps = {
    data: Course;
    open: boolean;
    onClose: () => void;
};

type CourseFormValues = {
    name: string;
    description: string;
};

function UpdateCourse({data, open, onClose}: UpdateCourseProps) {
    const {data: user} = useUser();
    const {data: teacherProfile} = useTeacherProfileMe((user?.roleName || "").toUpperCase().includes("TEACHER"));
    const {mutateAsync: updateCourse, isSuccess, isPending} = useUpdateCourse();
    const {mutateAsync: uploadFile, isPending: isUploadingFile} = useAddFile();
    const resolvedBusinessId = user?.businessId || teacherProfile?.businessId || "";

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const formik = useFormik<CourseFormValues>({
        initialValues: {
            name: data.name || "",
            description: data.description || "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Kurs nomini kiriting"),
            description: Yup.string().max(2000, "Tavsif juda uzun"),
        }),
        onSubmit: async (values) => {
            try {
                let attachmentId = data.attachmentId || null;

                if (selectedImage) {
                    const formData = new FormData();
                    formData.append("file", selectedImage);
                    const uploadResponse = await uploadFile(formData);
                    attachmentId =
                        typeof uploadResponse === "string"
                            ? uploadResponse
                            : uploadResponse?.id || uploadResponse?.data?.id || null;
                }

                await updateCourse({
                    id: data.id,
                    ...(resolvedBusinessId ? {businessId: resolvedBusinessId} : {}),
                    name: values.name.trim(),
                    description: values.description.trim(),
                    attachmentId,
                });
            } catch (error) {
                showErrorToast(error, "Kursni tahrirlab bo'lmadi");
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

    useEffect(() => {
        if (!isSuccess) return;
        showSuccessToast("Kurs ma'lumotlari yangilandi");
        onClose();
    }, [isSuccess, onClose]);

    useEffect(() => {
        if (!open) {
            setSelectedImage(null);
            setPreviewUrl("");
            formik.resetForm({
                values: {
                    name: data.name || "",
                    description: data.description || "",
                },
            });
        }
    }, [data.description, data.name, formik, open]);

    const currentImageUrl = useMemo(() => {
        if (previewUrl) return previewUrl;
        if (!data.attachmentUrl) return "";
        return data.attachmentUrl.startsWith("http")
            ? data.attachmentUrl
            : `${baseUrlImage.replace(/\/api$/, "")}${data.attachmentUrl}`;
    }, [data.attachmentUrl, previewUrl]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setSelectedImage(null);
            setPreviewUrl("");
            return;
        }

        setSelectedImage(file);
    };

    const isSubmitting = isPending || isUploadingFile;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="h-[min(88vh,940px)] w-[min(95vw,1760px)] max-w-[min(95vw,1760px)] overflow-hidden border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-0 shadow-[0_32px_90px_rgba(15,23,42,0.16)]">
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
                                    Kursni tahrirlash
                                </div>
                                <DialogTitle className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                                    Kurs ma'lumotlarini yangilash
                                </DialogTitle>
                                <p className="mt-3 max-w-4xl text-base font-medium leading-7 text-slate-500">
                                    Kurs nomi, tavsifi va cover rasmini qulay formatda yangilang.
                                </p>
                            </DialogHeader>

                            <div className="min-h-[460px] flex-1 pt-6">
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
                                            Tavsif
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
                                        {formik.touched.description && formik.errors.description ? (
                                            <p className="mt-2 text-sm font-semibold text-red-500">{formik.errors.description}</p>
                                        ) : null}
                                    </div>

                                    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50/80">
                                        {currentImageUrl ? (
                                            <img src={currentImageUrl} alt="Course preview" className="h-80 w-full object-cover" />
                                        ) : (
                                            <div className="flex h-80 flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]">
                                                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-white text-slate-400 shadow-sm">
                                                    <ImageIcon className="h-7 w-7" />
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
                                            <p className="text-base font-black text-slate-950">Rasmni almashtirish</p>
                                            <p className="mt-1 text-sm font-semibold text-slate-500">Yangisi yuklansa eski rasm o‘rnini bosadi.</p>
                                        </div>
                                        <div className="rounded-xl bg-blue-600 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                                            Tanlash
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>

                                    <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.9),rgba(255,255,255,0.98))] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                                    Kurs xulosasi
                                                </div>
                                                <h4 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{formik.values.name || "Kurs nomi"}</h4>
                                                <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                                                    {formik.values.description || "Hali tavsif kiritilmagan."}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                                            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Holat</p>
                                                <p className="mt-2 text-sm font-black text-slate-950">Saqlashga tayyor</p>
                                            </div>
                                            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Rasm</p>
                                                <p className="mt-2 text-sm font-black text-slate-950">{selectedImage ? "Yangilangan" : "Joriy"}</p>
                                            </div>
                                            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Rejim</p>
                                                <p className="mt-2 text-sm font-black text-slate-950">Tahrirlash oynasi</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-2xl px-4 text-xs font-black uppercase tracking-[0.2em]"
                                >
                                    Bekor qilish
                                </Button>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-11 rounded-2xl bg-blue-600 px-5 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-blue-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Saqlanmoqda...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                O‘zgarishlarni saqlash
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default UpdateCourse;
