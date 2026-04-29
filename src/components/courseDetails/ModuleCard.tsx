import {useState} from "react";
import {ChevronDown, Plus, Trash2, Edit3} from "lucide-react";
import {Module} from "../../types/types.ts";
import {useDeleteModule, useUpdateModule} from "../../api/module/useModule.ts";
import {useAddLesson} from "../../api/lessons/useLesson.ts";
import DeleteModal from "../common/DeleteModal.tsx";
import Lessons from "./Lessons.tsx";
import {Button} from "../ui/button.tsx";
import {showSuccessToast, showErrorToast} from "../../utils/toast.tsx";
import {Switch} from "../ui/switch.tsx";
import ModuleForm from "../courses/ModuleForm.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "../ui/tooltip.tsx";


interface ModuleItemProps {
    module: Module;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    activeSession: {
        type: "lesson" | "module" | "course" | "pricing" | "analytics" | "students" | "homework" | "discussions" | "quizzes" | "none";
        id: string | null;
        moduleId?: string | null;
    };
    onSelectionChange: (
        type: "lesson" | "module" | "course" | "pricing" | "analytics" | "students" | "homework" | "discussions" | "quizzes" | "none",
        id: string | null,
        meta?: { moduleId?: string | null }
    ) => void;
}

function ModuleCard({module, onToggle, isExpanded, activeSession, onSelectionChange}: ModuleItemProps) {
    const {mutate, isPending: isDeletePending} = useDeleteModule();
    const {mutateAsync: updateModule} = useUpdateModule();
    const {mutateAsync: addLesson, isPending: isLessonCreating} = useAddLesson(module.courseId, {navigateOnSuccess: false});
    const [deleteModal, setDeleteModal] = useState(false);
    const [moduleEditOpen, setModuleEditOpen] = useState(false);


    const handleDelete = async () => {
        await mutate(module.id);
        setDeleteModal(false);
    };

    const handleActiveToggle = async (checked: boolean) => {
        try {
            await updateModule({...module, description: module.description || "", active: checked});
            showSuccessToast(checked ? "Modul active qilindi" : "Modul inactive qilindi");
        } catch (error) {
            showErrorToast(error, "Modul active holatini yangilab bo'lmadi");
        }
    };

    const handleCreateLesson = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!isExpanded) {
            onToggle();
        }

        try {
            const newLesson = await addLesson({
                courseId: module.courseId,
                body: {
                    name: "Lesson nomi",
                    description: "",
                    moduleId: module.id,
                    type: "LESSON",
                    orderIndex: (module.lessonCount || 0) + 1,
                    estimatedDuration: null,
                    watchCompletionPercent: 80,
                    videoUrl: "",
                    active: false,
                },
            });
            onSelectionChange("lesson", newLesson.id, {moduleId: module.id});
            showSuccessToast("Yangi lesson yaratildi");
        } catch {
            // Error toast is handled in the mutation hook.
        }
    };

    const tooltipClassName = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200";

    return (
        <>
            <div className="mb-3 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

                <div
                    className={`group flex items-start gap-2.5 p-4 cursor-pointer transition-all ${
                        activeSession.type === 'module' && activeSession.id === module.id
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : isExpanded ? "bg-slate-50/80 dark:bg-slate-900/60" : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    }`}
                    onClick={() => {
                        onToggle();
                        onSelectionChange('module', module.id, {moduleId: module.id});
                    }}
                >
                    <div className="flex flex-col items-center gap-2 pt-1">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            className={`p-1 rounded-full transition-transform duration-300 ${
                                activeSession.type === 'module' && activeSession.id === module.id
                                ? "rotate-180 bg-blue-600 text-white"
                                : isExpanded ? "rotate-180 bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-200/50"
                            }`}
                        >
                           <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span
                                className={`font-black text-[16px] tracking-tight transition-colors ${
                                    activeSession.type === 'module' && activeSession.id === module.id ? "text-slate-950 dark:text-slate-100" : "text-slate-900 dark:text-slate-100"
                                }`}
                            >
                                {module?.name}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Narxi</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {module?.price ? module.price.toLocaleString("ru-RU") : "0"}
                                </span>
                            </div>
                            <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
                                activeSession.type === 'module' && activeSession.id === module.id
                                    ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
                                    : "border-blue-100 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/5"
                            }`}>
                                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-300">Darslar</span>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-200">{module.lessonCount || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 transition-all">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="px-1"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <Switch
                                        checked={Boolean(module.active)}
                                        onCheckedChange={handleActiveToggle}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className={tooltipClassName}>
                                Yoqilganda studentlarga ko‘rinadi, o‘chirilganda yashirinadi.
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={handleCreateLesson}
                                    className="rounded-xl p-2 text-slate-400 transition-all hover:bg-emerald-50 hover:text-emerald-600"
                                    disabled={isLessonCreating}
                                >
                                    <Plus className="w-5 h-5"/>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className={tooltipClassName}>Dars qo‘shish</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isExpanded) {
                                            onToggle();
                                        }
                                        setModuleEditOpen((prev) => !prev);
                                    }}
                                    className="rounded-xl p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className={tooltipClassName}>Modulni tahrirlash</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (module.lessonCount === 0) {
                                            handleDelete();
                                        } else {
                                            setDeleteModal(true);
                                        }
                                    }}
                                    className="rounded-xl p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className={tooltipClassName}>Modulni o‘chirish</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {isExpanded && (
                    <div className="border-t border-slate-200 px-4 pb-4 pt-3 dark:border-slate-800">
                        {moduleEditOpen ? (
                            <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                                <ModuleForm
                                    courseId={module.courseId}
                                    initialData={module}
                                    suggestedOrderIndex={module.orderIndex ?? 0}
                                    onSuccess={() => {
                                        setModuleEditOpen(false);
                                        showSuccessToast("Modul yangilandi");
                                    }}
                                    onCancel={() => setModuleEditOpen(false)}
                                />
                            </div>
                        ) : null}
                        {module.lessonCount === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-200 px-3 py-6">
                                <p className="text-sm text-gray-500 text-center mb-3">No lessons yet</p>
                                <Button
                                    onClick={(event) => void handleCreateLesson(event)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                    disabled={isLessonCreating}
                                >
                                    <Plus className="w-4 h-4"/>
                                    Birinchi lesson
                                </Button>
                            </div>
                        ) : (
                            null
                        )}
                    </div>
                )}
                <Lessons 
                    id={module.id} 
                    openLesson={isExpanded} 
                    courseId={module.courseId} 
                    activeSession={activeSession}
                    onSelectionChange={onSelectionChange}
                />

                <DeleteModal
                    isPending={isDeletePending}
                    setOpen={setDeleteModal}
                    open={deleteModal}
                    deleteFunction={handleDelete}
                />
            </div>
        </>
    );
}

export default ModuleCard;
