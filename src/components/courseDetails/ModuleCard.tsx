import {useEffect, useState} from "react";
import {ChevronDown, Plus, Trash2, Edit3, GripVertical, Check} from "lucide-react";
import {Module} from "../../types/types.ts";
import {useDeleteModule, useUpdateModule} from "../../api/module/useModule.ts";
import DeleteModal from "../common/DeleteModal.tsx";
import Lessons from "./Lessons.tsx";
import {Button} from "../ui/button.tsx";
import {useParams} from "react-router-dom";
import {showSuccessToast, showErrorToast} from "../../utils/toast.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog.tsx";
import LessonCreateForm from "./LessonCreateForm.tsx";


interface ModuleItemProps {
    module: Module;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    activeSession: { type: string; id: string | null; moduleId?: string | null };
    onSelectionChange: (type: string, id: string | null, meta?: { moduleId?: string | null }) => void;
}

function ModuleCard({module, onToggle, isExpanded, activeSession, onSelectionChange}: ModuleItemProps) {
    const {mutate, isPending: isDeletePending} = useDeleteModule();
    const {mutateAsync: updateModule} = useUpdateModule();
    const {id} = useParams<{ id: string }>();


    const [deleteModal, setDeleteModal] = useState(false);
    const [lessonCreateOpen, setLessonCreateOpen] = useState(false);


    const [isEditing, setIsEditing] = useState('');
    const [title, setTitle] = useState<string>(module?.name);
    const [price, setPrice] = useState<string>(String(module?.price ?? 0));


    const handleDelete = async () => {
        await mutate(module.id);
        setDeleteModal(false);
    };


    useEffect(() => {
        setTitle(module.name);
        setPrice(String(module.price ?? 0));
    }, [module.name, module.price]);

    const handleDoubleClick = (e: React.MouseEvent, type: 'title' | 'price') => {
        e.stopPropagation();
        setIsEditing(type);
    };

    const handleBlur = async () => {
        setIsEditing('');
        const normalizedPrice = Number(price) || 0;
        const isChanged =
            title.trim() !== module.name ||
            normalizedPrice !== module.price;
        if (title.trim() && isChanged) {
            try {
                await updateModule({...module, name: title.trim(), description: "", price: normalizedPrice});
                showSuccessToast("Modul muvaffaqiyatli yangilandi");
            } catch (err) {
                showErrorToast(err, "Modulni yangilashda xatolik");
                setTitle(module.name);
                setPrice(String(module.price ?? 0));
            }
        } else {
            setTitle(module.name);
            setPrice(String(module.price ?? 0));
        }
    };


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleBlur();
        } else if (e.key === "Escape") {
            setIsEditing('');
            setTitle(module?.name);
            setPrice(String(module.price ?? 0));
        }
    };

    return (
        <>
            <div className={`mb-3`}>

                <div
                    className={`group flex items-start gap-2.5 p-3 rounded-2xl cursor-pointer transition-all border ${
                        activeSession.type === 'module' && activeSession.id === module.id
                        ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100"
                        : isExpanded ? "bg-slate-50/80 border-slate-200 shadow-sm" : "bg-white border-transparent hover:bg-slate-50"
                    }`}
                    onClick={() => onSelectionChange('module', module.id, {moduleId: module.id})}
                >
                    <div className="flex flex-col items-center gap-2 pt-1">
                        <div className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            className={`p-1 rounded-full transition-transform duration-300 ${
                                activeSession.type === 'module' && activeSession.id === module.id
                                ? "rotate-180 bg-white/20 text-white"
                                : isExpanded ? "rotate-180 bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-200/50"
                            }`}
                        >
                           <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 group/title">
                            {isEditing === 'title' ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 px-3 py-1.5 text-lg font-black bg-white border-2 border-blue-500 rounded-xl focus:outline-none shadow-sm"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button onClick={handleBlur} className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 flex-1">
                                    <span
                                        className={`font-black text-[16px] tracking-tight transition-colors ${
                                            activeSession.type === 'module' && activeSession.id === module.id ? "text-white" : "text-slate-900"
                                        }`}
                                        onDoubleClick={(e) => handleDoubleClick(e, 'title')}
                                    >
                                        {module?.name}
                                    </span>
                                    <button 
                                        onClick={(e) => handleDoubleClick(e, 'title')}
                                        className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 hover:text-blue-500 transition-all"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            {isEditing === 'price' ? (
                                <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-white px-2 py-1 shadow-sm">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        onBlur={handleBlur}
                                        onKeyDown={handleKeyDown}
                                        className="w-24 bg-transparent text-[11px] font-bold text-slate-700 outline-none"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBlur();
                                        }}
                                        className="rounded-lg bg-emerald-500 p-1 text-white shadow-sm"
                                    >
                                        <Check className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="group/price flex items-center gap-1 px-2 py-0.5 bg-slate-100/60 rounded-md border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price:</span>
                                    <span
                                        className="text-[10px] font-bold text-slate-600"
                                        onDoubleClick={(e) => handleDoubleClick(e, 'price')}
                                    >
                                        {module?.price?.toLocaleString()}
                                    </span>
                                    <button
                                        onClick={(e) => handleDoubleClick(e, 'price')}
                                        className="opacity-0 group-hover/price:opacity-100 p-0.5 text-slate-400 hover:text-blue-500 transition-all"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                             <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                                activeSession.type === 'module' && activeSession.id === module.id ? "bg-white/10 border-white/20" : "bg-blue-50/50 border-blue-100"
                             }`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                     activeSession.type === 'module' && activeSession.id === module.id ? "text-white" : "text-blue-600"
                                }`}>{module.lessonCount} Lessons</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLessonCreateOpen(true);
                            }}
                            className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                            title="Add Lesson"
                        >
                            <Plus className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (module.lessonCount === 0) {
                                    handleDelete();
                                } else {
                                    setDeleteModal(true);
                                }
                            }}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                            title="Delete Module"
                        >
                            <Trash2 className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-1 space-y-0.5">
                        {module.lessonCount === 0 ? (
                            <div className="ml-8 px-3 py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-500 text-center mb-3">No lessons yet</p>
                                <Button
                                    onClick={() => setLessonCreateOpen(true)}
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

                <Dialog open={lessonCreateOpen} onOpenChange={setLessonCreateOpen}>
                    <DialogContent className="max-w-[380px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                        <div>
                            <DialogHeader className="mb-5 text-center">
                                <DialogTitle className="text-xl font-semibold text-slate-950">Yangi lesson</DialogTitle>
                            </DialogHeader>

                            <LessonCreateForm
                                courseId={id || module.courseId}
                                moduleId={module.id}
                                suggestedOrderIndex={(module.lessonCount || 0) + 1}
                                onSuccess={() => setLessonCreateOpen(false)}
                                onCancel={() => setLessonCreateOpen(false)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

export default ModuleCard;
