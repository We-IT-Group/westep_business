import {useState} from "react";
import {useParams} from "react-router";
import {Trash2} from "lucide-react";
import {Lesson} from "../../types/types.ts";
import {useDeleteLesson, useUpdateLesson} from "../../api/lessons/useLesson.ts";
import DeleteModal from "../common/DeleteModal.tsx";

function LessonCard({lesson, courseId, onSelect}: {
    lesson: Lesson,
    courseId: string,
    onSelect: (lessonId: string) => void
}) {
    // const {lessonId} = useParams<{ lessonId: string }>();
    const params = useParams();
    const {mutate, isPending} = useDeleteLesson(courseId, lesson.moduleId);
    const {mutateAsync: updateLesson} = useUpdateLesson();


    const [deleteModal, setDeleteModal] = useState(false);
    const [title, setTitle] = useState(lesson.name);
    const [isEditing, setIsEditing] = useState(false);


    const handleDelete = async () => {
        await mutate(lesson.id);
        setDeleteModal(false);
    };


    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = async () => {
        setIsEditing(false);
        if (title.trim() && title !== lesson.name) {
            await updateLesson({body: {...lesson, name: title}});
        } else {
            setTitle(lesson.name);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleBlur();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setTitle(lesson.name);
        }
    };

    console.log(params)

    return (
        <>
            <div className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ml-8 ${
                params.lessonId === lesson.id
                    ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
            }`}
                 onDoubleClick={handleDoubleClick}
                 onClick={() => onSelect(lesson.id)}
            >
                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span
                        className={`flex-1 text-sm ${params.lessonId ? "font-medium text-gray-900" : "text-gray-700"}`}>
          {lesson.name}
        </span>
                )}
                <span className="text-xs text-gray-400">{lesson.estimatedDuration || 0}m</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete()
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5 text-red-500"/>
                </button>
            </div>

            <DeleteModal
                isPending={isPending}
                setOpen={setDeleteModal}
                open={deleteModal}
                deleteFunction={handleDelete}
            />
        </>
    );
}

export default LessonCard;
