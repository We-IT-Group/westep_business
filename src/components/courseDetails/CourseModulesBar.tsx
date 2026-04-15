import {Plus} from "lucide-react";
import {useAddModule, useGetModules} from "../../api/module/useModule.ts";
import {Lesson, Module} from "../../types/types.ts";
import ModuleCard from "./ModuleCard.tsx";
import {Button} from "../ui/button.tsx";
import Spinner from "../common/Spinner.tsx";
import {useState} from "react";

function CourseModulesBar({id}: { id: string | undefined }) {
    const {data} = useGetModules(id);
    const {mutateAsync: addModule, isPending: isAdding} = useAddModule();

    const modules: (Module & { lessons?: unknown[] })[] = data || [];
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        new Set(modules.map((m) => m.id))
    );
    const [selectedLesson, setSelectedLesson] = useState<{ moduleId: string; lesson: Lesson } | null>(
        null
    );

    async function onAddModule() {
        await addModule(
            {
                name: "New Modules " + modules.length + 1,
                description: "",
                price: 0,
                courseId: id || "",
                orderIndex: modules.length + 1
            });
    }

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
        <div>
            <div className="p-4 border-b border-gray-200 bg-white">
                <Button
                    onClick={onAddModule}
                    disabled={isAdding}
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-11 shadow-md hover:shadow-lg transition-all relative"
                >
                    {
                        isAdding ? <Spinner/> : <Plus className="w-5 h-5"/>

                    }
                    Add Module
                    <span className={'absolute right-5'}>
                        {modules.length}
                    </span>
                </Button>
            </div>


            <div className="p-4 space-y-1">
                {modules.length === 0 ? (
                    <div className="py-16 px-6 text-center">
                        <div
                            className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">📚</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">No modules yet</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Start building your course by adding your first module
                        </p>
                        <Button
                            onClick={onAddModule}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            Add First Module
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                            Course Structure
                        </div>
                        {modules.map((item: Module, index: number) => (
                            <ModuleCard module={item} key={item.id} index={index}
                                        isExpanded={expandedModules.has(item.id)}
                                        onToggle={() => toggleModule(item.id)}
                                        selectedLesson={selectedLesson}
                                // onAddLesson={onAddLesson}
                                // onDeleteModule={onDeleteModule}
                                // onDeleteLesson={handleUpdateLesson}
                                // onUpdateLessonTitle={onUpdateLessonTitle}
                                // onSelectLesson={onSelectLesson}

                            />
                        ))}
                    </>
                )}


            </div>
        </div>
    );
}

export default CourseModulesBar;
