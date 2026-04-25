import {useState} from "react";
import {FolderKanban, Layers3, LoaderCircle, Pencil, Plus, Trash2} from "lucide-react";
import {Module} from "../../types/types.ts";
import {useDeleteModule, useGetModules} from "../../api/module/useModule.ts";
import {Button} from "../ui/button.tsx";
import ModuleForm from "./ModuleForm.tsx";
import {showSuccessToast} from "../../utils/toast.tsx";

interface ModuleListProps {
    courseId: string;
}

export default function ModuleList({courseId}: ModuleListProps) {
    const {data: modules = [], isLoading} = useGetModules(courseId);
    const {mutateAsync: deleteModule, isPending: isDeleting} = useDeleteModule();
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleDelete = async (module: Module) => {
        if (!window.confirm(`"${module.name}" modulini o'chirmoqchimisiz?`)) return;

        await deleteModule(module.id);
        showSuccessToast("Modul o'chirildi");
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[220px] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <LoaderCircle className="h-8 w-8 animate-spin text-sky-600"/>
                    <p className="text-sm font-semibold text-slate-500">Modullar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Curriculum layer</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Module architecture</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        Kurs strukturasini modullar orqali qurish va tahrirlash shu blokda boshqariladi.
                    </p>
                </div>

                {!isAdding && !editingModule ? (
                    <Button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="h-11 rounded-2xl bg-slate-950 px-4 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-black"
                    >
                        <Plus className="h-4 w-4"/>
                        Add module
                    </Button>
                ) : null}
            </div>

            {(isAdding || editingModule) ? (
                <ModuleForm
                    courseId={courseId}
                    initialData={editingModule}
                    suggestedOrderIndex={modules.length + 1}
                    onSuccess={() => {
                        setIsAdding(false);
                        setEditingModule(null);
                    }}
                    onCancel={() => {
                        setIsAdding(false);
                        setEditingModule(null);
                    }}
                />
            ) : null}

            {modules.length === 0 && !isAdding ? (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-slate-400 shadow-sm">
                        <FolderKanban className="h-6 w-6"/>
                    </div>
                    <h4 className="mt-5 text-xl font-black tracking-tight text-slate-950">No modules yet</h4>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        Birinchi modulni qo‘shib, course curriculum skeleton’ini boshlang.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {modules.map((module: Module, index: number) => (
                        <div
                            key={module.id}
                            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                                            Module {index + 1}
                                        </span>
                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                                            {module.lessonCount || 0} lessons
                                        </span>
                                    </div>
                                    <h4 className="mt-4 text-lg font-black tracking-tight text-slate-950">{module.name}</h4>
                                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600">
                                        <Layers3 className="h-3.5 w-3.5"/>
                                        {module.price?.toLocaleString()} UZS
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingModule(module)}
                                        className="h-10 rounded-2xl px-4 text-xs font-black uppercase tracking-[0.2em]"
                                    >
                                        <Pencil className="h-4 w-4"/>
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleDelete(module)}
                                        disabled={isDeleting}
                                        className="h-10 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
