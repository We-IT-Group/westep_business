import {useState} from 'react';
import {AddCircle} from "../../icons";
import {useAddModule} from "../../api/module/useModule.ts";
import {Module} from "../../types/types.ts";
import {useFormik} from "formik";
import * as Yup from "yup";
import Button from "../ui/button/Button.tsx";
import NewInput from "../form/NewInput.tsx";

function AddModule({courseId, modulesLength}: { courseId: string | undefined, modulesLength:number }) {

    const [open, setOpen] = useState(false);


    const {mutateAsync: addModule, isPending: isAdding} = useAddModule();

    const [initialValues] = useState<Pick<Module, "name" | "description" | "courseId" |"price">>({
        name: "",
        description: "",
        price:null,
        courseId: courseId || "",
    });


    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .required("Nomini kiriting!"),
            price: Yup.string()
                .required("Narxini kiriting!"),
        }),
        onSubmit: async () => {
            await addModule({...formik.values,orderIndex:modulesLength+1});
            formik.resetForm();
            setOpen(false);
        },
    });



    return (
        <div className={'border border-blue-200 bg-white rounded-[20px] py-[20px] px-[16px]'}>
            <button
                onClick={() => {
                    setOpen(!open)
                }}
                className={'flex items-center justify-center gap-2 bg-blue-600 text-md text-white w-full p-[8px] rounded-full'}>
                Module qo'shish <AddCircle width={24} height={24}/>
            </button>
            <div
                className={`
      transition-all duration-300 ease-out overflow-hidden
      ${
                    open ? "max-h-[300px] pt-4" : "max-h-0 pt-0"
                }
    `}
                style={{transformOrigin: "top"}}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}
                >
                    <div className="grid grid-cols-1 gap-1">
                        <NewInput type="text" formik={formik} name="name" placeholder="Module nomi"/>
                        <NewInput type="text" formik={formik} name="price" placeholder="Module narxi"/>
                        <NewInput type="text" className={'text-xs'} formik={formik} name="description"
                                  placeholder="Tavsif"/>
                    </div>

                    <div className="mt-3 flex gap-6 justify-end">
                        <Button
                            className={'flex items-center justify-center gap-2 bg-blue-600 text-md text-white w-full p-[8px] rounded-full'}
                            type="submit"
                            variant="primary"
                            size={'sm'}
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