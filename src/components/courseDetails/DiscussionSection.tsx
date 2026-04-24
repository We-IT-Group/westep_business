import {useState} from "react";
import {useGetModules} from "../../api/module/useModule.ts";
import {useLessonDiscussions, useReplyDiscussion} from "../../api/lessonReview/useLessonReview.ts";
import {Button} from "../ui/button.tsx";
import {
    MessageSquare, 
    ChevronRight, 
    User, 
    Calendar, 
    Send, 
    Reply, 
    LoaderCircle,
    MessageCircle,
    Inbox
} from "lucide-react";
import {Lesson} from "../../types/types.ts";
import moment from "moment";

export default function DiscussionSection({courseId}: { courseId: string }) {
    const {data: modules, isLoading: isModulesLoading} = useGetModules(courseId);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

    // Flatten all lessons from modules
    const allLessons = modules?.flatMap(m => (m as any).lessons as Lesson[]) || [];

    return (
        <div className="flex flex-col h-full min-h-[700px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                {/* Lesson Sidebar */}
                <div className="lg:col-span-4 border-r border-slate-100 p-6 bg-slate-50/30">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Internal Discussions</h3>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Select lesson segment</p>
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
                                    onClick={() => setSelectedLessonId(lesson.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                                        selectedLessonId === lesson.id 
                                        ? "bg-white shadow-xl shadow-slate-200/50 border border-slate-200 text-blue-600" 
                                        : "hover:bg-white hover:shadow-md text-slate-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl transition-colors ${selectedLessonId === lesson.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                            <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                                        </div>
                                        <span className="text-sm font-bold truncate max-w-[180px]">{lesson.name}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedLessonId === lesson.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-400">Curriculum is empty.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Discussion Thread Area */}
                <div className="lg:col-span-8 p-8 flex flex-col">
                    {selectedLessonId ? (
                        <ThreadsList lessonId={selectedLessonId} />
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 border border-slate-100">
                                <MessageSquare className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 mb-2">Student Conversations</h4>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto">Engage with your students, answer their questions, and build a thriving learning community.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ThreadsList({lessonId}: { lessonId: string }) {
    const {data: threads, isLoading} = useLessonDiscussions(lessonId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <LoaderCircle className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Listening for data...</p>
            </div>
        );
    }

    if (!threads || threads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                <Inbox className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="text-lg font-black text-slate-900 mb-1">Silence is Golden</h4>
                <p className="text-slate-400 text-sm font-medium">No discussions have started for this lesson yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between">
                <h5 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{threads.length} Active Threads</h5>
            </div>

            <div className="space-y-6">
                {threads.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} lessonId={lessonId} />
                ))}
            </div>
        </div>
    );
}

function ThreadCard({thread, lessonId}: { thread: any, lessonId: string }) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const {mutateAsync: sendReply, isPending} = useReplyDiscussion(lessonId);

    const handleSendReply = async () => {
        if (!replyContent.trim()) return;
        await sendReply({commentId: thread.id, content: replyContent});
        setReplyContent("");
        setIsReplying(false);
    };

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h6 className="font-black text-slate-900 text-lg leading-none mb-1.5">{thread.author}</h6>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Calendar className="w-3 h-3 text-blue-500" />
                                {moment(thread.createdAt).format("MMM D, HH:mm")}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                    <p className="text-slate-700 font-medium leading-relaxed">{thread.content}</p>
                </div>

                <div className="space-y-6">
                    {thread.replies && thread.replies.length > 0 && (
                        <div className="space-y-4 ml-6 pl-6 border-l-2 border-slate-100">
                            {thread.replies.map((reply: any) => (
                                <div key={reply.id} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-900">{reply.author}</span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{moment(reply.createdAt).format("MMM D")}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm italic leading-relaxed">
                                        &quot;{reply.content}&quot;
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end">
                        {!isReplying ? (
                            <button 
                                onClick={() => setIsReplying(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                                <Reply className="w-3.5 h-3.5" />
                                Post Response
                            </button>
                        ) : (
                            <div className="w-full space-y-4 p-6 bg-slate-50 rounded-[32px] border border-blue-100 animate-in zoom-in-95 duration-300">
                                <textarea 
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Draft your professional response..."
                                    className="w-full h-24 p-5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-700 outline-none resize-none"
                                    autoFocus
                                />
                                <div className="flex items-center justify-end gap-3">
                                    <button 
                                        onClick={() => setIsReplying(false)}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 px-4"
                                    >
                                        Dismiss
                                    </button>
                                    <Button 
                                        onClick={handleSendReply}
                                        disabled={isPending || !replyContent.trim()}
                                        className="bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl gap-2 font-black text-[10px] uppercase tracking-[0.2em]"
                                    >
                                        {isPending ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        Submit Reply
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
