import {useFormik} from "formik";
import * as Yup from "yup";
import {Lesson} from "../../types/types.ts";
import {useAddLesson} from "../../api/lessons/useLesson.ts";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import Button from "../ui/button/Button.tsx";

interface LessonCreateFormProps {
    courseId: string;
    moduleId: string;
    suggestedOrderIndex: number;
    onSuccess: () => void;
    onCancel: () => void;
}

type LessonCreateFormValues = {
    name: string;
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
        },
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Lesson nomini kiriting"),
        }),
        onSubmit: async (values) => {
            await addLesson({
                body: {
                    name: values.name.trim(),
                    description: "",
                    moduleId,
                    orderIndex: suggestedOrderIndex,
                    estimatedDuration: 0,
                    videoUrl: "",
                } as Omit<Lesson, "id" | "createdAt">,
                courseId,
            });
            onSuccess();
        },
    });

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
