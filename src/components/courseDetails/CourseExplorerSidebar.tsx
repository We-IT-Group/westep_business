import React from "react";
import {
    BarChart3,
    BookOpen,
    ClipboardCheck,
    FolderKanban,
    MessageSquare,
    Settings,
    Sparkles,
    TrendingUp,
    Users,
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
    courseName?: string;
    isCourseActive: boolean;
    moduleCount: number;
    lessonCount: number;
    activeSession: { type: SessionType; id: string | null; moduleId?: string | null };
    onSelectionChange: (type: SessionType, id: string | null, meta?: { moduleId?: string | null }) => void;
}

const CourseExplorerSidebar: React.FC<CourseExplorerSidebarProps> = ({
    courseId,
    courseName,
    isCourseActive,
    moduleCount,
    lessonCount,
    activeSession,
    onSelectionChange,
}) => {
    const insightItems: { id: SessionType; label: string; icon: typeof TrendingUp; hint: string }[] = [
        {id: "students", label: "Students", icon: Users, hint: "Course student activity"},
        {id: "analytics", label: "Analytics", icon: TrendingUp, hint: "Tracking va growth signal"},
        {id: "homework", label: "Submissions", icon: ClipboardCheck, hint: "Homework review desk"},
        {id: "discussions", label: "Discussions", icon: MessageSquare, hint: "Teacher reply center"},
        {id: "quizzes", label: "Quiz Results", icon: BarChart3, hint: "Assessment monitoring"},
    ];

    return (
        <aside className="overflow-hidden rounded-[34px] border border-sky-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,246,255,0.92))] text-slate-900 shadow-[0_24px_70px_rgba(59,130,246,0.12)]">
            <div className="border-b border-sky-100 px-5 py-5">
                <div className="rounded-[28px] border border-sky-100 bg-white/90 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700">
                                <Sparkles className="h-3.5 w-3.5"/>
                                Builder navigator
                            </div>
                            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{courseName || "Course workspace"}</h2>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                Curriculum tree, delivery flow va review workspaces bir navigator ichida jamlandi.
                            </p>
                        </div>
                        <div className={`rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] ${
                            isCourseActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}>
                            {isCourseActive ? "Live" : "Archived"}
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <FolderKanban className="h-4 w-4"/>
                                <span className="text-[10px] font-black uppercase tracking-[0.22em]">Modules</span>
                            </div>
                            <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">{moduleCount}</div>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <BookOpen className="h-4 w-4"/>
                                <span className="text-[10px] font-black uppercase tracking-[0.22em]">Lessons</span>
                            </div>
                            <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">{lessonCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 px-4 py-5">
                <section>
                    <div className="mb-3 flex items-center justify-between px-2">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Curriculum map</p>
                            <h3 className="mt-1 text-sm font-black tracking-wide text-slate-900">Course structure</h3>
                        </div>
                        <button
                            onClick={() => onSelectionChange("none", null)}
                            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] transition ${
                                activeSession.type === "none"
                                    ? "border-blue-200 bg-blue-600 text-white"
                                    : "border-slate-200 bg-white text-slate-500 hover:border-sky-200 hover:bg-sky-50"
                            }`}
                        >
                            Canvas
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-white/80">
                        <CourseModulesBar
                            id={courseId}
                            activeSession={activeSession}
                            onSelectionChange={onSelectionChange}
                        />
                    </div>
                </section>

                <section>
                    <div className="px-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Operations</p>
                        <h3 className="mt-1 text-sm font-black tracking-wide text-slate-900">Review and insights</h3>
                    </div>

                    <div className="mt-3 space-y-2">
                        {insightItems.map((item) => {
                            const isActive = activeSession.type === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectionChange(item.id, courseId)}
                                    className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${
                                        isActive
                                            ? "border-blue-200 bg-blue-600 text-white shadow-[0_16px_34px_rgba(59,130,246,0.16)]"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-2xl p-3 ${isActive ? "bg-white/20" : "bg-sky-50 text-sky-700"}`}>
                                            <item.icon className="h-4 w-4"/>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black">{item.label}</div>
                                            <div className={`text-xs font-semibold ${isActive ? "text-white/70" : "text-slate-500"}`}>{item.hint}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            <div className="border-t border-sky-100 px-4 py-4">
                <button
                    onClick={() => onSelectionChange("course", courseId)}
                    className={`flex w-full items-center gap-3 rounded-[22px] border px-4 py-4 text-left transition ${
                        activeSession.type === "course"
                            ? "border-blue-200 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                    }`}
                >
                    <div className={`rounded-2xl p-3 ${activeSession.type === "course" ? "bg-white/20" : "bg-sky-50 text-sky-700"}`}>
                        <Settings className="h-4 w-4"/>
                    </div>
                    <div>
                        <div className="text-sm font-black">Course blueprint</div>
                        <div className={`text-xs font-semibold ${activeSession.type === "course" ? "text-white/70" : "text-slate-500"}`}>
                            General positioning, structure va publishing rhythm.
                        </div>
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default CourseExplorerSidebar;
