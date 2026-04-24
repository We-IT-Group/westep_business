import {useMemo} from "react";
import {
    Bell,
    CheckCheck,
    Clock3,
    LoaderCircle,
    MessageSquareText,
    Sparkles,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {Button} from "../../components/ui/button.tsx";
import {
    useNotifications,
    useReadAllNotifications,
    useReadNotification,
    useUnreadNotificationsCount,
} from "../../api/notifications/useNotifications.ts";

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

export default function Messages() {
    const {data: notifications = [], isLoading: isNotificationsLoading} = useNotifications();
    const {data: unreadCount = 0, isLoading: isUnreadLoading} = useUnreadNotificationsCount();
    const {mutateAsync: readNotification, isPending: isReadingNotification} = useReadNotification();
    const {mutateAsync: readAllNotifications, isPending: isReadingAll} = useReadAllNotifications();

    const isLoading = isNotificationsLoading || isUnreadLoading;

    const notificationTypes = useMemo(
        () => Array.from(new Set(notifications.map((item) => item.type).filter(Boolean))).length,
        [notifications],
    );
    const readCount = notifications.length - unreadCount;
    const latestNotification = notifications[0];

    const summaryCards = [
        {
            label: "Jami bildirishnomalar",
            value: notifications.length,
            hint: "Notifications API'dan olingan xabarlar",
            icon: MessageSquareText,
            tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
        },
        {
            label: "Hozir o‘qilmagan",
            value: unreadCount,
            hint: "Hali e'tibor talab qiladigan xabarlar",
            icon: Bell,
            tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
        },
        {
            label: "O‘qilganlar",
            value: readCount,
            hint: `${notificationTypes || 0} xil bildirishnoma turi bor`,
            icon: CheckCheck,
            tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <LoaderCircle className="h-10 w-10 animate-spin text-sky-600"/>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Xabarlar</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Bildirishnomalar yuklanmoqda</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title="Xabarlar"
                description="Bildirishnoma markazi va javob oqimi"
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.9))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                Bildirishnoma markazi
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                `/api/notifications`
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                            Response workflow, alerts va updates endi bitta real inbox ichida
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                            Bu sahifa notifications API bilan ishlaydi: list, unread count, bitta notificationni read qilish va hammasini read qilish.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {summaryCards.map((card) => (
                                <div key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${card.tone}`}>
                                        <card.icon className="h-5 w-5"/>
                                    </div>
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{card.label}</p>
                                    <div className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{card.value}</div>
                                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{card.hint}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(255,255,255,0.98))] p-5 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:text-slate-100 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-500/70 dark:text-slate-500">Inbox holati</p>
                                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Joriy vaziyat</h2>
                            </div>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-200"/>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">O‘qilmagan ogohlantirishlar</p>
                                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">{unreadCount}</p>
                            </div>
                            <div className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">So‘nggi bildirishnoma</p>
                                <p className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">{latestNotification?.title || "Hali bildirishnoma yo‘q"}</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                    {latestNotification ? formatDate(latestNotification.createdAt) : "Inbox bo‘sh."}
                                </p>
                            </div>
                            <Button
                                onClick={() => readAllNotifications()}
                                disabled={isReadingAll || unreadCount === 0}
                                className="h-11 w-full rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-blue-700"
                            >
                                Hammasini o‘qilgan qilish
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Bildirishnomalar oqimi</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">So‘nggi xabarlar</h2>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                        <p className="text-xs font-black text-slate-900 dark:text-slate-100">O‘qilgan holati backend bilan sinxron</p>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-slate-400 shadow-sm dark:bg-slate-900 dark:text-slate-500 dark:shadow-none">
                            <Bell className="h-6 w-6"/>
                        </div>
                        <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100">Inbox toza</h3>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            Hozircha notification kelmagan. API’dan yangi event kelsa shu yerda ko‘rinadi.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`rounded-[24px] border p-5 transition ${
                                    notification.isRead
                                        ? "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60"
                                        : "border-sky-200 bg-sky-50/65 shadow-[0_12px_30px_rgba(56,189,248,0.08)] dark:border-sky-500/30 dark:bg-sky-500/10 dark:shadow-[0_12px_30px_rgba(2,6,23,0.25)]"
                                }`}
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${
                                                notification.isRead
                                                    ? "bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                                                    : "bg-slate-950 text-white dark:bg-sky-500/20 dark:text-sky-100"
                                            }`}>
                                                {notification.isRead ? "O‘qilgan" : "O‘qilmagan"}
                                            </span>
                                            {notification.type ? (
                                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                                    {notification.type}
                                                </span>
                                            ) : null}
                                        </div>
                                        <h3 className="mt-4 text-lg font-black tracking-tight text-slate-950 dark:text-slate-100">{notification.title}</h3>
                                        <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-400">{notification.message}</p>
                                        <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            <Clock3 className="h-3.5 w-3.5"/>
                                            {formatDate(notification.createdAt)}
                                        </div>
                                    </div>

                                    {!notification.isRead ? (
                                        <Button
                                            onClick={() => readNotification(notification.id)}
                                            disabled={isReadingNotification}
                                            className="h-10 rounded-2xl bg-slate-950 px-4 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700"
                                        >
                                            O‘qilgan qilish
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
