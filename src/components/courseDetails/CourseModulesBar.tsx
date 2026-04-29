import {Plus, BookOpen} from "lucide-react";
import {useGetModules} from "../../api/module/useModule.ts";
import {Module} from "../../types/types.ts";
import ModuleCard from "./ModuleCard.tsx";
import {Button} from "../ui/button.tsx";
import {useState} from "react";
import {showSuccessToast} from "../../utils/toast.tsx";
import ModuleForm from "../courses/ModuleForm.tsx";

type SessionType =
    | "lesson"
    | "module"
    | "course"
    | "pricing"
    | "analytics"
    | "students"
    | "homework"
    | "discussions"
    | "quizzes"
    | "none";

function CourseModulesBar({ 
    id, 
    activeSession, 
    onSelectionChange 
}: { 
    id: string | undefined, 
    activeSession: { type: SessionType, id: string | null, moduleId?: string | null },
    onSelectionChange: (type: SessionType, id: string | null, meta?: { moduleId?: string | null }) => void
}) {
    const {data} = useGetModules(id);
    const modules: (Module & { lessons?: unknown[] })[] = data || [];
    const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

    const toggleModule = (moduleId: string) => {
        setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
    };


    //
    // const handleDeleteModule = useCallback((moduleId: string) => {
    //     setCourse((prev) => ({
    //         ...prev,
    //         modules: prev.modules.filter((m) => m.id !== moduleId),
    //     }));
    //     if (selectedLesson?.moduleId === moduleId) {
    //         setSelectedLesson(null);
    //     }
    // }, [selectedLesson]);
    //
    // const handleDeleteLesson = useCallback((moduleId: string, lessonId: string) => {
    //     setCourse((prev) => ({
    //         ...prev,
    //         modules: prev.modules.map((module) =>
    //             module.id === moduleId
    //                 ? {...module, lessons: module.lessons.filter((l) => l.id !== lessonId)}
    //                 : module
    //         ),
    //     }));
    //     if (selectedLesson?.lesson.id === lessonId) {
    //         setSelectedLesson(null);
    //     }
    // }, [selectedLesson]);


    return (
        <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">Modullar</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Dars qo‘shish uchun modul ichiga kiring.</p>
                    </div>
                    <Button
                        onClick={() => setIsCreateFormOpen((prev) => !prev)}
                        className="h-10 gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4"/>
                        Modul qo‘shish
                    </Button>
                </div>

                {isCreateFormOpen ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <ModuleForm
                            courseId={id || ""}
                            suggestedOrderIndex={modules.length + 1}
                            onSuccess={() => {
                                setIsCreateFormOpen(false);
                                showSuccessToast("Yangi modul qo'shildi");
                            }}
                            onCancel={() => setIsCreateFormOpen(false)}
                        />
                    </div>
                ) : null}
            </div>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {modules.length === 0 ? (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center dark:border-slate-800">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-200">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-100">Modul yo‘q</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Dars qo‘shish uchun avval modul yarating.
                        </p>
                        <Button
                            onClick={() => setIsCreateFormOpen(true)}
                            className="mt-5 h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4"/>
                            Birinchi modul
                        </Button>
                    </div>
                ) : (
                    <>
                        {modules.map((item: Module, index: number) => (
                            <ModuleCard module={item} key={item.id} index={index}
                                        isExpanded={expandedModuleId === item.id}
                                        onToggle={() => toggleModule(item.id)}
                                        activeSession={activeSession}
                                        onSelectionChange={onSelectionChange}

                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default CourseModulesBar;
