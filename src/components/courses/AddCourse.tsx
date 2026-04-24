import {useEffect, useRef, useState} from "react";
import CommonFileInput, {CommonFileInputRef} from "../form/input/CommonFileInput.tsx";
import {useAddCourse} from "../../api/courses/useCourse.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import {useTeacherProfileMe} from "../../api/teacherProfile/useTeacherProfile.ts";
import {Course} from "../../types/types.ts";
import {useFormik} from "formik";
import * as Yup from "yup";
import Button from "../ui/button/Button.tsx";

function AddCourse() {

    const fileRef = useRef<CommonFileInputRef>(null);

    const {mutateAsync: addCourse, isSuccess, isPending} = useAddCourse();
    const {data: user} = useUser();
    const {data: teacherProfile} = useTeacherProfileMe((user?.roleName || "").toUpperCase().includes("TEACHER"));
    const resolvedBusinessId = user?.businessId || teacherProfile?.businessId || "";

    const [initialValues, setInitialValues] = useState<Pick<Course, "name" | "description" | "attachmentId">>({
        name: "",
        description: "",
        attachmentId: ""
    });


    const formik = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .required("Nomini kiriting!"),
        }),
        onSubmit: () => {
            if (fileRef.current) {
                fileRef.current.saveFile()
            }
        },
    });

    useEffect(() => {
        if (isSuccess) {
            formik.resetForm()
            setInitialValues({
                name: "",
                description: "",
                attachmentId: ""
            })
        }
    }, [formik, isSuccess]);

    const handleSubmit = async (fileId?: string | null) => {
        if (fileId) {
            await addCourse({
                ...formik.values,
                ...(resolvedBusinessId ? {businessId: resolvedBusinessId} : {}),
                attachmentId: fileId,
            });
        }
    }
    return (
        <div className={'border border-blue-200 rounded-3xl overflow-hidden'}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                    return false;
                }}>
                <div>
                    <CommonFileInput attachmentId={formik.values?.attachmentId as string} ref={fileRef}
                                     accept="image/png, image/jpeg, image/jpg, image/webp"
                                     maxSizeMB={20}
                                     className={'flex flex-col items-center justify-center'}
                                     text='Rasm yuklash' handleSubmit={handleSubmit}/>
                </div>
                <div className={'p-4'}>
                    <input
                        type={'text'}
                        id={"name"}
                        name={"name"}
                        value={formik.values.name}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                        placeholder={'Kurs nomi'}
                        className={`outline-hidden w-full text-md font-medium ${formik?.errors.name && formik.touched.name
                        && "text-error-500 border-bottom-1 border-red-500"}`}
                    />
                    <input
                        type={'text'}
                        id={"description"}
                        name={"description"}
                        value={formik.values.description}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                        placeholder={'Tavsif'}
                        className={`outline-hidden w-full  text-xs font-light`}
                    />
                    <Button type={"submit"}
                            isPending={isPending}
                            className={'w-full h-[40px] mt-3 bg-blue-50 text-blue-400 border border-blue-400 rounded-full p-1 text-center'}>
                        Qo'shish
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddCourse;
