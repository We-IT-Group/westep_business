import {useState} from "react";
import {useParams} from "react-router-dom";
import {Trash2, Play, FileText} from "lucide-react";
import {Lesson} from "../../types/types.ts";
import {useDeleteLesson, useUpdateLesson} from "../../api/lessons/useLesson.ts";
import DeleteModal from "../common/DeleteModal.tsx";

interface LessonCardProps {
    lesson: Lesson;
    courseId: string;
    onSelect: (lessonId: string, moduleId: string) => void;
    activeSession: {
        type: "lesson" | "module" | "course" | "pricing" | "analytics" | "students" | "homework" | "discussions" | "quizzes" | "none";
        id: string | null;
        moduleId?: string | null;
    };
}

function LessonCard({lesson, courseId, onSelect, activeSession}: LessonCardProps) {
    // const {lessonId} = useParams<{ lessonId: string }>();
    const params = useParams();
    const {mutate, isPending: isDeletePending} = useDeleteLesson(courseId, lesson.moduleId);
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

    const isActive = activeSession.type === 'lesson' && activeSession.id === lesson.id;

    return (
        <div className="relative">
            {/* Visual Tree Connector (Vertical Line) */}
            <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-slate-200" />
            
            <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ml-3 relative ${
                isActive
                    ? "bg-slate-900 shadow-lg shadow-slate-200 text-white"
                    : "bg-white hover:bg-slate-50 border border-transparent"
            }`}
                 onDoubleClick={handleDoubleClick}
                 onClick={() => onSelect(lesson.id, lesson.moduleId)}
            >
                {/* Horizontal Connector Hook */}
                <div className="absolute left-[-23px] top-1/2 w-5 h-px bg-slate-200" />

                <div className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-lg ${
                    isActive ? "bg-white/20" : "bg-slate-100"
                }`}>
                    {lesson.videoUrl ? (
                         <Play className={`w-3 h-3 ${isActive ? "text-white" : "text-slate-400"}`} />
                    ) : (
                         <FileText className={`w-3 h-3 ${isActive ? "text-white" : "text-slate-400"}`} />
                    )}
                </div>

                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-2 py-0.5 text-xs font-bold bg-white text-slate-900 border border-blue-400 rounded-md focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span
                        className={`flex-1 text-sm font-bold truncate ${isActive ? "text-white" : "text-slate-700"}`}>
                        {lesson.name}
                    </span>
                )}
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal(true)
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
                        isActive ? "hover:bg-white/20 text-white" : "hover:bg-rose-50 text-slate-300 hover:text-rose-500"
                    }`}
                >
                    <Trash2 className="w-3.5 h-3.5"/>
                </button>
            </div>

            <DeleteModal
                isPending={isDeletePending}
                setOpen={setDeleteModal}
                open={deleteModal}
                deleteFunction={handleDelete}
            />
        </div>
    );
}

export default LessonCard;
