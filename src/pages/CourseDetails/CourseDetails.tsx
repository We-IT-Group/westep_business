import {Outlet, useNavigate, useOutlet, useParams} from "react-router-dom";
import {ArrowLeft, Camera, Edit2, ImageIcon, LoaderCircle} from "lucide-react";
import PageMeta from "../../components/common/PageMeta.tsx";
import CourseModulesBar from "../../components/courseDetails/CourseModulesBar.tsx";
import {Button} from "../../components/ui/button.tsx";
import {useGetCourseById, useUpdateCourse} from "../../api/courses/useCourse.ts";
import {useState} from "react";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
import {useAddFile} from "../../api/file/useFile.ts";
import {baseUrlImage} from "../../api/apiClient.ts";
import {showErrorToast} from "../../utils/toast.tsx";
import TrackingLinksSection from "../../components/courseDetails/TrackingLinksSection.tsx";

function CourseDetails() {
    const params = useParams();
    const navigate = useNavigate();
    const outlet = useOutlet();
    const {data: course} = useGetCourseById(params.id);
    const {mutateAsync: editCourse, isPending: isUpdatingCourse} = useUpdateCourse();
    const {mutateAsync: uploadFile, isPending: isUploadingFile} = useAddFile();


    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [courseTitle, setCourseTitle] = useState<string>(course?.name);
    const [courseDescription, setCourseDescription] = useState<string>(course?.description);
    const [localImageUrl, setLocalImageUrl] = useState<string>("");

    const courseImageUrl = localImageUrl || (course?.attachmentUrl
        ? (course.attachmentUrl.startsWith("http")
            ? course.attachmentUrl
            : `${baseUrlImage.replace(/\/api$/, "")}${course.attachmentUrl}`)
        : "");

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (courseTitle.trim() && courseTitle !== course.name) {
            editCourse({...course, name: courseTitle});
            setCourseTitle('')
        } else {
            setCourseTitle(course?.name);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleBlur();
        } else if (e.key === "Escape") {
            setIsEditingTitle(false);
            editCourse({...course, name: courseTitle});
            setCourseTitle('')
        }
    };


    const handleDescriptionBlur = () => {
        setIsEditingDescription(false);
        if (courseDescription.trim() && courseDescription !== course.description) {
            editCourse({...course, description: courseDescription});
            setCourseDescription('')
        } else {
            setCourseDescription(course?.description);
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleDescriptionBlur();
        } else if (e.key === "Escape") {
            setIsEditingDescription(false);
            editCourse({...course, description: courseDescription});
            setCourseDescription('')
        }
    };

    const handleBack = () => {
        navigate("/courses");
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file || !course) return;

        if (!file.type.startsWith("image/")) {
            showErrorToast("Faqat rasm fayl yuklash mumkin.", "Rasm yangilanmadi");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setLocalImageUrl(previewUrl);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await uploadFile(formData);
            const attachmentId =
                typeof uploadResponse === "string"
                    ? uploadResponse
                    : uploadResponse?.id || uploadResponse?.data?.id;

            if (!attachmentId) {
                throw new Error("Rasm ID qaytmadi.");
            }

            await editCourse({
                ...course,
                attachmentId,
            });
        } catch (error) {
            setLocalImageUrl("");
            showErrorToast(error, "Course rasmi yangilanmadi");
        } finally {
            event.target.value = "";
        }
    };

    return (
        <>
            <PageMeta
                title="Course Builder"
                description="Manage modules and lesson content for this course."
            />
            <div className="h-full flex flex-col bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-8 py-4">
                    <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0 flex flex-1 items-start gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="mt-1 h-8 w-8 shrink-0 rounded-full p-0 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-3.5 w-3.5"/>
                            </Button>

                            <div className="min-w-0 flex-1">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={courseTitle}
                                    onChange={(e) => setCourseTitle(e.target.value)}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={handleTitleKeyDown}
                                    className="w-full max-w-3xl rounded-lg border-2 border-blue-300 px-3 py-2 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="group flex max-w-3xl items-start gap-2 cursor-pointer"
                                    onClick={() => {
                                        setIsEditingTitle(true);
                                        setCourseTitle(course?.name);
                                    }}
                                >
                                    <h1 className="flex-1 text-2xl font-bold text-gray-900">
                                        {course?.name}
                                    </h1>
                                    <Edit2
                                        className="mt-1 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"/>
                                </div>
                            )}

                            {isEditingDescription ? (
                                <textarea
                                    value={courseDescription}
                                    onChange={(e) => setCourseDescription(e.target.value)}
                                    onBlur={handleDescriptionBlur}
                                    onKeyDown={handleDescriptionKeyDown}
                                    className="mt-2 w-full max-w-3xl rounded-lg border border-blue-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="group mt-2 flex max-w-3xl items-start gap-2 cursor-pointer"
                                    onClick={() => {
                                        setIsEditingDescription(true);
                                        setCourseDescription(course?.description);
                                    }}
                                >
                                    <p className="flex-1 text-sm text-gray-600">
                                        {course?.description || "------"}
                                    </p>
                                    <Edit2
                                        className="mt-0.5 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"/>
                                </div>
                            )}

                            <p className="mt-2 text-xs text-gray-500">Click title or description to edit</p>
                            </div>
                        </div>

                        <div className="w-[220px] shrink-0">
                            <div className="relative h-[128px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                {courseImageUrl ? (
                                    <img
                                        src={courseImageUrl}
                                        alt={course?.name || "Course cover"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#eff6ff_55%,_#f8fafc_100%)] text-gray-500">
                                        <ImageIcon className="h-8 w-8"/>
                                        <span className="text-sm font-medium">Course image</span>
                                    </div>
                                )}

                                <label className="absolute inset-x-2 bottom-2 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        className="sr-only"
                                        onChange={handleImageChange}
                                        disabled={isUploadingFile || isUpdatingCourse}
                                    />
                                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur transition hover:bg-slate-900">
                                        {isUploadingFile || isUpdatingCourse ? (
                                            <>
                                                <LoaderCircle className="h-3 w-3 animate-spin"/>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="h-3 w-3"/>
                                                Change image
                                            </>
                                        )}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div
                        className="w-[30%] min-w-[360px] max-w-[480px] bg-white border-r border-gray-200 flex flex-col shadow-sm">
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">Course Structure</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage modules and lessons for this course
                            </p>
                        </div>
                        <CourseModulesBar id={params?.id}/>
                    </div>

                    {outlet || (params.id ? <TrackingLinksSection courseId={params.id}/> : <Outlet/>)}
                </div>
            </div>
        </>)
        ;
}

export default CourseDetails;
