import {useState} from "react";
import {useGetModules} from "../../api/module/useModule.ts";
import {useLessonTasksReview, useQuizResults, useQuizSessionDetail} from "../../api/lessonReview/useLessonReview.ts";
import {Button} from "../ui/button.tsx";
import {
    BarChart3, 
    ChevronRight, 
    User, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    LoaderCircle,
    PieChart,
    ArrowLeft,
    Monitor
} from "lucide-react";
import {Lesson} from "../../types/types.ts";
import moment from "moment";

export default function QuizAnalyticsSection({courseId}: { courseId: string }) {
    const {data: modules, isLoading: isModulesLoading} = useGetModules(courseId);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    // Flatten all lessons from modules
    const allLessons = modules?.flatMap(m => (m as any).lessons as Lesson[]) || [];

    const handleSelectLesson = (lessonId: string) => {
        setSelectedLessonId(lessonId);
        setSelectedTaskId(null);
        setSelectedSessionId(null);
    };

    if (selectedSessionId) {
        return <QuizSessionDetailView sessionId={selectedSessionId} onBack={() => setSelectedSessionId(null)} />;
    }

    return (
        <div className="flex flex-col h-full min-h-[700px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                {/* Lesson Sidebar */}
                <div className="lg:col-span-4 border-r border-slate-100 p-6 bg-slate-50/30">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Quiz Intelligence</h3>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Select evaluation module</p>
                    </div>

                    <div className="space-y-2">
                        {isModulesLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
                            ))
                        ) : allLessons.length > 0 ? (
                            allLessons.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => handleSelectLesson(lesson.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                                        selectedLessonId === lesson.id 
                                        ? "bg-white shadow-xl shadow-slate-200/50 border border-slate-200 text-blue-600" 
                                        : "hover:bg-white hover:shadow-md text-slate-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl transition-colors ${selectedLessonId === lesson.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                            <PieChart className="w-4 h-4 stroke-[2.5]" />
                                        </div>
                                        <span className="text-sm font-bold truncate max-w-[180px]">{lesson.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedLessonId === lesson.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-400">No lessons available.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="lg:col-span-8 p-8 flex flex-col">
                    {selectedLessonId ? (
                        <QuizTasksList 
                            lessonId={selectedLessonId} 
                            onSelectTask={setSelectedTaskId} 
                            selectedTaskId={selectedTaskId} 
                            onSelectSession={setSelectedSessionId}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                                <BarChart3 className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-2">Performance Metrics</h4>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto">Analyze quiz results, tracking student progress and identifying areas for curriculum optimization.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function QuizTasksList({lessonId, onSelectTask, selectedTaskId, onSelectSession}: { lessonId: string, onSelectTask: (id: string) => void, selectedTaskId: string | null, onSelectSession: (id: string) => void }) {
    const {data: tasks, isLoading: isTasksLoading} = useLessonTasksReview(lessonId);
    
    // Filter only QUIZ tasks
    const quizTasks = tasks?.filter(t => t.type === "QUIZ") || [];

    if (isTasksLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <LoaderCircle className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregating Results...</p>
            </div>
        );
    }

    if (quizTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 bg-slate-50 border border-slate-100 rounded-[40px]">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="text-lg font-black text-slate-900 mb-1">Zero Assessments</h4>
                <p className="text-slate-400 text-sm font-medium">No quizzes have been created for this lesson yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 flex flex-col h-full">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
                {quizTasks.map((task) => (
                    <button
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                            selectedTaskId === task.id ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                        {task.title}
                    </button>
                ))}
            </div>

            {selectedTaskId ? (
                <QuizResults taskId={selectedTaskId} onSelectSession={onSelectSession} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <Monitor className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Select assessment to audit</p>
                </div>
            )}
        </div>
    );
}

function QuizResults({taskId, onSelectSession}: { taskId: string, onSelectSession: (id: string) => void }) {
    const {data: results, isLoading} = useQuizResults(taskId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 border border-slate-100 rounded-[32px] bg-white">
                <p className="text-slate-400 font-medium">No results recorded for this quiz.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Summary statistics ({results.length} attempts)</h5>

            <div className="grid grid-cols-1 gap-4">
                {results.map((res) => (
                    <div 
                        key={res.sessionId}
                        onClick={() => onSelectSession(res.sessionId)}
                        className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
                                {res.studentName?.charAt(0) || "S"}
                            </div>
                            <div>
                                <h6 className="font-bold text-slate-900 mb-1">{res.studentName}</h6>
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {res.finishedAt ? moment(res.finishedAt).format("MMM D, HH:mm") : "Ongoing"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        {res.percentage}% Correct
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xl font-black text-slate-900 leading-none mb-1">{res.correct} / {res.total}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions Passed</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${res.percentage && res.percentage >= 80 ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : res.percentage && res.percentage >= 50 ? "bg-amber-500 shadow-lg shadow-amber-500/30" : "bg-rose-500 shadow-lg shadow-rose-500/30"}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuizSessionDetailView({sessionId, onBack}: { sessionId: string, onBack: () => void }) {
    const {data: detail, isLoading} = useQuizSessionDetail(sessionId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[700px]">
                <LoaderCircle className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Deconstructing Attempt...</p>
            </div>
        );
    }

    const summary = detail?.summary;

    return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="flex items-center justify-between">
                <Button onClick={onBack} variant="ghost" className="gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 font-black uppercase text-[10px] tracking-widest">
                    <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    Back to Overview
                </Button>
                <div className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20">
                    Performance Insight: {summary?.percentage}%
                </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[40px] p-10 flex items-center justify-between shadow-3xl overflow-hidden relative">
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-3xl font-black shadow-2xl">
                        {summary?.studentName?.charAt(0) || "S"}
                    </div>
                    <div>
                        <h4 className="text-3xl font-black tracking-tight mb-2">{summary?.studentName}</h4>
                        <div className="flex items-center gap-6 opacity-60 text-[10px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Student Profile</span>
                            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Attempt ID: {sessionId.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-10 text-right">
                    <div>
                        <p className="text-4xl font-black text-emerald-400">{summary?.correct}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Correct</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-rose-400">{summary?.wrong}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Incorrect</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-blue-400">{summary?.total}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Out of</p>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="space-y-6">
                <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-blue-600 pl-4 ml-2">Question Audit</h5>
                <div className="grid grid-cols-1 gap-6">
                    {detail?.questions.map((q, i) => (
                        <div key={i} className={`p-8 rounded-[32px] border transition-all duration-300 ${q.correct ? "bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50" : "bg-rose-50/30 border-rose-100 hover:bg-rose-50/50"}`}>
                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${q.correct ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                                            Question {q.orderIndex}
                                        </span>
                                        {q.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                                    </div>
                                    <p className="text-xl font-bold text-slate-800 leading-tight">{q.questionText}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                        {[
                                            {id: 'A', text: q.optionA},
                                            {id: 'B', text: q.optionB},
                                            {id: 'C', text: q.optionC},
                                            {id: 'D', text: q.optionD}
                                        ].filter(o => o.text).map(opt => (
                                            <div key={opt.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                                opt.id === q.correctOption 
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-900" 
                                                : opt.id === q.selectedOption 
                                                ? "bg-rose-50 border-rose-500 text-rose-900 shadow-md" 
                                                : "bg-white border-slate-100 text-slate-400 opacity-60"
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black">{opt.id}</span>
                                                    <span className="text-sm font-bold">{opt.text}</span>
                                                </div>
                                                {opt.id === q.correctOption && <CheckCircle2 className="w-4 h-4" />}
                                                {opt.id === q.selectedOption && opt.id !== q.correctOption && <XCircle className="w-4 h-4" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
