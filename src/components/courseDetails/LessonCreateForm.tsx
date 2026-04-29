import {useFormik} from "formik";
import * as Yup from "yup";
import {Lesson, LessonType} from "../../types/types.ts";
import {useAddLesson} from "../../api/lessons/useLesson.ts";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import Button from "../ui/button/Button.tsx";
import {Switch} from "../ui/switch.tsx";

interface LessonCreateFormProps {
    courseId: string;
    moduleId: string;
    suggestedOrderIndex: number;
    onSuccess: () => void;
    onCancel: () => void;
}

type LessonCreateFormValues = {
    name: string;
    description: string;
    type: LessonType;
    estimatedDuration: number;
    watchCompletionPercent: number;
    videoUrl: string;
    active: boolean;
};

export default function LessonCreateForm({
    courseId,
    moduleId,
    suggestedOrderIndex,
    onSuccess,
    onCancel,
}: LessonCreateFormProps) {
    const {mutateAsync: addLesson, isPending} = useAddLesson(courseId);

    const formik = useFormik<LessonCreateFormValues>({
        initialValues: {
            name: "Lesson nomi",
            description: "",
            type: "LESSON",
            estimatedDuration: 0,
            watchCompletionPercent: 80,
            videoUrl: "",
            active: false,
        },
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Lesson nomini kiriting"),
            type: Yup.mixed<LessonType>().oneOf(["LESSON", "PRACTICE"]).required("Type tanlang"),
            watchCompletionPercent: Yup.number().min(0, "0 dan kichik bo'lmasin").max(100, "100 dan oshmasin"),
        }),
        onSubmit: async (values) => {
            try {
                const isLesson = values.type === "LESSON";
                const body: Omit<Lesson, "id" | "createdAt"> = {
                    name: values.name.trim(),
                    description: values.description.trim(),
                    moduleId,
                    type: values.type,
                    orderIndex: suggestedOrderIndex,
                    estimatedDuration: isLesson ? Number(values.estimatedDuration) || 0 : null,
                    active: values.active,
                };

                if (isLesson) {
                    body.watchCompletionPercent = Number(values.watchCompletionPercent) || 0;
                    body.videoUrl = values.videoUrl.trim();
                }

                await addLesson({
                    body,
                    courseId,
                });
                onSuccess();
            } catch (error) {
                formik.setStatus(error instanceof Error ? error.message : "Lesson yaratilmadi");
            }
        },
    });

    const isLessonType = formik.values.type === "LESSON";

    return (
        <form
            onSubmit={formik.handleSubmit}
            className="space-y-4"
        >
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div>
                    <Label htmlFor="name">Lesson nomi</Label>
                    <Input
                        type="text"
                        formik={formik}
                        name="name"
                        placeholder="Masalan: Kirish darsi"
                        className="rounded-2xl border-gray-300 bg-white dark:bg-slate-950"
                    />
                </div>

                <div>
                    <Label htmlFor="description">Izoh</Label>
                    <textarea
                        id="description"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Qisqacha ta'rif"
                        className="mt-1 min-h-[80px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:bg-slate-950"
                    />
                </div>

                <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                        id="type"
                        name="type"
                        value={formik.values.type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="mt-1 h-11 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm outline-none focus:border-blue-500 dark:bg-slate-950"
                    >
                        <option value="LESSON">Dars</option>
                        <option value="PRACTICE">Mashq</option>
                    </select>
                </div>

                <Input
                    type="number"
                    formik={formik}
                    name="estimatedDuration"
                    placeholder="30"
                    label="Davomiylik (minut)"
                    className="rounded-2xl border-gray-300 bg-white dark:bg-slate-950"
                />

                {isLessonType ? (
                    <>
                        <Input
                            type="number"
                            formik={formik}
                            name="watchCompletionPercent"
                            placeholder="80"
                            label="Ko‘rish completion (%)"
                            className="rounded-2xl border-gray-300 bg-white dark:bg-slate-950"
                        />
                        <Input
                            type="text"
                            formik={formik}
                            name="videoUrl"
                            placeholder="https://youtube.com/watch?v=..."
                            label="Video URL"
                            className="rounded-2xl border-gray-300 bg-white dark:bg-slate-950"
                        />
                    </>
                ) : null}

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Studentlarga ko‘rinishi</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tayyor bo‘lmasa switch o‘chiq qolsin.</p>
                    </div>
                    <Switch
                        checked={formik.values.active}
                        onCheckedChange={(checked) => formik.setFieldValue("active", checked)}
                    />
                </div>

                {formik.status ? <p className="text-sm font-semibold text-red-500">{formik.status}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="h-11 rounded-xl px-5 text-sm font-medium"
                >
                    Bekor qilish
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    isPending={isPending}
                    disabled={isPending}
                    className="h-11 rounded-xl px-5 text-sm font-medium"
                >
                    Yaratish
                </Button>
            </div>
        </form>
    );
}
