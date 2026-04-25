import {useState} from "react";
import {useGetModules} from "../../api/module/useModule.ts";
import {useLessonTasksReview, useHomeworkSubmissions, useReviewHomeworkSubmission, useDownloadAttachment} from "../../api/lessonReview/useLessonReview.ts";
import {Button} from "../ui/button.tsx";
import {
    ClipboardCheck, 
    ChevronRight, 
    User, 
    Calendar, 
    FileText, 
    Download, 
    CheckCircle2, 
    AlertCircle,
    LoaderCircle,
    Star
} from "lucide-react";
import {Lesson, Module} from "../../types/types.ts";
import {HomeworkSubmissionReview} from "../../api/lessonReview/lessonReviewApi.ts";
import moment from "moment";

export default function HomeworkReviewSection({courseId}: { courseId: string }) {
    const {data: modules, isLoading: isModulesLoading} = useGetModules(courseId);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Flatten all lessons from modules
    const allLessons = ((modules as Array<Module & {lessons?: Lesson[]}> | undefined)
        ?.flatMap((module: Module & {lessons?: Lesson[]}) => module.lessons || [])) || [];

    const handleSelectLesson = (lessonId: string) => {
        setSelectedLessonId(lessonId);
        setSelectedTaskId(null);
    };

    return (
        <div className="flex flex-col h-full min-h-[700px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                {/* Lesson Explorer */}
                <div className="lg:col-span-4 border-r border-slate-100 p-6 bg-slate-50/30">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Homework Explorer</h3>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Select lesson to review</p>
                    </div>

                    <div className="space-y-2">
                        {isModulesLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
                            ))
                        ) : allLessons.length > 0 ? (
                            allLessons.map((lesson: Lesson) => (
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
                                            <ClipboardCheck className="w-4 h-4 stroke-[2.5]" />
                                        </div>
                                        <span className="text-sm font-bold truncate max-w-[180px]">{lesson.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedLessonId === lesson.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-400">No lessons defined yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="lg:col-span-8 p-8 flex flex-col">
                    {selectedLessonId ? (
                        <SubmissionsList lessonId={selectedLessonId} onSelectTask={setSelectedTaskId} selectedTaskId={selectedTaskId} />
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 border border-slate-100">
                                <ClipboardCheck className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-2">Review Submissions</h4>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto">Select a lesson from the left explorer to manage homework submissions and grade your students.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SubmissionsList({lessonId, onSelectTask, selectedTaskId}: { lessonId: string, onSelectTask: (id: string) => void, selectedTaskId: string | null }) {
    const {data: tasks, isLoading: isTasksLoading} = useLessonTasksReview(lessonId);
    
    // Filter only HOMEWORK tasks
    const homeworkTasks = tasks?.filter((task) => task.type === "HOMEWORK") || [];

    if (isTasksLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <LoaderCircle className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Tasks...</p>
            </div>
        );
    }

    if (homeworkTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="text-lg font-black text-slate-900 mb-1">No Homework Found</h4>
                <p className="text-slate-400 text-sm font-medium">This lesson doesn't have any homework tasks assigned.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 flex flex-col h-full">
            {/* Task Selector inside Lesson */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 custom-scrollbar">
                {homeworkTasks.map((task) => (
                    <button
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className={`shrink-0 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                            selectedTaskId === task.id ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                        {task.title}
                    </button>
                ))}
            </div>

            {selectedTaskId ? (
                <TaskSubmissions taskId={selectedTaskId} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <FileText className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Select task to view submissions</p>
                </div>
            )}
        </div>
    );
}

function TaskSubmissions({taskId}: { taskId: string }) {
    const {data: submissions, isLoading} = useHomeworkSubmissions(taskId);
    const [reviewingSubmissionId, setReviewingSubmissionId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            </div>
        );
    }

    if (!submissions || submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 border border-slate-100 rounded-[32px] bg-white">
                <User className="w-12 h-12 text-slate-200 mb-4" />
                <h4 className="text-lg font-black text-slate-900 mb-1">No Submissions Yet</h4>
                <p className="text-slate-400 text-sm font-medium">Students haven't submitted their work for this task yet.</p>
            </div>
        );
    }

    const currentReviewing = submissions.find((submission) => submission.submissionId === reviewingSubmissionId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity ({submissions.length})</h5>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {submissions.map((submission) => (
                    <div 
                        key={submission.submissionId}
                        className="bg-white border border-slate-100 rounded-[32px] p-6 flex items-center justify-between group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h6 className="font-black text-slate-900 text-lg leading-none mb-2">{submission.studentName}</h6>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {submission.submittedAt ? moment(submission.submittedAt).format("MMM D, HH:mm") : "Just now"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="w-3 h-3" />
                                        {submission.attachmentIds.length} Files
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {submission.reviewedAt ? (
                                <div className="flex items-center gap-4 px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-1 text-emerald-600 font-black">
                                        <Star className="w-4 h-4 fill-emerald-600" />
                                        <span className="text-lg">{submission.score || 0}</span>
                                    </div>
                                    <div className="h-4 w-px bg-emerald-200" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Graded</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                </div>
                            )}
                            
                            <Button 
                                onClick={() => setReviewingSubmissionId(submission.submissionId)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Review Work
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {reviewingSubmissionId && currentReviewing && (
                <ReviewModal 
                    submission={currentReviewing} 
                    onClose={() => setReviewingSubmissionId(null)} 
                    taskId={taskId}
                />
            )}
        </div>
    );
}

function ReviewModal({submission, onClose, taskId}: { submission: HomeworkSubmissionReview, onClose: () => void, taskId: string }) {
    const {mutateAsync: review, isPending} = useReviewHomeworkSubmission(taskId);
    const {mutateAsync: download} = useDownloadAttachment();
    
    const [score, setScore] = useState<number>(submission.score || 0);
    const [feedback, setFeedback] = useState<string>(submission.feedback || "");
    const [revisionRequested, setRevisionRequested] = useState(false);

    const handleSave = async () => {
        await review({
            submissionId: submission.submissionId,
            score,
            feedback,
            revisionRequested
        });
        onClose();
    };

    const handleDownload = async (id: string) => {
        const blob = await download(id);
        const url = window.URL.createObjectURL(blob as Blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `homework-file-${id}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Reviewing Work</h4>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{submission.studentName} • {submission.taskTitle}</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 group transition-all">
                        <AlertCircle className="w-6 h-6 rotate-45 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    {/* Student Message */}
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Submission</h5>
                        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                            <p className="text-lg text-slate-700 font-medium leading-relaxed italic">
                                "{submission.comment || "No comment provided by student."}"
                            </p>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attached Evidence ({submission.attachmentIds.length})</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {submission.attachmentIds.map((id: string, idx: number) => (
                                <button 
                                    key={id}
                                    onClick={() => handleDownload(id)}
                                    className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">document_file_0{idx + 1}.pdf</span>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grading Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-slate-100">
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evaluation Metrics</h5>
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-600">Performance Score (0-100)</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={score} 
                                        onChange={(e) => setScore(Number(e.target.value))}
                                        className="flex-1 h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <span className="w-20 text-center py-2 bg-blue-600 text-white rounded-xl font-black text-lg shadow-xl shadow-blue-500/20">{score}</span>
                                </div>
                            </div>
                            
                            <label className="flex items-center gap-3 p-5 bg-slate-50 border border-slate-100 rounded-3xl cursor-pointer hover:bg-white hover:shadow-md transition-all">
                                <input 
                                    type="checkbox" 
                                    checked={revisionRequested} 
                                    onChange={(e) => setRevisionRequested(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <p className="text-sm font-black text-slate-900 leading-none mb-1">Request Revision</p>
                                    <p className="text-[10px] font-bold text-slate-400 leading-none">Student must re-submit their work</p>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Constructive Feedback</h5>
                            <textarea 
                                value={feedback} 
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Enter detailed feedback to help the student improve..."
                                className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-[32px] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700 placeholder:text-slate-300 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4 shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-5 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all"
                    >
                        Cancel Review
                    </button>
                    <Button 
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/20 font-black uppercase tracking-[0.15em] text-[10px] flex items-center gap-2"
                    >
                        {isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Finalize Assessment
                    </Button>
                </div>
            </div>
        </div>
    );
}
