import {useMemo} from "react";
import {useQueries} from "@tanstack/react-query";
import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    GraduationCap,
    Layers3,
    LoaderCircle,
    Orbit,
    Sparkles,
    Users,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useUser} from "../../api/auth/useAuth.ts";
import {useGetArchivedBusinessCourses, useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {useGetUsers} from "../../api/businessUser/useBusinessUser.ts";
import {getCourseTrackingAnalytics} from "../../api/trackingLinks/trackingLinkApi.ts";

const emptyAnalytics = {
    clicks: 0,
    uniqueClicks: 0,
    leads: 0,
    checkoutStarted: 0,
    paidPurchases: 0,
    failedOrAbandoned: 0,
    refunded: 0,
    revenue: 0,
    conversionRate: 0,
    lastActivityAt: null as string | null,
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatDate = (value?: string | null) => {
    if (!value) return "Hali faollik yo‘q";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {dateStyle: "medium", timeStyle: "short"}).format(date);
};

export default function Analytics() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const {data: myCourses = [], isLoading: isMyCoursesLoading} = useGetMyCourses();
    const {data: businessCourses = [], isLoading: isBusinessCoursesLoading} = useGetBusinessCourses();
    const {data: archivedCourses = [], isLoading: isArchivedCoursesLoading} = useGetArchivedBusinessCourses();
    const {data: members = [], isLoading: isMembersLoading} = useGetUsers(user?.businessId);

    const portfolioCourses = useMemo(() => {
        const courseMap = new Map<string, (typeof businessCourses)[number]>();
        [...myCourses, ...businessCourses, ...archivedCourses].forEach((course) => {
            courseMap.set(course.id, course);
        });
        return Array.from(courseMap.values());
    }, [archivedCourses, businessCourses, myCourses]);

    const trackingAnalyticsQueries = useQueries({
        queries: businessCourses.map((course) => ({
            queryKey: ["course-tracking-analytics", course.id],
            queryFn: () => getCourseTrackingAnalytics(course.id),
            enabled: !!course.id,
            staleTime: 1000 * 30,
        })),
    });

    const isLoading =
        isUserLoading ||
        isMyCoursesLoading ||
        isBusinessCoursesLoading ||
        isArchivedCoursesLoading ||
        isMembersLoading ||
        trackingAnalyticsQueries.some((query) => query.isLoading);

    const aggregateAnalytics = useMemo(() => {
        return trackingAnalyticsQueries.reduce(
            (accumulator, query) => {
                const data = query.data || emptyAnalytics;
                return {
                    clicks: accumulator.clicks + (data.clicks || 0),
                    uniqueClicks: accumulator.uniqueClicks + (data.uniqueClicks || 0),
                    leads: accumulator.leads + (data.leads || 0),
                    checkoutStarted: accumulator.checkoutStarted + (data.checkoutStarted || 0),
                    paidPurchases: accumulator.paidPurchases + (data.paidPurchases || 0),
                    failedOrAbandoned: accumulator.failedOrAbandoned + (data.failedOrAbandoned || 0),
                    refunded: accumulator.refunded + (data.refunded || 0),
                    revenue: accumulator.revenue + (data.revenue || 0),
                    conversionRate: accumulator.conversionRate + (data.conversionRate || 0),
                    lastActivityAt: accumulator.lastActivityAt || data.lastActivityAt || null,
                };
            },
            {...emptyAnalytics},
        );
    }, [trackingAnalyticsQueries]);

    const teachersCount = members.filter((member) => member.role === "TEACHER").length;
    const assistantsCount = members.filter((member) => member.role === "ASSISTANT").length;
    const liveCoursesCount = portfolioCourses.filter((course) => course.active).length;
    const draftCoursesCount = portfolioCourses.filter((course) => !course.isPublished).length;

    const headlineCards = [
        {
            label: "Portfel qamrovi",
            value: formatNumber(aggregateAnalytics.uniqueClicks),
            hint: "Noyob ko‘rishlar soni",
            icon: Orbit,
            tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
        },
        {
            label: "Lid oqimi",
            value: formatNumber(aggregateAnalytics.leads),
            hint: "Malakali qiziqish signallari",
            icon: Sparkles,
            tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
        },
        {
            label: "Daromad holati",
            value: formatMoney(aggregateAnalytics.revenue),
            hint: "Jami to‘lovli konversiya",
            icon: ArrowUpRight,
            tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
        },
    ];

    const portfolioCards = [
        {
            label: "Barcha kurslar",
            value: portfolioCourses.length,
            detail: `${liveCoursesCount} ta faol, ${archivedCourses.length} ta arxivda`,
            icon: BookOpen,
        },
        {
            label: "Modul oqimi",
            value: "Builder ichida",
            detail: `${draftCoursesCount} ta qoralama kurs hali shakllanmoqda`,
            icon: Layers3,
        },
        {
            label: "Jamoa qamrovi",
            value: members.length,
            detail: `${teachersCount} ta o‘qituvchi, ${assistantsCount} ta assistent`,
            icon: Users,
        },
    ];

    const signalBoard = [
        {
            label: "Kliklar",
            value: formatNumber(aggregateAnalytics.clicks),
            helper: "Umumiy kampaniya trafiki",
        },
        {
            label: "Checkout boshlanishi",
            value: formatNumber(aggregateAnalytics.checkoutStarted),
            helper: "Sotib olish niyati signallari",
        },
        {
            label: "To‘langan xaridlar",
            value: formatNumber(aggregateAnalytics.paidPurchases),
            helper: "Yakunlangan konversiyalar",
        },
        {
            label: "Konversiya darajasi",
            value: formatPercent(aggregateAnalytics.conversionRate),
            helper: "Biznes kurs havolalari bo‘yicha",
        },
    ];

    const operatingFeed = [
        {
            title: "Kurs katalogi",
            description: `${liveCoursesCount} live courses va ${archivedCourses.length} archived item business lifecycle ichida turibdi.`,
        },
        {
            title: "Jamoa ijrosi",
            description: `${teachersCount || 0} teacher learning deliveryga, ${assistantsCount || 0} assistant support ops’ga biriktirilgan.`,
        },
        {
            title: "So‘nggi kuzatilgan faollik",
            description: formatDate(aggregateAnalytics.lastActivityAt),
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
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Tahlillar</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Signallar yuklanmoqda</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title="Tahlillar"
                description="Biznes samaradorligi va jalb qilish ko‘rsatkichlari"
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.9))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                Signal markazi
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                {user?.roleName || "Biznes workspace"}
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                            Business growth, course traction va team execution bir panelda
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                            `Tracking links`, course portfolio va business members API’lari asosida real operator signal panelini yig‘dim.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {headlineCards.map((card) => (
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
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-500/70 dark:text-slate-500">Operator oqimi</p>
                                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Joriy holat</h2>
                            </div>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-200"/>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {operatingFeed.map((item) => (
                                <div key={item.title} className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{item.title}</p>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Biznes ko‘rinishi</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Portfel ko‘rinishi</h2>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                            <GraduationCap className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {portfolioCards.map((card) => (
                            <div key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300 dark:shadow-none">
                                    <card.icon className="h-5 w-5"/>
                                </div>
                                <p className="mt-4 text-sm font-black text-slate-950 dark:text-slate-100">{card.label}</p>
                                <div className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{card.value}</div>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{card.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Savdo signallari</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Konversiya paneli</h2>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                            <ArrowUpRight className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {signalBoard.map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                                <div>
                                    <p className="text-sm font-black text-slate-950 dark:text-slate-100">{item.label}</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.helper}</p>
                                </div>
                                <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
