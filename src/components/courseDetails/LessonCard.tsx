import {useState} from "react";
import {Trash2, Play, FileText, Edit3} from "lucide-react";
import {Lesson} from "../../types/types.ts";
import {useDeleteLesson, useUpdateLesson} from "../../api/lessons/useLesson.ts";
import DeleteModal from "../common/DeleteModal.tsx";
import {Switch} from "../ui/switch.tsx";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "../ui/tooltip.tsx";

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

const createLessonUpdateBody = (lesson: Lesson, patch: Partial<Lesson>): Lesson => {
    const body: Lesson = {
        ...lesson,
        ...patch,
    };

    if (body.type === "PRACTICE") {
        delete body.videoUrl;
        delete body.watchCompletionPercent;
        body.estimatedDuration = null;
    }

    return body;
};

function LessonCard({lesson, courseId, onSelect, activeSession}: LessonCardProps) {
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
            await updateLesson({body: createLessonUpdateBody(lesson, {name: title.trim()})});
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

    const handleActiveToggle = async (checked: boolean) => {
        try {
            await updateLesson({
                body: createLessonUpdateBody(lesson, {active: checked}),
            });
            showSuccessToast(checked ? "Lesson active qilindi" : "Lesson inactive qilindi");
        } catch (error) {
            showErrorToast(error, "Lesson active holatini yangilab bo'lmadi");
        }
    };

    const isActive = activeSession.type === 'lesson' && activeSession.id === lesson.id;
    const isPractice = lesson.type === "PRACTICE";
    const tooltipClassName = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200";

    return (
        <div className="relative">
            {/* Visual Tree Connector (Vertical Line) */}
            <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-slate-200" />
            
            <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ml-3 relative ${
                isActive
                    ? "bg-slate-900 shadow-lg shadow-slate-200 text-white"
                    : "bg-white hover:bg-slate-50 border border-transparent"
            }`}
                 onDoubleClick={handleDoubleClick}
            >
                {/* Horizontal Connector Hook */}
                <div className="absolute left-[-23px] top-1/2 w-5 h-px bg-slate-200" />

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(lesson.id, lesson.moduleId);
                    }}
                    className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                        isActive ? "bg-white/15" : isPractice ? "bg-amber-50 hover:bg-amber-100" : "bg-slate-100 hover:bg-slate-200"
                    }`}
                >
                    {!isPractice ? (
                         <Play className={`h-4 w-4 fill-current ${isActive ? "text-white" : "text-blue-500"}`} />
                    ) : (
                         <FileText className={`h-4 w-4 ${isActive ? "text-white" : "text-amber-600"}`} />
                    )}
                </button>

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
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span
                            className={`truncate text-sm font-bold ${isActive ? "text-white" : "text-slate-700"}`}>
                            {lesson.name}
                        </span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            isActive ? "bg-white/15 text-white" : isPractice ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                        }`}>
                            {isPractice ? "Mashq" : "Dars"}
                        </span>
                    </div>
                )}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(lesson.id, lesson.moduleId);
                            }}
                            className={`opacity-0 group-hover:opacity-100 rounded-lg p-1.5 transition-all ${
                                isActive ? "text-white hover:bg-white/20" : "text-slate-300 hover:bg-blue-50 hover:text-blue-500"
                            }`}
                        >
                            <Edit3 className="w-4.5 h-4.5"/>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className={tooltipClassName}>Darsni tahrirlash</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal(true)
                            }}
                            className={`opacity-0 group-hover:opacity-100 rounded-lg p-1.5 transition-all ${
                                isActive ? "text-white hover:bg-white/20" : "text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                            }`}
                        >
                            <Trash2 className="w-4.5 h-4.5"/>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className={tooltipClassName}>Darsni o‘chirish</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="shrink-0"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <Switch
                                checked={Boolean(lesson.active)}
                                onCheckedChange={handleActiveToggle}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className={tooltipClassName}>
                        Yoqilganda studentlarga ko‘rinadi, o‘chirilganda yashirinadi.
                    </TooltipContent>
                </Tooltip>
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
