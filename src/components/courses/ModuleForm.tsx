import { useFormik } from "formik";
import * as Yup from "yup";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import Button from "../ui/button/Button.tsx";
import { Module } from "../../types/types.ts";
import { useAddModule, useUpdateModule } from "../../api/module/useModule.ts";

interface ModuleFormProps {
    courseId: string;
    initialData?: Partial<Module> | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ModuleForm({ courseId, initialData, onSuccess, onCancel }: ModuleFormProps) {
    const { mutateAsync: addModule, isPending: isAdding } = useAddModule();
    const { mutateAsync: updateModule, isPending: isUpdating } = useUpdateModule();

    const formik = useFormik({
        initialValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            price: initialData?.price || 0,
            orderIndex: initialData?.orderIndex || 0,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required("Modul nomini kiriting!"),
            price: Yup.number().required("Narxni kiriting!").min(0, "Narx 0 dan kam bo'lmasligi kerak"),
        }),
        onSubmit: async (values) => {
            if (initialData?.id) {
                await updateModule({
                    ...values,
                    id: initialData.id,
                    courseId,
                    orderIndex: values.orderIndex || 0,
                } as Module);
            } else {
                await addModule({
                    ...values,
                    courseId,
                    orderIndex: values.orderIndex || 0,
                } as Omit<Module, "id">);
            }
            onSuccess();
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                {initialData?.id ? "Modulni tahrirlash" : "Yangi modul qo'shish"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Modul Nomi</Label>
                    <Input type="text" formik={formik as any} name="name" placeholder="Masalan: React Asoslari" />
                </div>
                <div>
                    <Label htmlFor="price">Modul Narxi (UZS)</Label>
                    <Input type="number" formik={formik as any} name="price" placeholder="Masalan: 500000" />
                </div>
            </div>
            <div>
                <Label htmlFor="description">Izohi</Label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full rounded-[20px] border border-gray-300 bg-transparent px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
                    placeholder="Modul haqida batafsil ma'lumot kiriting..."
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.errors.description && formik.touched.description && (
                    <p className="mt-1.5 text-xs text-error-500">{formik.errors.description}</p>
                )}
            </div>
            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Bekor qilish
                </Button>
                <Button type="submit" variant="primary" isPending={isAdding || isUpdating}>
                    Saqlash
                </Button>
            </div>
        </form>
    );
}
