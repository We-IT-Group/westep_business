import {useFormik} from "formik";
import * as Yup from "yup";
import {Module} from "../../types/types.ts";
import {useAddModule, useUpdateModule} from "../../api/module/useModule.ts";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import Button from "../ui/button/Button.tsx";

interface ModuleFormProps {
    courseId: string;
    initialData?: Partial<Module> | null;
    suggestedOrderIndex?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

type ModuleFormValues = {
    name: string;
    price: number;
};

export default function ModuleForm({courseId, initialData, suggestedOrderIndex = 0, onSuccess, onCancel}: ModuleFormProps) {
    const {mutateAsync: addModule, isPending: isAdding} = useAddModule();
    const {mutateAsync: updateModule, isPending: isUpdating} = useUpdateModule();

    const isEditing = Boolean(initialData?.id);

    const formik = useFormik<ModuleFormValues>({
        initialValues: {
            name: initialData?.name || "",
            price: initialData?.price || 0,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().trim().required("Modul nomini kiriting"),
            price: Yup.number().min(0, "Narx 0 dan kichik bo'lmasligi kerak").required("Narxni kiriting"),
        }),
        onSubmit: async (values) => {
            const payload = {
                name: values.name.trim(),
                description: initialData?.description || "",
                price: Number(values.price) || 0,
                courseId,
                orderIndex: initialData?.orderIndex ?? suggestedOrderIndex,
            };

            if (isEditing && initialData?.id) {
                await updateModule({
                    ...payload,
                    id: initialData.id,
                } as Module);
            } else {
                await addModule(payload as Omit<Module, "id">);
            }
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
                    <Label htmlFor="name">Modul nomi</Label>
                    <Input
                        type="text"
                        formik={formik}
                        name="name"
                        placeholder="Masalan: Sotuv asoslari"
                        className="rounded-2xl border-gray-300 bg-white dark:bg-slate-950"
                    />
                </div>

                <Input
                    type="number"
                    formik={formik}
                    name="price"
                    placeholder="0"
                    label="Narx (UZS)"
                    className="rounded-2xl border-gray-300 bg-white dark:bg-slate-950"
                />
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
                    isPending={isAdding || isUpdating}
                    disabled={isAdding || isUpdating}
                    className="h-11 rounded-xl px-5 text-sm font-medium"
                >
                    {isEditing ? "Saqlash" : "Yaratish"}
                </Button>
            </div>
        </form>
    );
}
