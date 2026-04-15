import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import * as Yup from "yup";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import { useParams } from "react-router";
import { useAddCourse, useGetCourseById, useUpdateCourse } from "../../api/courses/useCourse.ts";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import Button from "../../components/ui/button/Button.tsx";
import { Course } from "../../types/types.ts";
import { useUser } from "../../api/auth/useAuth.ts";
import CommonFileInput, { CommonFileInputRef } from "../../components/form/input/CommonFileInput.tsx";
import ModuleList from "../../components/courses/ModuleList.tsx";

export default function AddCourse() {

    const { id } = useParams<{ id: string }>();
    const fileRef = useRef<CommonFileInputRef>(null);

    const { mutateAsync: addCourse, isPending: isAdding } = useAddCourse();
    const { data: user, isLoading: isUserLoading } = useUser();
    const { mutateAsync: updateCourse, isPending: isUpdating } = useUpdateCourse();
    const { data, isLoading: isCourseLoading } = useGetCourseById(id);

    const [initialValues, setInitialValues] = useState<Pick<Course, "name" | "description" | "attachmentId">>({
        name: "",
        description: "",
        attachmentId: ""
    });


    useEffect(() => {
        if (data) {
            setInitialValues({
                name: data.name,
                description: data.description,
                attachmentId: data.attachmentId
            })
        }
    }, [data])


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


    const handleSubmit = async (fileId?: string | null) => {
        if (fileId && user) {
            if (id) {
                await updateCourse({ ...formik.values, id, businessId: user.businessId, attachmentId: fileId });
            } else {
                await addCourse({ ...formik.values, businessId: user.businessId, attachmentId: fileId });
            }
        }
    }

    if (isUserLoading || (id && isCourseLoading)) {
        return <div className="flex items-center justify-center min-h-[400px]">Yuklanmoqda...</div>;
    }


    return (
        <div className="space-y-6">
            <PageMeta
                title={id ? "Kursni tahrirlash" : "Kurs yaratish"}
                description={id ? "Kurs ma'lumotlarini o'zgartirish" : "Yangi kurs yaratish"}
            />
            <PageBreadCrumb pageTitle={id ? "Kursni tahrirlash" : "Kurs yaratish"} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <ComponentCard title="Kurs Ma'lumotlari">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formik.handleSubmit();
                                return false;
                            }}>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Kurs nomi</Label>
                                    <Input type="text" formik={formik} name={'name'} placeholder={'Kurs nomi'} />
                                </div>
                                <div>
                                    <Label htmlFor="description">Tavsif</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        className="w-full rounded-[20px] border border-gray-300 bg-transparent px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
                                        placeholder="Kurs haqida batafsil ma'lumot..."
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.description && formik.touched.description && (
                                        <p className="mt-1.5 text-xs text-error-500">{formik.errors.description}</p>
                                    )}
                                </div>
                                <div className={'flex gap-4 justify-end'}>
                                    <Button type="submit" variant='primary' isPending={isAdding || isUpdating}
                                        disabled={isAdding || isUpdating}>
                                        Saqlash
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </ComponentCard>

                    {id && (
                        <ComponentCard title="Kurs Modullari">
                            <ModuleList courseId={id} />
                        </ComponentCard>
                    )}
                </div>

                <div className="space-y-6">
                    <ComponentCard title="Kurs Rasmi">
                        <div className="p-2">
                            <CommonFileInput attachmentId={formik.values?.attachmentId as string} ref={fileRef}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                maxSizeMB={20}
                                text='Rasm yuklash' handleSubmit={handleSubmit} />
                        </div>
                    </ComponentCard>
                </div>
            </div>
        </div>
    );
}
