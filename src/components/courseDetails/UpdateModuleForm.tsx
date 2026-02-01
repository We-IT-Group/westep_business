import {useEffect, useState} from 'react';
import {useUpdateModule} from "../../api/module/useModule.ts";
import {Module} from "../../types/types.ts";
import {useFormik} from "formik";
import * as Yup from "yup";
import Button from "../ui/button/Button.tsx";
import NewInput from "../form/NewInput.tsx";

interface propTypes {
    courseId: string;
    open: boolean;
    setOpen: (value: boolean) => void;
    module: Module;
}

function UpdateModuleForm({courseId, open, setOpen, module}: propTypes) {


    const {mutateAsync: updateModule, isPending: isAdding} = useUpdateModule();

    const [initialValues, setInitialValues] = useState<Pick<Module, "name" | "description" | "courseId" | "orderIndex" | "price">>({
        name: "",
        description: "",
        courseId: courseId,
        price: 0,
        orderIndex: 0
    });


    useEffect(() => {
        if (module) {
            setInitialValues({
                name: module.name,
                description: module.description,
                courseId: module.courseId,
                price: module.price,
                orderIndex: module.orderIndex
            })
        }
    }, [module])


    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .required("Nomini kiriting!"),
            price: Yup.string()
                .required("Narxini kiriting!"),
            orderIndex: Yup.number().required("Module navbatini tanlang!"),
        }),
        onSubmit: async () => {
            await updateModule({...formik.values, id: module.id});
            formik.resetForm();
            setOpen(false);
        },
    });


    return (
        <div onClick={(e) => {
            e.stopPropagation()
        }}
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
                        Tahrirlash
                    </Button>
                </div>
            </form>
        </div>);
}

export default UpdateModuleForm;