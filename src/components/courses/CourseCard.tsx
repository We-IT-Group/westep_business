import {useState} from "react";
import {Link} from "react-router";
import {BookOpen, Clock, FileText, ImageIcon, Users} from "lucide-react";
import {Course} from "../../types/types.ts";
import {useDeleteCourse} from "../../api/courses/useCourse.ts";
import DeleteModal from "../common/DeleteModal.tsx";
import UpdateCourse from "./UpdateCourse.tsx";
import {Progress} from "../ui/progress/progress.tsx";
import {baseUrlImage} from "../../api/apiClient.ts";

function CourseCard({course}: { course: Course }) {
    const {mutate, isPending: isDeletePending} = useDeleteCourse();
    const [openEdit, setOpenEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const normalizedAttachmentUrl = course.attachmentUrl
        ? (course.attachmentUrl.startsWith("http")
            ? course.attachmentUrl
            : `${baseUrlImage.replace(/\/api$/, "")}${course.attachmentUrl}`)
        : "";

    const courseImage = normalizedAttachmentUrl;

    const handleDelete = async () => {
        await mutate(course.id);
    };

    if (openEdit) {
        return <UpdateCourse data={course} setOpenEdit={() => setOpenEdit(false)}/>;
    }

    return (
        <>
            <div
                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    {courseImage && !imageFailed ? (
                        <img
                            src={courseImage}
                            alt={course.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <div
                            className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#bfdbfe_30%,_#eff6ff_65%,_#f8fafc_100%)]">
                            <div
                                className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.02),rgba(15,23,42,0.18))]"/>
                            <div className="relative flex flex-col items-center gap-3 text-slate-600">
                                <div className="rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur">
                                    <ImageIcon className="h-8 w-8"/>
                                </div>
                                <p className="text-sm font-medium">Course cover</p>
                            </div>
                        </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                                course.isPublished
                                    ? "bg-emerald-500/90 text-white"
                                    : "bg-white/85 text-slate-700"
                            }`}
                        >
                            {course.isPublished ? "Published" : "Draft"}
                        </span>

                        <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <Users className="w-3 h-3"/>
                            <span className="text-xs font-medium">1200</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 pb-4">
                    <h3 className="mb-2 line-clamp-2 break-words text-xl font-bold text-slate-900 transition-colors group-hover:text-sky-700">
                        {course.name}
                    </h3>

                    <p className="mb-5 min-h-[60px] break-words text-sm leading-relaxed text-slate-600 line-clamp-3">
                        {course.description || "No description provided for this course yet."}
                    </p>

                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-medium text-slate-600">Progress</span>
                            <span className="font-semibold text-slate-900">70%</span>
                        </div>
                        <Progress value={70} className="h-2"/>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <BookOpen className="h-4 w-4"/>
                            <span className="text-sm font-medium">12</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <FileText className="h-4 w-4"/>
                            <span className="text-sm font-medium">12</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="h-4 w-4"/>
                            <span className="text-sm font-medium">10m</span>
                        </div>
                    </div>
                    <Link
                        to={`/courses/details/${course.id}`}
                        className="text-sm font-medium text-blue-600 transition-transform group-hover:translate-x-1 group-hover:text-blue-700"
                    >
                        Edit →
                    </Link>
                </div>
            </div>

            <DeleteModal
                isPending={isDeletePending}
                setOpen={setDeleteModal}
                open={deleteModal}
                deleteFunction={handleDelete}
            />
        </>
    );
}

export default CourseCard;
