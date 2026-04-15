import {useEffect, useState} from "react";
import {ChevronDown, ChevronRight, Plus, Trash2} from "lucide-react";
import {Lesson, Module} from "../../types/types.ts";
import {useDeleteModule, useUpdateModule} from "../../api/module/useModule.ts";
import DeleteModal from "../common/DeleteModal.tsx";
import Lessons from "./Lessons.tsx";
import {Button} from "../ui/button.tsx";
import {useAddLesson} from "../../api/lessons/useLesson.ts";
import {useParams} from "react-router";


interface ModuleItemProps {
    module: Module;
    isExpanded: boolean;
    onToggle: () => void;
    selectedLesson: { moduleId: string; lesson: Lesson } | null;
    onSelectLesson: (moduleId: string, lesson: Lesson) => void;
}

function ModuleCard({module, onToggle, isExpanded}: ModuleItemProps) {
    const {mutate, isPending: isDeletePending} = useDeleteModule();
    const {mutateAsync: updateModule} = useUpdateModule();
    const {courseId, id} = useParams<{ id: string, courseId: string }>();
    const {mutateAsync: addLesson} = useAddLesson(id);


    const [deleteModal, setDeleteModal] = useState(false);


    const [isEditing, setIsEditing] = useState('');
    const [title, setTitle] = useState<string>(module?.name);
    const [price, setPrice] = useState<number>(module?.price);
    const [description, setDescription] = useState<string>(module?.description);


    const handleDelete = async () => {
        await mutate(module.id);
        setDeleteModal(false);
    };


    const handleDoubleClick = (e: React.MouseEvent, type) => {
        e.stopPropagation();
        setIsEditing(type);
    };

    const handleBlur = async () => {
        setIsEditing('');

        const isChanged =
            title.trim() !== module.name ||
            description.trim() !== module.description ||
            price !== module.price;
        if (title.trim() && description.trim() && isChanged) {
            await updateModule({...module, name: title, description: description, price: price});
        } else {
            setTitle(module.name);
            setDescription(module.description);
            setPrice(module.price);
        }
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleBlur();
        } else if (e.key === "Escape") {
            setIsEditing('');
            setTitle(module?.name);
        }
    };

    const handleAddLesson = async () => {
        const newLesson: Lesson = {
            name: "New Lesson " + module.lessonCount,
            description: "",
            moduleId: module.id,
            orderIndex: (module.lessonCount || 0) + 1,
            estimatedDuration: null,
            videoUrl: '',
        };
        await addLesson({body: {...newLesson}, courseId: courseId});
        // Auto-select the new lesson
        // setTimeout(() => {
        //     const module = course.modules.find(m => m.id === moduleId);
        //     if (module) {
        //         setSelectedLesson({moduleId, lesson: newLesson});
        //     }
        // }, 100);
    };


    useEffect(() => {

    }, [module.lessonCount])

    return (
        <>
            <div className={`mb-3`}>

                <div
                    className="group flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={onToggle}
                >
                    <button className="flex-shrink-0">
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-600"/>
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600"/>
                        )}
                    </button>
                    <div className={'flex flex-1 flex-col'}>
                        <div>
                            {isEditing === 'title' ? (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 px-2 py-1.5 font-semibold border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span
                                    className="flex-1 font-semibold text-gray-900 text-[17px]"
                                    onDoubleClick={(e) => handleDoubleClick(e, 'title')}
                                >
                            {module?.name}
                        </span>
                            )}
                        </div>
                        <div>
                            {isEditing === 'description' ? (
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 px-2 py-1.5 font-semibold border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span
                                    className="flex-1 font-semibold text-gray-900 text-[16px]"
                                    onDoubleClick={(e) => handleDoubleClick(e, 'description')}
                                >
                            {module?.description || "------"}
                        </span>
                            )}
                        </div>
                        <div>
                            {isEditing === 'price' ? (
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 px-2 py-1.5 font-semibold border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span
                                    className="flex-1 font-semibold text-gray-900 text-[16px]"
                                    onDoubleClick={(e) => handleDoubleClick(e, 'price')}
                                >
                            {module?.price} so'm
                        </span>
                            )}
                        </div>

                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleAddLesson()
                            }}
                            className="p-1.5 hover:bg-green-50 rounded transition-all"
                            title="Add Lesson"
                        >
                            <Plus className="w-4 h-4 text-green-600"/>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (module.lessonCount === 0) {
                                    handleDelete()
                                } else {
                                    setDeleteModal(true)
                                }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded transition-all"
                            title="Delete Module"
                        >
                            <Trash2 className="w-4 h-4 text-red-500"/>
                        </button>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {module.lessonCount}
                    </span>
                </div>

                {isExpanded && (
                    <div className="mt-1 space-y-0.5">
                        {module.lessonCount === 0 ? (
                            <div className="ml-8 px-3 py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-500 text-center mb-3">No lessons yet</p>
                                <Button
                                    onClick={() => handleAddLesson()}
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                >
                                    <Plus className="w-4 h-4"/>
                                    Add First Lesson
                                </Button>
                            </div>
                        ) : (
                            null
                        )}
                    </div>
                )}
                <Lessons id={module.id} openLesson={isExpanded} courseId={module.courseId}/>

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
