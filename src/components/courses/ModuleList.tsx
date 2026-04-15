import { Module } from "../../types/types.ts";
import { useDeleteModule, useGetModules } from "../../api/module/useModule.ts";
import { TrashBinIcon, PencilIcon, PlusIcon } from "../../icons/index.ts";
import Button from "../ui/button/Button.tsx";
import { useState } from "react";
import ModuleForm from "./ModuleForm.tsx";

interface ModuleListProps {
    courseId: string;
}

export default function ModuleList({ courseId }: ModuleListProps) {
    const { data: modules, isLoading } = useGetModules(courseId);
    const { mutateAsync: deleteModule } = useDeleteModule();
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleDelete = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu modulni o'chirib tashlamoqchimisiz?")) {
            await deleteModule(id);
        }
    };

    if (isLoading) return <div className="p-4 text-center">Yuklanmoqda...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Modullar</h3>
                {!isAdding && !editingModule && (
                    <Button variant="primary" size="sm" onClick={() => setIsAdding(true)}>
                        <PlusIcon className="w-4 h-4 mr-1" /> Modul qo'shish
                    </Button>
                )}
            </div>

            {(isAdding || editingModule) && (
                <ModuleForm
                    courseId={courseId}
                    initialData={editingModule}
                    onSuccess={() => {
                        setIsAdding(false);
                        setEditingModule(null);
                    }}
                    onCancel={() => {
                        setIsAdding(false);
                        setEditingModule(null);
                    }}
                />
            )}

            <div className="grid grid-cols-1 gap-4">
                {modules && modules.length > 0 ? (
                    modules.map((module: Module) => (
                        <div
                            key={module.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{module.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{module.description}</p>
                                <p className="text-sm font-medium text-brand-600 mt-1">
                                    {module.price?.toLocaleString()} UZS
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingModule(module)}
                                    className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors dark:hover:bg-brand-900/20"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(module.id)}
                                    className="p-2 text-gray-500 hover:text-error-600 hover:bg-error-50 rounded-full transition-colors dark:hover:bg-error-900/20"
                                >
                                    <TrashBinIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl dark:border-gray-700">
                            <p className="text-gray-500">Hozircha modullar mavjud emas.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
