import {CalendarClock, CheckCircle2, Layers3, LoaderCircle, Sparkles, Users} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useUser} from "../../api/auth/useAuth.ts";
import {useGetArchivedBusinessCourses, useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {useGetUsers} from "../../api/businessUser/useBusinessUser.ts";
import {useUnreadNotificationsCount} from "../../api/notifications/useNotifications.ts";

const todayLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
}).format(new Date());

export default function Schedule() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const {data: myCourses = [], isLoading: isMyCoursesLoading} = useGetMyCourses();
    const {data: businessCourses = [], isLoading: isBusinessCoursesLoading} = useGetBusinessCourses();
    const {data: archivedCourses = [], isLoading: isArchivedCoursesLoading} = useGetArchivedBusinessCourses();
    const {data: members = [], isLoading: isMembersLoading} = useGetUsers(user?.businessId);
    const {data: unreadNotifications = 0, isLoading: isNotificationsLoading} = useUnreadNotificationsCount();

    const isLoading =
        isUserLoading ||
        isMyCoursesLoading ||
        isBusinessCoursesLoading ||
        isArchivedCoursesLoading ||
        isMembersLoading ||
        isNotificationsLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <LoaderCircle className="h-10 w-10 animate-spin text-sky-600"/>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Schedule</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Operations rhythm loading</h2>
                    </div>
                </div>
            </div>
        );
    }

    const liveCourses = businessCourses.filter((course) => course.active);
    const archivedCount = archivedCourses.length;
    const draftCount = [...myCourses, ...businessCourses].filter((course) => !course.isPublished).length;

    const rhythmCards = [
        {
            label: "Live delivery lanes",
            value: liveCourses.length,
            hint: "Courses currently in delivery mode",
            icon: CheckCircle2,
            tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
        },
        {
            label: "Draft queue",
            value: draftCount,
            hint: "Programs still waiting for release planning",
            icon: Layers3,
            tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
        },
        {
            label: "Action alerts",
            value: unreadNotifications,
            hint: "Unread notifications affecting workflow",
            icon: Sparkles,
            tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
        },
    ];

    const scheduleLanes = [
        {
            title: "Plan",
            value: `${draftCount} draft programs`,
            description: "Builder ichida release oldi tayyorlanayotgan kurslar.",
        },
        {
            title: "Deliver",
            value: `${liveCourses.length} live courses`,
            description: "Joriy business catalog ichida learner-facing delivery holatidagi kurslar.",
        },
        {
            title: "Support",
            value: `${members.length} team members`,
            description: "Teacher va assistant resurslari ops oqimini ushlab turibdi.",
        },
        {
            title: "Close",
            value: `${archivedCount} archived`,
            description: "Lifecycle’dan chiqqan yoki vaqtincha to‘xtatilgan kurslar.",
        },
    ];

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title="Schedule"
                description="Operational rhythm and planning lanes"
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.9))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                Ops Rhythm
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                {todayLabel}
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                            Planning, delivery va archive oqimini bitta schedule surface ichida ko‘ring
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                            Bu sahifa hozircha real course lifecycle, team size va notification signal’lari asosida operational rhythm’ni ko‘rsatadi.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {rhythmCards.map((card) => (
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

                    <div className="rounded-[30px] border border-white/75 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/55">Planner note</p>
                                <h2 className="mt-3 text-2xl font-black tracking-tight">Today’s focus</h2>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                                <CalendarClock className="h-5 w-5 text-white/80"/>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-black text-white">Operational date</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-white/60">{todayLabel}</p>
                            </div>
                            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                                <p className="text-sm font-black text-white">Unread action queue</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-white/60">
                                    {unreadNotifications} notification response yoki workflow attention talab qilmoqda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Workflow lanes</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Operating rhythm</h2>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                            <Layers3 className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {scheduleLanes.map((lane) => (
                            <div key={lane.title} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{lane.title}</p>
                                <p className="mt-2 text-xl font-black text-slate-950 dark:text-slate-100">{lane.value}</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{lane.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Future integrations</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Calendar slots</h2>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                            <Users className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-sm font-black text-slate-950 dark:text-slate-100">Live class schedule</p>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                Webinar, lesson time slots va real mentor calendar ulanadigan qatlam shu yerga tushadi.
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-sm font-black text-slate-950 dark:text-slate-100">Assessment windows</p>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                Module tests, deadline reminders va exam cadence keyingi bosqichda boyitiladi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
