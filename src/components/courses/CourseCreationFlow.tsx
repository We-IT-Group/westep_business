import {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Textarea} from "../ui/textarea";
import {CheckCircle2, BookOpen, ImageIcon} from "lucide-react";
import CommonFileInput from "../form/input/CommonFileInput.tsx";
import {useAddCourse} from "../../api/courses/useCourse.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import {useAddFile} from "../../api/file/useFile.ts";
import {Course} from "../../types/types.ts";
import {useFormik} from "formik";
import * as Yup from "yup";
import Spinner from "../common/Spinner.tsx";
import {showErrorToast} from "../../utils/toast.tsx";

interface CourseCreationFlowProps {
    open: boolean;
    onClose: () => void;
    onComplete?: (courseData: { title: string; description: string }) => void;
}

type Step = 1 | 2 | 3;

export function CourseCreationFlow({open, onClose}: CourseCreationFlowProps) {
    const [step, setStep] = useState<Step>(1);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState("");


    const {mutateAsync: addCourse, isSuccess, isPending} = useAddCourse();
    const {mutateAsync: uploadFile, isPending: isUploadingFile} = useAddFile();
    const {data: user} = useUser();

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
        onSubmit: async () => {
            if (!selectedImage) {
                setStep(2);
                setImageError("Kurs rasmi tanlanishi kerak.");
                return;
            }

            if (!user?.businessId) {
                showErrorToast("Business user topilmadi.", "Kurs yaratib bo'lmadi");
                return;
            }

            const formData = new FormData();
            formData.append("file", selectedImage);

            const uploadResponse = await uploadFile(formData);
            const attachmentId =
                typeof uploadResponse === "string"
                    ? uploadResponse
                    : uploadResponse?.id || uploadResponse?.data?.id;

            if (!attachmentId) {
                showErrorToast("Rasm ID qaytmadi.", "Kurs yaratib bo'lmadi");
                return;
            }

            await addCourse({
                ...formik.values,
                businessId: user.businessId,
                attachmentId,
            });
        },
    });

    useEffect(() => {
        if (isSuccess) {
            handleClose();
        }
    }, [isSuccess]);

    const handleNext = () => {
        if (step === 1 && formik.values.name.trim()) {
            setStep(2);
        } else if (step === 2 && selectedImage) {
            setStep(3);
        } else if (step === 2) {
            setImageError("Kurs rasmi tanlanishi kerak.");
        }
    };
    const handleReset = () => {
        setStep(1);
        setSelectedImage(null);
        setImageError("");
        formik.resetForm()
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Course</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        formik.handleSubmit();
                        return false;
                    }}>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mb-6">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center flex-1">
                                <div
                                    className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm transition-all ${
                                        step >= num
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-200 text-gray-500"
                                    }`}
                                >
                                    {step > num ? <CheckCircle2 className="w-5 h-5"/> : num}
                                </div>
                                {num < 3 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded transition-all ${
                                            step > num ? "bg-green-600" : "bg-gray-200"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[300px]">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div
                                        className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-8 h-8 text-blue-600"/>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Course Information</h3>
                                    <p className="text-gray-600 text-sm">Let's start with the basics</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Course Title *
                                        </label>
                                        <Input
                                            value={formik.values.name}
                                            onChange={formik?.handleChange}
                                            onBlur={formik?.handleBlur}
                                            id={"name"}
                                            name={"name"}
                                            placeholder="e.g., Introduction to Web Development"
                                            className={`text-lg h-12 ${formik?.errors.name && formik.touched.name
                                            && "text-error-500 border-bottom-1 border-red-500"}`}
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Description
                                        </label>
                                        <Textarea
                                            value={formik.values.description}
                                            onChange={formik?.handleChange}
                                            onBlur={formik?.handleBlur}
                                            id={"description"}
                                            name={"description"}
                                            placeholder="What will students learn in this course?"
                                            className="min-h-[120px] resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <CommonFileInput
                                        attachmentId={formik.values?.attachmentId as string}
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        maxSizeMB={20}
                                        className={'flex flex-col items-center justify-center'}
                                        text='Rasm yuklash'
                                        imageError={imageError}
                                        value={selectedImage}
                                        onChange={(file) => {
                                            setSelectedImage(file);
                                            if (file) {
                                                setImageError("");
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <div
                                        className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-white"/>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start!</h3>
                                    <p className="text-gray-600 text-sm">
                                        Your course structure is ready to be built
                                    </p>
                                </div>

                                <div
                                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Your Course:</h4>
                                    <div className="bg-white rounded-lg p-4 mb-4">
                                        <h5 className="font-semibold text-gray-900 mb-1">{formik.values.name}</h5>
                                        <p className="text-sm text-gray-600">{formik.values.description || "No description"}</p>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        <p className="mb-2">✨ Next steps:</p>
                                        <ul className="space-y-1 ml-4">
                                            <li>• Add your first module</li>
                                            <li>• Create lessons with content</li>
                                            <li>• Upload videos and resources</li>
                                            <li>• Publish when ready</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <Button
                            variant="ghost"
                            type='button'
                            onClick={step === 1 ? handleClose : () => setStep((s) => (s - 1) as Step)}
                        >
                            {step === 1 ? "Cancel" : "Back"}
                        </Button>

                        <div className="flex gap-2">
                            {step < 3 && (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={(step === 1 && !formik.values.name.trim()) || isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                                >
                                    Continue
                                </Button>
                            )}
                            {step === 3 && (
                                <Button
                                    type="submit"
                                    disabled={isPending || isUploadingFile}
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                                >
                                    Create Course
                                    {
                                        (isPending || isUploadingFile) && <Spinner/>
                                    }
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
