import {FormEvent, useEffect, useMemo, useState} from "react";
import moment from "moment";
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Edit3,
    Inbox,
    LoaderCircle,
    MessageCircle,
    MessageSquare,
    MessageSquareReply,
    Plus,
    Reply,
    Send,
    Star,
    Trash2,
    User,
} from "lucide-react";
import {Lesson, Module} from "../../types/types.ts";
import {useGetModules} from "../../api/module/useModule.ts";
import {
    isLessonQuizManagerRole,
    isStudentRole,
    useUser,
} from "../../api/auth/useAuth.ts";
import type {
    DiscussionCommentDto,
    LessonReviewResponse,
} from "../../api/lessonReview/lessonReviewApi.ts";
import {
    useCreateDiscussion,
    useCreateLessonReview,
    useDeleteDiscussion,
    useLessonDiscussionsPage,
    useLessonReviewsPage,
    useReplyDiscussion,
    useUpdateDiscussion,
    useUpdateMyLessonReview,
} from "../../api/lessonReview/useLessonReview.ts";
import type {DiscussionInboxThreadDetail, DiscussionInboxThreadListItem} from "../../api/discussionInbox/discussionInboxApi.ts";
import {
    useCourseDiscussionInbox,
    useCourseDiscussionThreadDetails,
    useCourseDiscussionUnreadCount,
    useReadCourseDiscussionThread,
    useReplyCourseDiscussionThread,
} from "../../api/discussionInbox/useDiscussionInbox.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs.tsx";
import {Button} from "../ui/button.tsx";
import {Textarea} from "../ui/textarea.tsx";
import {Badge} from "../ui/badge.tsx";

type ModuleWithLessons = Module & {lessons?: Lesson[]};

const DISCUSSION_PAGE_SIZE = 20;
const REVIEW_PAGE_SIZE = 10;

const formatDate = (value?: string) => {
    if (!value) return "No date";
    return moment(value).isValid() ? moment(value).format("MMM D, HH:mm") : value;
};

const truncateText = (value: string | undefined, maxLength: number) => {
    const normalized = (value || "").trim();
    if (!normalized) return "Oxirgi xabar yo‘q";
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
                {icon}
            </div>
            <h4 className="mt-4 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">{title}</h4>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

function LoadingState({label}: {label: string}) {
    return (
        <div className="flex min-h-[220px] items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white/90 p-8 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin text-blue-600"/>
            {label}
        </div>
    );
}

function Pager({
    page,
    totalPages,
    onPrev,
    onNext,
}: {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}) {
    return (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Sahifa {page + 1} / {Math.max(totalPages, 1)}
            </p>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onPrev} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4"/>
                    Oldingi
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onNext} disabled={page + 1 >= totalPages}>
                    Keyingi
                    <ChevronRight className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}

