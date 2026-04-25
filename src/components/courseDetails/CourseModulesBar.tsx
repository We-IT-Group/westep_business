import {Plus, Database, Layers} from "lucide-react";
import {useGetModules} from "../../api/module/useModule.ts";
import {Module} from "../../types/types.ts";
import ModuleCard from "./ModuleCard.tsx";
import {Button} from "../ui/button.tsx";
import {useState} from "react";
import {showSuccessToast} from "../../utils/toast.tsx";
import ModuleForm from "../courses/ModuleForm.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog.tsx";

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
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(modules.map((m) => m.id))
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
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
        <div className="flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-11 w-full gap-2.5 rounded-xl border border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
                >
                    <Plus className="w-4 h-4"/>
                    <span className="font-black text-[11px] uppercase tracking-widest">Add Module</span>
                    <div className="ml-auto rounded-md bg-white/20 px-2 py-0.5 text-[9px] font-black">
                        {modules.length}
                    </div>
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {modules.length === 0 ? (
                    <div className="py-20 px-8 text-center flex flex-col items-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center animate-pulse">
                                <Database className="w-10 h-10 text-blue-500 opacity-20" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                        <h3 className="font-black text-slate-900 mb-3 text-xl tracking-tight">Empty Curriculum</h3>
                        <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                            No modules found. Start building your educational structure by adding your first segment.
                        </p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 rounded-xl gap-2 shadow-lg shadow-emerald-100 font-bold"
                        >
                            <Plus className="w-5 h-5"/>
                            Create First Module
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Structure Architecture
                            </div>
                        </div>
                        {modules.map((item: Module, index: number) => (
                            <ModuleCard module={item} key={item.id} index={index}
                                        isExpanded={expandedModules.has(item.id)}
                                        onToggle={() => toggleModule(item.id)}
                                        activeSession={activeSession}
                                        onSelectionChange={onSelectionChange}

                            />
                        ))}
                    </>
                )}


            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-[380px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                    <div>
                        <DialogHeader className="mb-5 text-center">
                            <DialogTitle className="text-xl font-semibold text-slate-950">Yangi modul</DialogTitle>
                        </DialogHeader>

                        <ModuleForm
                            courseId={id || ""}
                            suggestedOrderIndex={modules.length + 1}
                            onSuccess={() => {
                                setIsCreateModalOpen(false);
                                showSuccessToast("Yangi modul muvaffaqiyatli qo'shildi");
                            }}
                            onCancel={() => setIsCreateModalOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CourseModulesBar;
