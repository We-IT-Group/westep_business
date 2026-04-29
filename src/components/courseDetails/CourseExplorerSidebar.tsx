import React from "react";
import {
} from "lucide-react";
import CourseModulesBar from "./CourseModulesBar";

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

interface CourseExplorerSidebarProps {
    courseId: string;
    activeSession: { type: SessionType; id: string | null; moduleId?: string | null };
    onSelectionChange: (type: SessionType, id: string | null, meta?: { moduleId?: string | null }) => void;
}

const CourseExplorerSidebar: React.FC<CourseExplorerSidebarProps> = ({
    courseId,
    activeSession,
    onSelectionChange,
}) => {
    return (
        <aside className="border-r border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">Modullar va darslar</h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Darsni tanlab ichini boshqaring.</p>
                </div>
                <button
                    onClick={() => onSelectionChange("none", null)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                        activeSession.type === "none"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                >
                    Kontent
                </button>
            </div>
            <CourseModulesBar
                id={courseId}
                activeSession={activeSession}
                onSelectionChange={onSelectionChange}
            />
        </aside>
    );
};

export default CourseExplorerSidebar;