export default function DiscussionSection({courseId}: { courseId: string }) {
    const {data: user} = useUser();
    const {data: modules, isLoading: isModulesLoading} = useGetModules(courseId);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const canModerate = isLessonQuizManagerRole(user?.roleName);
    const isStudent = isStudentRole(user?.roleName);

    const allLessons = useMemo(
        () => ((modules as ModuleWithLessons[] | undefined)?.flatMap((module) => module.lessons || [])) || [],
        [modules],
    );

    useEffect(() => {
        if (!selectedLessonId && allLessons[0]?.id) {
            setSelectedLessonId(allLessons[0].id);
        }
    }, [allLessons, selectedLessonId]);

    return (
        <div className="min-h-[760px] rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
            {canModerate && !isStudent ? (
                <CourseDiscussionManagerPanel
                    courseId={courseId}
                    currentUserName={`${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "Teacher"}
                />
            ) : null}

            {canModerate && !isStudent ? null : (
            <div className="grid h-full grid-cols-1 lg:grid-cols-12">
                <div className="bg-slate-50/30 p-6 lg:col-span-4 lg:border-r lg:border-slate-100 dark:bg-slate-950 dark:lg:border-slate-800">
                    <div className="mb-6">
                        <h3 className="mb-2 text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">Internal Discussions</h3>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Select lesson segment</p>
                    </div>

                    <div className="space-y-2">
                        {isModulesLoading ? (
                            Array.from({length: 5}).map((_, index) => (
                                <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"/>
                            ))
                        ) : allLessons.length > 0 ? (
                            allLessons.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => setSelectedLessonId(lesson.id)}
                                    className={`w-full rounded-2xl p-4 text-left transition-all ${
                                        selectedLessonId === lesson.id
                                            ? "border border-slate-200 bg-white text-blue-600 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-950"
                                            : "text-slate-500 hover:bg-white hover:shadow-md dark:text-slate-400 dark:hover:bg-slate-950"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className={`rounded-xl p-2 ${selectedLessonId === lesson.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500"}`}>
                                                <MessageCircle className="h-4 w-4 stroke-[2.5]"/>
                                            </div>
                                            <span className="truncate text-sm font-bold">{lesson.name}</span>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 ${selectedLessonId === lesson.id ? "translate-x-1" : "opacity-0"}`}/>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <EmptyState
                                icon={<Inbox className="h-7 w-7"/>}
                                title="Curriculum bo‘sh"
                                description="Muhokama yoki review ko‘rish uchun avval lesson bo‘lishi kerak."
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col p-8 lg:col-span-8 dark:bg-slate-950">
                    {selectedLessonId ? (
                        <LessonEngagementPanel
                            lessonId={selectedLessonId}
                            canModerate={canModerate}
                            isStudent={isStudent}
                            currentUserId={user?.id}
                        />
                    ) : (
                        <EmptyState
                            icon={<MessageSquare className="h-7 w-7"/>}
                            title="Lesson tanlanmagan"
                            description="Chap tomondan lesson tanlang. Student message, reply va reviewlar shu yerda ochiladi."
                        />
                    )}
                </div>
            </div>
            )}
        </div>
    );
}

function CourseDiscussionManagerPanel({
    courseId,
    currentUserName,
}: {
    courseId: string;
    currentUserName: string;
}) {
    const [page, setPage] = useState(0);
    const [selectedConversationKey, setSelectedConversationKey] = useState<string | null>(null);
    const [replyTargetThreadId, setReplyTargetThreadId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
    const inboxQuery = useCourseDiscussionInbox(courseId, page, DISCUSSION_PAGE_SIZE);
    const unreadCountQuery = useCourseDiscussionUnreadCount(courseId);
    const replyMutation = useReplyCourseDiscussionThread(courseId, page, DISCUSSION_PAGE_SIZE);
    const readMutation = useReadCourseDiscussionThread(courseId, page, DISCUSSION_PAGE_SIZE);
    const groupedConversations = useMemo(() => {
        const grouped = new Map<string, {
            key: string;
            student: DiscussionInboxThreadListItem["student"];
            lessonName?: string;
            unreadCount: number;
            unread: boolean;
            lastMessage?: string;
            lastMessageAt?: string;
            items: DiscussionInboxThreadListItem[];
        }>();

        (inboxQuery.data?.items || []).forEach((item) => {
            const key = `${item.student.id || item.student.fullName}-${item.lessonId || item.lessonName || "lesson"}`;
            const current = grouped.get(key);

            if (!current) {
                grouped.set(key, {
                    key,
                    student: item.student,
                    lessonName: item.lessonName,
                    unreadCount: item.unreadCount,
                    unread: item.unread,
                    lastMessage: item.lastMessage,
                    lastMessageAt: item.lastMessageAt,
                    items: [item],
                });
                return;
            }

            current.items.push(item);
            current.unreadCount += item.unreadCount;
            current.unread = current.unread || item.unread;

            const currentTime = new Date(current.lastMessageAt || 0).getTime();
            const nextTime = new Date(item.lastMessageAt || 0).getTime();
            if (nextTime >= currentTime) {
                current.lastMessage = item.lastMessage;
                current.lastMessageAt = item.lastMessageAt;
            }
        });

        return Array.from(grouped.values())
            .map((conversation) => ({
                ...conversation,
                items: [...conversation.items].sort(
                    (left, right) => new Date(left.lastMessageAt || 0).getTime() - new Date(right.lastMessageAt || 0).getTime(),
                ),
            }))
            .sort((left, right) => new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime());
    }, [inboxQuery.data?.items]);
    const selectedConversation = useMemo(
        () => groupedConversations.find((conversation) => conversation.key === selectedConversationKey) || null,
        [groupedConversations, selectedConversationKey],
    );
    const filteredConversations = useMemo(() => {
        if (statusFilter === "unread") {
            return groupedConversations.filter((conversation) => conversation.unread);
        }

        if (statusFilter === "read") {
            return groupedConversations.filter((conversation) => !conversation.unread);
        }

        return groupedConversations;
    }, [groupedConversations, statusFilter]);
    const replyTarget = useMemo(
        () => selectedConversation?.items.find((item) => item.threadId === replyTargetThreadId) || null,
        [replyTargetThreadId, selectedConversation],
    );
    const conversationThreadDetails = useCourseDiscussionThreadDetails(
        courseId,
        selectedConversation?.items.map((item) => item.threadId),
    );
    const isConversationDetailsLoading = selectedConversation
        ? conversationThreadDetails.some((query) => query.isLoading)
        : false;
    const conversationDetailsError = selectedConversation
        ? conversationThreadDetails.find((query) => query.isError)?.error
        : null;
    const selectedConversationDetails = useMemo(() => {
        if (!selectedConversation) return [];

        const detailsByThreadId = new Map<string, DiscussionInboxThreadDetail>();
        conversationThreadDetails.forEach((query) => {
            if (query.data) {
                detailsByThreadId.set(query.data.threadId, query.data);
            }
        });

        return selectedConversation.items.map((item) => ({
            item,
            detail: detailsByThreadId.get(item.threadId),
        }));
    }, [conversationThreadDetails, selectedConversation]);

    useEffect(() => {
        if (!selectedConversation) return;
        selectedConversation.items.forEach((item) => {
            if (item.unread && !readMutation.isPending) {
                readMutation.mutate(item.threadId);
            }
        });
    }, [readMutation, selectedConversation]);

    const handleThreadSelect = (conversationKey: string) => {
        const conversation = groupedConversations.find((item) => item.key === conversationKey);
        if (!conversation) return;
        setSelectedConversationKey(conversationKey);
        setReplyTargetThreadId(conversation.items[conversation.items.length - 1]?.threadId || null);
        setReplyDraft("");
    };

    const handleReplySubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!replyTargetThreadId || !replyDraft.trim()) return;
        await replyMutation.mutateAsync({threadId: replyTargetThreadId, content: replyDraft.trim()});
        setReplyDraft("");
    };

    const totalThreads = inboxQuery.data?.totalThreads ?? 0;
    const unreadCount = unreadCountQuery.data ?? inboxQuery.data?.unreadCount ?? 0;

    return (
        <div className="space-y-6">
            {inboxQuery.isLoading ? (
                <LoadingState label="Discussion inbox yuklanmoqda..."/>
            ) : inboxQuery.isError ? (
                <EmptyState
                    icon={<AlertCircle className="h-7 w-7"/>}
                    title="Discussion yuklanmadi"
                    description={parseApiError(inboxQuery.error).message}
                />
            ) : !inboxQuery.data?.items.length ? (
                <EmptyState
                    icon={<Inbox className="h-7 w-7"/>}
                    title="Comment yo‘q"
                    description="Bu kurs bo‘yicha hali discussion yozilmagan."
                />
            ) : selectedConversation ? (
                isConversationDetailsLoading ? (
                    <LoadingState label="Discussion detallar yuklanmoqda..."/>
                ) : conversationDetailsError ? (
                    <EmptyState
                        icon={<AlertCircle className="h-7 w-7"/>}
                        title="Discussion detali ochilmadi"
                        description={parseApiError(conversationDetailsError).message}
                    />
                ) : (
                    <DiscussionInboxDetailView
                        conversation={selectedConversation}
                        conversationDetails={selectedConversationDetails}
                        currentUserName={currentUserName}
                        replyTarget={replyTarget}
                        replyDraft={replyDraft}
                        onReplyDraftChange={setReplyDraft}
                        onBack={() => {
                            setSelectedConversationKey(null);
                            setReplyTargetThreadId(null);
                            setReplyDraft("");
                        }}
                        onSelectReplyTarget={setReplyTargetThreadId}
                        onSubmit={handleReplySubmit}
                        isReplying={replyMutation.isPending}
                    />
                )
            ) : (
                <DiscussionInboxTable
                    threads={filteredConversations}
                    totalThreads={totalThreads}
                    unreadCount={unreadCount}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onSelect={handleThreadSelect}
                />
            )}

            {filteredConversations.length ? (
                <div className="space-y-4">
                    <Pager
                        page={page}
                        totalPages={Math.max(Math.ceil(((inboxQuery.data?.totalThreads || 0) / (inboxQuery.data?.size || DISCUSSION_PAGE_SIZE))), 1)}
                        onPrev={() => setPage(Math.max(page - 1, 0))}
                        onNext={() => setPage(page + 1)}
                    />
                </div>
            ) : null}
        </div>
    );
}

function DiscussionInboxTable({
    threads,
    totalThreads,
    unreadCount,
    statusFilter,
    onStatusFilterChange,
    onSelect,
}: {
    threads: Array<{
        key: string;
        student: DiscussionInboxThreadListItem["student"];
        lessonName?: string;
        unreadCount: number;
        unread: boolean;
        lastMessage?: string;
        lastMessageAt?: string;
        items: DiscussionInboxThreadListItem[];
    }>;
    totalThreads: number;
    unreadCount: number;
    statusFilter: "all" | "unread" | "read";
    onStatusFilterChange: (value: "all" | "unread" | "read") => void;
    onSelect: (conversationKey: string) => void;
}) {
    return (
        <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="overflow-x-auto">
                <div className="min-w-[1100px] px-4 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-2 py-4 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant={statusFilter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onStatusFilterChange("all")}
                                className={statusFilter === "all" ? "rounded-2xl bg-slate-900 text-white hover:bg-slate-800" : "rounded-2xl"}
                            >
                                Barchasi
                            </Button>
                            <Button
                                type="button"
                                variant={statusFilter === "unread" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onStatusFilterChange("unread")}
                                className={statusFilter === "unread" ? "rounded-2xl bg-blue-600 text-white hover:bg-blue-700" : "rounded-2xl"}
                            >
                                O‘qilmagan
                            </Button>
                            <Button
                                type="button"
                                variant={statusFilter === "read" ? "default" : "outline"}
                                size="sm"
                                onClick={() => onStatusFilterChange("read")}
                                className={statusFilter === "read" ? "rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700" : "rounded-2xl"}
                            >
                                O‘qilgan
                            </Button>
                        </div>
                        <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white dark:bg-slate-100 dark:text-slate-950">
                            {totalThreads} thread
                        </Badge>
                        <Badge className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                            {unreadCount} o‘qilmagan
                        </Badge>
                    </div>
                    <div className="grid grid-cols-[1.8fr_1.2fr_1.8fr_0.9fr_1fr] gap-4 px-2 py-5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                            <span>O‘quvchi</span>
                            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                                {threads.length}
                            </span>
                        </div>
                        <div>Lesson</div>
                        <div>Oxirgi xabar</div>
                        <div>Holat</div>
                        <div>Sana</div>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {threads.map((thread) => (
                            <button
                                key={thread.key}
                                type="button"
                                onClick={() => onSelect(thread.key)}
                                className="grid w-full grid-cols-[1.8fr_1.2fr_1.8fr_0.9fr_1fr] gap-4 rounded-2xl px-2 py-6 text-left transition hover:bg-white/70 dark:hover:bg-white/[0.03]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white">
                                        {thread.student.fullName.trim().charAt(0).toUpperCase() || "S"}
                                        {thread.unread ? (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-950" />
                                        ) : (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#48bf45] ring-2 ring-white dark:ring-slate-950" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{thread.student.fullName}</div>
                                    </div>
                                </div>

                                <div className="self-center">
                                    <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                                        {thread.lessonName || "-"}
                                    </div>
                                </div>

                                <div className="self-center">
                                    <div className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {truncateText(thread.lastMessage, 30)}
                                    </div>
                                </div>

                                <div className="self-center">
                                    {thread.unread ? (
                                        <div className="flex items-center gap-3">
                                            <span className="h-7 w-7 rounded-full bg-blue-600" />
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{thread.unreadCount || 1} o‘qilmagan</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-semibold text-emerald-600">O‘qilgan</div>
                                    )}
                                </div>

                                <div className="self-center">
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatDate(thread.lastMessageAt)}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DiscussionInboxDetailView({
    conversation,
    conversationDetails,
    currentUserName,
    replyTarget,
    replyDraft,
    onReplyDraftChange,
    onBack,
    onSelectReplyTarget,
    onSubmit,
    isReplying,
}: {
    conversation: {
        student: DiscussionInboxThreadListItem["student"];
        lessonName?: string;
        unread: boolean;
        items: DiscussionInboxThreadListItem[];
    };
    conversationDetails: Array<{
        item: DiscussionInboxThreadListItem;
        detail?: DiscussionInboxThreadDetail;
    }>;
    currentUserName: string;
    replyTarget: DiscussionInboxThreadListItem | null;
    replyDraft: string;
    onReplyDraftChange: (value: string) => void;
    onBack: () => void;
    onSelectReplyTarget: (threadId: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    isReplying: boolean;
}) {
    return (
        <div className="space-y-5 px-5">
            <section className="rounded-[26px] border border-slate-200 bg-white/88 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_18px_40px_rgba(2,6,23,0.38)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Button type="button" variant="outline" size="sm" onClick={onBack} className="rounded-xl">
                            <ChevronLeft className="h-4 w-4"/>
                            Orqaga
                        </Button>
                        <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{conversation.student.fullName}</h3>
                        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            {conversation.lessonName || "Lesson nomi yo‘q"} ostidagi barcha fikrlar shu yerda guruhlangan. Xohlagan xabarga javob berib reply yozasiz.
                        </p>
                    </div>
                    <Badge className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                        conversation.unread
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    }`}>
                        {conversation.unread ? "O‘qilmagan" : "O‘qilgan"}
                    </Badge>
                </div>
            </section>

            <div className="space-y-5">
                {conversationDetails.map(({item, detail}, index) => {
                    const topLevelAuthorName = conversation.student.fullName;
                    const replies = detail?.messages.filter((message) => message.messageId !== detail.messages[0]?.messageId) || [];
                    const isReplyBoxOpen = replyTarget?.threadId === item.threadId;

                    return (
                    <article key={item.threadId} className="relative pl-20">
                        {index < conversationDetails.length - 1 ? (
                            <span className="absolute left-9 top-20 h-[calc(100%+1.25rem)] w-px bg-slate-200 dark:bg-slate-800" />
                        ) : null}
                        <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                            {topLevelAuthorName.trim().slice(0, 2).toUpperCase() || "ST"}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-base font-semibold uppercase tracking-tight text-slate-900 dark:text-slate-100">
                                {topLevelAuthorName}
                            </h4>
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-300/80 dark:text-slate-500/80">
                                {formatDate(item.lastMessageAt)}
                            </p>
                        </div>
                        <div className="mt-3 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_28px_rgba(148,163,184,0.10)] dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-[0_12px_28px_rgba(2,6,23,0.32)]">
                            <p className="text-base font-semibold leading-7 tracking-tight text-slate-600 dark:text-slate-200">
                                {item.lastMessage || "Xabar yo‘q"}
                            </p>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <Button
                                type="button"
                                variant={isReplyBoxOpen ? "default" : "outline"}
                                size="sm"
                                onClick={() => onSelectReplyTarget(isReplyBoxOpen ? "" : item.threadId)}
                                className={isReplyBoxOpen ? "rounded-2xl bg-blue-600 text-white shadow-sm hover:bg-blue-700" : "rounded-2xl border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/12 dark:text-blue-200 dark:hover:bg-blue-500/18"}
                            >
                                <Reply className="h-4 w-4"/>
                                Javob
                            </Button>
                        </div>
                        {isReplyBoxOpen ? (
                            <form onSubmit={onSubmit} className="mt-4 rounded-[24px] border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-[0_14px_30px_rgba(59,130,246,0.10)] dark:border-blue-500/30 dark:bg-slate-950/95 dark:from-slate-950 dark:to-blue-950/20">
                                <div className="rounded-[18px] border border-blue-100 bg-white px-4 py-3 dark:border-blue-500/25 dark:bg-slate-900">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
                                                {item.student.fullName} ga javob
                                            </p>
                                            <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">
                                                {item.lastMessage || "Xabar yo‘q"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onSelectReplyTarget("")}
                                            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        >
                                            <span className="sr-only">Yopish</span>
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <Textarea
                                    value={replyDraft}
                                    onChange={(event) => onReplyDraftChange(event.target.value)}
                                    placeholder={`${item.student.fullName} ga javob yozish...`}
                                    className="mt-4 min-h-[120px] rounded-[18px] border-slate-200 bg-white px-4 py-3 text-sm leading-6 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                                />
                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <p className="text-xs font-bold text-slate-400">{replyDraft.length} / 2000</p>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" onClick={() => onSelectReplyTarget("")} className="rounded-2xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                                            Bekor qilish
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isReplying || !replyDraft.trim()}
                                            className="rounded-2xl bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                                        >
                                            {isReplying ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                            Yuborish
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        ) : null}
                        {replies.length > 0 ? (
                            <div className="mt-4 space-y-4">
                                {replies.map((reply) => (
                                    <div key={reply.messageId} className="pl-10">
                                        <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(148,163,184,0.08)] dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-[0_10px_24px_rgba(2,6,23,0.28)]">
                                            <div className="rounded-[16px] border-l-4 border-blue-500 bg-blue-50/70 px-4 py-3 dark:bg-blue-950/45">
                                                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
                                                    {topLevelAuthorName}
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">
                                                    {item.lastMessage || "Xabar yo‘q"}
                                                </p>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {reply.authorName || currentUserName}
                                                </p>
                                                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-300/80 dark:text-slate-500/80">
                                                    {formatDate(reply.createdAt)}
                                                </p>
                                            </div>
                                            <p className="mt-2 text-base font-semibold leading-7 tracking-tight text-slate-600 dark:text-slate-200">
                                                {reply.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </article>
                    );
                })}
            </div>
        </div>
    );
}

function LessonEngagementPanel({
    lessonId,
    canModerate,
    isStudent,
    currentUserId,
}: {
    lessonId: string;
    canModerate: boolean;
    isStudent: boolean;
    currentUserId?: string;
}) {
    const [discussionPage, setDiscussionPage] = useState(0);
    const [reviewsPage, setReviewsPage] = useState(0);
    const [activeTab, setActiveTab] = useState<"discussion" | "reviews">("discussion");

    useEffect(() => {
        setDiscussionPage(0);
        setReviewsPage(0);
        setActiveTab("discussion");
    }, [lessonId]);

    return (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "discussion" | "reviews")} className="w-full">
            <TabsList className="mb-6 h-auto flex-wrap rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                <TabsTrigger value="discussion" className="gap-2 px-5 py-3">
                    <MessageSquareReply className="h-4 w-4"/>
                    Muhokamalar
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2 px-5 py-3">
                    <Star className="h-4 w-4"/>
                    Reviewlar
                </TabsTrigger>
            </TabsList>

            <TabsContent value="discussion" className="mt-0">
                <DiscussionThreadsPanel
                    lessonId={lessonId}
                    page={discussionPage}
                    onPageChange={setDiscussionPage}
                    canModerate={canModerate}
                    isStudent={isStudent}
                    currentUserId={currentUserId}
                />
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
                <LessonReviewsPanel
                    lessonId={lessonId}
                    page={reviewsPage}
                    onPageChange={setReviewsPage}
                    isStudent={isStudent}
                    currentUserId={currentUserId}
                />
            </TabsContent>
        </Tabs>
    );
}

function DiscussionThreadsPanel({
    lessonId,
    page,
    onPageChange,
    canModerate,
    isStudent,
    currentUserId,
}: {
    lessonId: string;
    page: number;
    onPageChange: (page: number) => void;
    canModerate: boolean;
    isStudent: boolean;
    currentUserId?: string;
}) {
    const discussionsQuery = useLessonDiscussionsPage(lessonId, page, DISCUSSION_PAGE_SIZE);
    const createDiscussionMutation = useCreateDiscussion(lessonId);
    const replyMutation = useReplyDiscussion(lessonId);
    const updateMutation = useUpdateDiscussion(lessonId);
    const deleteMutation = useDeleteDiscussion(lessonId);

    const [draft, setDraft] = useState("");
    const [openReplyId, setOpenReplyId] = useState<string | null>(null);
    const [replyDraft, setReplyDraft] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState("");

    const handleCreateDiscussion = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!draft.trim()) return;

        await createDiscussionMutation.mutateAsync({content: draft.trim()});
        setDraft("");
        onPageChange(0);
    };

    const openEdit = (commentId: string, content: string) => {
        setEditingId(commentId);
        setEditDraft(content);
        setOpenReplyId(null);
    };

    const saveEdit = async () => {
        if (!editingId || !editDraft.trim()) return;
        await updateMutation.mutateAsync({commentId: editingId, content: editDraft.trim()});
        setEditingId(null);
        setEditDraft("");
    };

    const handleDelete = async (commentId: string) => {
        const confirmed = window.confirm("Shu message o‘chirilsinmi?");
        if (!confirmed) return;
        await deleteMutation.mutateAsync(commentId);
    };

    const handleReply = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!openReplyId || !replyDraft.trim()) return;

        await replyMutation.mutateAsync({commentId: openReplyId, content: replyDraft.trim()});
        setReplyDraft("");
        setOpenReplyId(null);
    };

    return (
        <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Discussion</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Student fikrlari va replylar</h3>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            Student yangi message yozadi, thread ichida reply beradi. Staff student message’larini o‘qib reply va moderatsiya qiladi.
                        </p>
                    </div>
                    <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white dark:bg-slate-100 dark:text-slate-950">
                        {discussionsQuery.data?.totalElements ?? 0} thread
                    </Badge>
                </div>

                <form onSubmit={handleCreateDiscussion} className="mt-6 space-y-4">
                    <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={isStudent ? "Savolingiz yoki fikringizni yozing..." : "Yangi top-level discussion boshlash uchun yozing..."}
                        className="min-h-[120px] rounded-[24px] border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60"
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={createDiscussionMutation.isPending || !draft.trim()} className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700">
                            {createDiscussionMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}
                            Message yuborish
                        </Button>
                    </div>
                </form>
            </section>

            {discussionsQuery.isLoading ? (
                <LoadingState label="Discussionlar yuklanmoqda..."/>
            ) : discussionsQuery.isError ? (
                <EmptyState
                    icon={<AlertCircle className="h-7 w-7"/>}
                    title="Discussion yuklanmadi"
                    description={parseApiError(discussionsQuery.error).message}
                />
            ) : !discussionsQuery.data?.content.length ? (
                <EmptyState
                    icon={<Inbox className="h-7 w-7"/>}
                    title="Hozircha message yo‘q"
                    description="Bu lesson uchun discussion hali boshlanmagan."
                />
            ) : (
                <div className="space-y-4">
                    {discussionsQuery.data.content.map((thread) => (
                        <DiscussionCard
                            key={thread.id}
                            thread={thread}
                            canModerate={canModerate}
                            currentUserId={currentUserId}
                            openReplyId={openReplyId}
                            onOpenReply={(commentId) => {
                                setOpenReplyId((current) => current === commentId ? null : commentId);
                                setReplyDraft("");
                            }}
                            replyDraft={replyDraft}
                            onReplyDraftChange={setReplyDraft}
                            onReplySubmit={handleReply}
                            isReplying={replyMutation.isPending}
                            editingId={editingId}
                            editDraft={editDraft}
                            onOpenEdit={openEdit}
                            onEditDraftChange={setEditDraft}
                            onSaveEdit={saveEdit}
                            onCancelEdit={() => {
                                setEditingId(null);
                                setEditDraft("");
                            }}
                            isUpdating={updateMutation.isPending}
                            onDelete={handleDelete}
                            isDeleting={deleteMutation.isPending}
                        />
                    ))}

                    <Pager
                        page={page}
                        totalPages={discussionsQuery.data.totalPages}
                        onPrev={() => onPageChange(Math.max(page - 1, 0))}
                        onNext={() => onPageChange(page + 1)}
                    />
                </div>
            )}
        </div>
    );
}

function DiscussionCard({
    thread,
    canModerate,
    currentUserId,
    openReplyId,
    onOpenReply,
    replyDraft,
    onReplyDraftChange,
    onReplySubmit,
    isReplying,
    editingId,
    editDraft,
    onOpenEdit,
    onEditDraftChange,
    onSaveEdit,
    onCancelEdit,
    isUpdating,
    onDelete,
    isDeleting,
    showLessonMeta = false,
}: {
    thread: DiscussionCommentDto;
    canModerate: boolean;
    currentUserId?: string;
    openReplyId: string | null;
    onOpenReply: (commentId: string) => void;
    replyDraft: string;
    onReplyDraftChange: (value: string) => void;
    onReplySubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    isReplying: boolean;
    editingId: string | null;
    editDraft: string;
    onOpenEdit: (commentId: string, content: string) => void;
    onEditDraftChange: (value: string) => void;
    onSaveEdit: () => Promise<void>;
    onCancelEdit: () => void;
    isUpdating: boolean;
    onDelete: (commentId: string) => Promise<void>;
    isDeleting: boolean;
    showLessonMeta?: boolean;
}) {
    const canManageThread = canModerate || (!!currentUserId && currentUserId === thread.authorId);
    const isReplyBoxOpen = openReplyId === thread.id;
    const isEditingThread = editingId === thread.id;

    return (
        <article className="rounded-[30px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                        <User className="h-5 w-5"/>
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-black text-slate-950 dark:text-slate-100">{thread.author}</h4>
                            {showLessonMeta && thread.lessonName ? (
                                <Badge className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    {thread.lessonName}
                                </Badge>
                            ) : null}
                            {thread.authorDto?.roleName ? (
                                <Badge className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                    {thread.authorDto.roleName}
                                </Badge>
                            ) : null}
                            {thread.deleted ? (
                                <Badge className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                                    Deleted
                                </Badge>
                            ) : null}
                        </div>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{formatDate(thread.createdAt)}</p>
                    </div>
                </div>

                {canManageThread && !thread.deleted ? (
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => onOpenEdit(thread.id, thread.content)}>
                            <Edit3 className="h-4 w-4"/>
                            Edit
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => onDelete(thread.id)} disabled={isDeleting} className="text-rose-600">
                            {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                            Delete
                        </Button>
                    </div>
                ) : null}
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                {isEditingThread ? (
                    <div className="space-y-3">
                        <Textarea
                            value={editDraft}
                            onChange={(event) => onEditDraftChange(event.target.value)}
                            className="min-h-[110px] rounded-[20px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onCancelEdit}>
                                Bekor qilish
                            </Button>
                            <Button type="button" onClick={onSaveEdit} disabled={isUpdating || !editDraft.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
                                {isUpdating ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                Saqlash
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className={`text-sm font-medium leading-6 ${thread.deleted ? "italic text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                        {thread.deleted ? "Bu comment o‘chirilgan." : thread.content}
                    </p>
                )}
            </div>

            {thread.replies.length > 0 ? (
                <div className="mt-5 space-y-3 border-l-2 border-slate-200 pl-5 dark:border-slate-800">
                    {thread.replies.map((reply) => {
                        const canManageReply = canModerate || (!!currentUserId && currentUserId === reply.authorId);
                        const isEditingReply = editingId === reply.id;
                        return (
                            <div key={reply.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="font-black text-slate-950 dark:text-slate-100">{reply.author}</p>
                                            {reply.authorDto?.roleName ? (
                                                <Badge className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {reply.authorDto.roleName}
                                                </Badge>
                                            ) : null}
                                            {reply.deleted ? (
                                                <Badge className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                                                    Deleted
                                                </Badge>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{formatDate(reply.createdAt)}</p>
                                    </div>
                                    {canManageReply && !reply.deleted ? (
                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => onOpenEdit(reply.id, reply.content)}>
                                                <Edit3 className="h-4 w-4"/>
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => onDelete(reply.id)} disabled={isDeleting} className="text-rose-600">
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-3">
                                    {isEditingReply ? (
                                        <div className="space-y-3">
                                            <Textarea
                                                value={editDraft}
                                                onChange={(event) => onEditDraftChange(event.target.value)}
                                                className="min-h-[100px] rounded-[20px] border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="outline" onClick={onCancelEdit}>Bekor qilish</Button>
                                                <Button type="button" onClick={onSaveEdit} disabled={isUpdating || !editDraft.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
                                                    {isUpdating ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                                    Saqlash
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={`text-sm leading-6 ${reply.deleted ? "italic text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                                            {reply.deleted ? "Bu reply o‘chirilgan." : reply.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <div className="mt-5">
                <Button type="button" variant="outline" onClick={() => onOpenReply(thread.id)} className="rounded-2xl">
                    <Reply className="h-4 w-4"/>
                    Reply yozish
                </Button>
            </div>

            {isReplyBoxOpen ? (
                <form onSubmit={onReplySubmit} className="mt-4 space-y-3 rounded-[24px] border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                    <Textarea
                        value={replyDraft}
                        onChange={(event) => onReplyDraftChange(event.target.value)}
                        placeholder="Reply yozing..."
                        className="min-h-[100px] rounded-[20px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenReply(thread.id)}>
                            Bekor qilish
                        </Button>
                        <Button type="submit" disabled={isReplying || !replyDraft.trim()} className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700">
                            {isReplying ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                            Reply yuborish
                        </Button>
                    </div>
                </form>
            ) : null}
        </article>
    );
}

function LessonReviewsPanel({
    lessonId,
    page,
    onPageChange,
    isStudent,
    currentUserId,
}: {
    lessonId: string;
    page: number;
    onPageChange: (page: number) => void;
    isStudent: boolean;
    currentUserId?: string;
}) {
    const reviewsQuery = useLessonReviewsPage(lessonId, page, REVIEW_PAGE_SIZE);
    const createReviewMutation = useCreateLessonReview(lessonId);
    const updateReviewMutation = useUpdateMyLessonReview(lessonId);
    const [draft, setDraft] = useState("");

    const ownReview = useMemo(
        () => reviewsQuery.data?.content.find((item) => item.mine || (currentUserId && item.authorId === currentUserId)),
        [currentUserId, reviewsQuery.data?.content],
    );

    useEffect(() => {
        setDraft(ownReview?.comment || "");
    }, [ownReview?.comment]);

    const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!draft.trim()) return;

        if (ownReview) {
            await updateReviewMutation.mutateAsync({comment: draft.trim()});
        } else {
            await createReviewMutation.mutateAsync({comment: draft.trim()});
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-[30px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Lesson reviews</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Read-only review list</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                        Reviewlar ko‘rinadi, lekin ularga reply UI chiqmaydi. Student o‘z review’ini yozadi yoki yangilaydi, staff esa faqat o‘qiydi.
                    </p>
                </div>

                {isStudent ? (
                    <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
                        <Textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder="Dars haqidagi fikringizni yozing..."
                            className="min-h-[110px] rounded-[24px] border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60"
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={(createReviewMutation.isPending || updateReviewMutation.isPending) || !draft.trim()}
                                className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {(createReviewMutation.isPending || updateReviewMutation.isPending) ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                                {ownReview ? "Reviewni yangilash" : "Review yuborish"}
                            </Button>
                        </div>
                    </form>
                ) : null}
            </section>

            {reviewsQuery.isLoading ? (
                <LoadingState label="Reviewlar yuklanmoqda..."/>
            ) : reviewsQuery.isError ? (
                <EmptyState
                    icon={<AlertCircle className="h-7 w-7"/>}
                    title="Reviewlar yuklanmadi"
                    description={parseApiError(reviewsQuery.error).message}
                />
            ) : !reviewsQuery.data?.content.length ? (
                <EmptyState
                    icon={<Star className="h-7 w-7"/>}
                    title="Review yo‘q"
                    description="Bu lesson uchun hali review yozilmagan."
                />
            ) : (
                <div className="space-y-4">
                    {reviewsQuery.data.content.map((review: LessonReviewResponse) => (
                        <article key={review.id} className="rounded-[28px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-lg font-black text-slate-950 dark:text-slate-100">{review.authorName}</h4>
                                        {review.roleName ? (
                                            <Badge className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {review.roleName}
                                            </Badge>
                                        ) : null}
                                        {review.mine ? (
                                            <Badge className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                                Mening reviewim
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{formatDate(review.updatedAt || review.createdAt)}</p>
                                </div>
                            </div>
                            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                                <p className={`text-sm leading-6 ${review.deleted ? "italic text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                                    {review.deleted ? "Bu review o‘chirilgan." : review.comment}
                                </p>
                            </div>
                        </article>
                    ))}

                    <Pager
                        page={page}
                        totalPages={reviewsQuery.data.totalPages}
                        onPrev={() => onPageChange(Math.max(page - 1, 0))}
                        onNext={() => onPageChange(page + 1)}
                    />
                </div>
            )}
        </div>
    );
}
