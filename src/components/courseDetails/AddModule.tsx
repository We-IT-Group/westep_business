import {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Plus} from "lucide-react";
import {useAddModule} from "../../api/module/useModule.ts";
import {Module} from "../../types/types.ts";
import Button from "../ui/button/Button.tsx";
import NewInput from "../form/NewInput.tsx";

function AddModule({courseId, modulesLength}: { courseId: string | undefined, modulesLength: number }) {
    const [open, setOpen] = useState(false);
    const {mutateAsync: addModule, isPending: isAdding} = useAddModule();

    const [initialValues] = useState<Pick<Module, "name" | "description" | "courseId" | "price">>({
        name: "",
        description: "",
        price: null,
        courseId: courseId || "",
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string().required("Nomini kiriting!"),
            price: Yup.string().required("Narxini kiriting!"),
        }),
        onSubmit: async () => {
            await addModule({...formik.values, orderIndex: modulesLength + 1});
            formik.resetForm();
            setOpen(false);
        },
    });

    return (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
                <Plus className="h-4 w-4"/>
                Module qo'shish
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    open ? "max-h-[420px] pt-4" : "max-h-0 pt-0"
                }`}
                style={{transformOrigin: "top"}}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                    }}
                >
                    <div className="grid grid-cols-1 gap-2">
                        <NewInput type="text" formik={formik} name="name" placeholder="Module nomi"/>
                        <NewInput type="text" formik={formik} name="price" placeholder="Module narxi"/>
                        <NewInput
                            type="text"
                            className="text-xs"
                            formik={formik}
                            name="description"
                            placeholder="Tavsif"
                        />
                    </div>

                    <div className="mt-3">
                        <Button
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] p-[10px] text-white"
                            type="submit"
                            variant="primary"
                            size="sm"
                            isPending={isAdding}
                            disabled={isAdding}
                        >
                            Saqlash
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddModule;
