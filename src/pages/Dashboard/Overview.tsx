import {useMemo} from "react";
import {Link} from "react-router-dom";
import {useQueries} from "@tanstack/react-query";
import {
    ArrowUpRight,
    BookOpen,
    GraduationCap,
    LoaderCircle,
    PiggyBank,
    Sparkles,
    Users,
    UserSquare2,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useGetBusinessCourses, useGetInactiveBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import {useGetUsers} from "../../api/businessUser/useBusinessUser.ts";
import {getCourseStudents} from "../../api/courseStudents/courseStudentsApi.ts";
import {getCourseTrackingAnalytics} from "../../api/trackingLinks/trackingLinkApi.ts";
import type {Course, TrackingLinkAnalytics} from "../../types/types.ts";

const emptyAnalytics: TrackingLinkAnalytics = {
    clicks: 0,
    uniqueClicks: 0,
    leads: 0,
    checkoutStarted: 0,
    paidPurchases: 0,
    failedOrAbandoned: 0,
    refunded: 0,
    revenue: 0,
    conversionRate: 0,
    lastActivityAt: null,
};

const formatMoney = (value: number) =>
    new Intl.NumberFormat("uz-UZ").format(Math.round(value));

const formatDateTime = (value?: string | null) => {
    if (!value) return "Hali faollik yo‘q";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const getStudentProgressPercent = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

export default function Overview() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const myCoursesQuery = useGetMyCourses();
    const businessCoursesQuery = useGetBusinessCourses();
    const inactiveCoursesQuery = useGetInactiveBusinessCourses();
    const membersQuery = useGetUsers(user?.businessId);

    const allCourses = useMemo(() => {
        const uniqueCourses = new Map<string, Course>();

        [
            ...(myCoursesQuery.data || []),
            ...(businessCoursesQuery.data || []),
            ...(inactiveCoursesQuery.data || []),
        ].forEach((course) => {
            uniqueCourses.set(course.id, course);
        });

        return Array.from(uniqueCourses.values());
    }, [businessCoursesQuery.data, inactiveCoursesQuery.data, myCoursesQuery.data]);

    const studentQueries = useQueries({
        queries: allCourses.map((course) => ({
            queryKey: ["dashboard-course-students", course.id],
            queryFn: () => getCourseStudents(course.id),
            enabled: !!course.id,
            staleTime: 1000 * 30,
        })),
    });

    const analyticsQueries = useQueries({
        queries: allCourses.map((course) => ({
            queryKey: ["dashboard-course-analytics", course.id],
            queryFn: () => getCourseTrackingAnalytics(course.id),
            enabled: !!course.id,
            staleTime: 1000 * 30,
        })),
    });

    const isLoading =
        isUserLoading ||
        myCoursesQuery.isLoading ||
        businessCoursesQuery.isLoading ||
        inactiveCoursesQuery.isLoading ||
        membersQuery.isLoading ||
        studentQueries.some((query) => query.isLoading) ||
        analyticsQueries.some((query) => query.isLoading);

    const teamMembers = membersQuery.data || [];
    const teachersCount = teamMembers.filter((member) => member.role === "TEACHER").length;
    const assistantsCount = teamMembers.filter((member) => member.role === "ASSISTANT").length;
    const staffCount = teachersCount + assistantsCount;

    const studentPortfolio = useMemo(() => {
        const uniqueStudents = new Map<string, {progress: number}>();

        studentQueries.forEach((query) => {
            (query.data || []).forEach((student) => {
                const existing = uniqueStudents.get(student.studentId);
                const nextProgress = student.progressPercentage || 0;

                if (!existing || nextProgress > existing.progress) {
                    uniqueStudents.set(student.studentId, {progress: nextProgress});
                }
            });
        });

        const allStudents = Array.from(uniqueStudents.values());
        const studyingCount = allStudents.filter((student) => student.progress > 0 && student.progress < 100).length;
        const completedCount = allStudents.filter((student) => student.progress >= 100).length;

        return {
            totalStudents: allStudents.length,
            studyingCount,
            completedCount,
        };
    }, [studentQueries]);

    const aggregateAnalytics = useMemo(() => {
        return analyticsQueries.reduce(
            (accumulator, query) => {
                const data = query.data || emptyAnalytics;
                const accumulatorDate = accumulator.lastActivityAt ? new Date(accumulator.lastActivityAt).getTime() : 0;
                const nextDate = data.lastActivityAt ? new Date(data.lastActivityAt).getTime() : 0;

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
                    lastActivityAt: nextDate >= accumulatorDate ? data.lastActivityAt : accumulator.lastActivityAt,
                };
            },
            {...emptyAnalytics},
        );
    }, [analyticsQueries]);

    const totalCourses = allCourses.length;
    const activeCourses = allCourses.filter((course) => course.active).length;
    const inactiveCourses = allCourses.filter((course) => !course.active).length;
    const publishedCourses = allCourses.filter((course) => course.isPublished).length;

    const studyingRate = getStudentProgressPercent(studentPortfolio.studyingCount, studentPortfolio.totalStudents);
    const completedRate = getStudentProgressPercent(studentPortfolio.completedCount, studentPortfolio.totalStudents);
    const activeCourseRate = getStudentProgressPercent(activeCourses, totalCourses);

    const topStats = [
        {
            label: "Kurslar soni",
            value: totalCourses,
            helper: `${activeCourses} ta faol`,
            icon: BookOpen,
            tone: "from-sky-500/18 via-cyan-400/12 to-white dark:from-sky-500/18 dark:via-cyan-500/10 dark:to-slate-950",
            iconTone: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
            accent: "bg-sky-500",
        },
        {
            label: "O‘quvchilar soni",
            value: studentPortfolio.totalStudents,
            helper: "Barcha kurslar bo‘yicha",
            icon: GraduationCap,
            tone: "from-emerald-500/18 via-teal-400/12 to-white dark:from-emerald-500/18 dark:via-teal-500/10 dark:to-slate-950",
            iconTone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
            accent: "bg-emerald-500",
        },
        {
            label: "Xodimlar soni",
            value: staffCount,
            helper: `${teachersCount} teacher, ${assistantsCount} assistant`,
            icon: Users,
            tone: "from-amber-500/18 via-orange-400/12 to-white dark:from-amber-500/18 dark:via-orange-500/10 dark:to-slate-950",
            iconTone: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
            accent: "bg-amber-500",
        },
        {
            label: "Daromad summasi",
            value: `${formatMoney(aggregateAnalytics.revenue)} so‘m`,
            helper: "Tracking analytics bo‘yicha",
            icon: PiggyBank,
            tone: "from-violet-500/18 via-fuchsia-400/12 to-white dark:from-violet-500/18 dark:via-fuchsia-500/10 dark:to-slate-950",
            iconTone: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
            accent: "bg-violet-500",
        },
    ];

    const secondaryStats = [
        {
            label: "O‘qiyotgan student",
            value: studentPortfolio.studyingCount,
            helper: "Progress 1% - 99%",
            icon: Sparkles,
            tone: "border-blue-200/80 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/10",
            iconTone: "bg-white text-blue-700 dark:bg-slate-950 dark:text-blue-300",
            accent: "bg-blue-500",
            progress: studyingRate,
        },
        {
            label: "Tugallagan student",
            value: studentPortfolio.completedCount,
            helper: "Progress 100%",
            icon: UserSquare2,
            tone: "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10",
            iconTone: "bg-white text-emerald-700 dark:bg-slate-950 dark:text-emerald-300",
            accent: "bg-emerald-500",
            progress: completedRate,
        },
        {
            label: "Nashrdagi kurslar",
            value: publishedCourses,
            helper: "Studentlarga ochiq kurslar",
            icon: ArrowUpRight,
            tone: "border-amber-200/80 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10",
            iconTone: "bg-white text-amber-700 dark:bg-slate-950 dark:text-amber-300",
            accent: "bg-amber-500",
            progress: activeCourseRate,
        },
        {
            label: "Nofaol kurslar",
            value: inactiveCourses,
            helper: "Hozir yopiq holatda",
            icon: BookOpen,
            tone: "border-rose-200/80 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/10",
            iconTone: "bg-white text-rose-700 dark:bg-slate-950 dark:text-rose-300",
            accent: "bg-rose-500",
            progress: totalCourses > 0 ? Math.round((inactiveCourses / totalCourses) * 100) : 0,
        },
    ];

    const quickLinks = [
        {label: "Kurslar", to: "/courses", helper: "Kurslarni boshqarish"},
        {label: "O‘quvchilar", to: "/students", helper: "Studentlar statistikasi"},
        {label: "Xodimlar", to: "/users", helper: "Teacher va assistantlar"},
    ];

    const summaryRows = [
        {
            label: "So‘nggi faollik",
            value: formatDateTime(aggregateAnalytics.lastActivityAt),
        },
        {
            label: "Unique clicklar",
            value: String(aggregateAnalytics.uniqueClicks),
        },
        {
            label: "To‘lovli xaridlar",
            value: String(aggregateAnalytics.paidPurchases),
        },
        {
            label: "Checkout boshlangan",
            value: String(aggregateAnalytics.checkoutStarted),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <LoaderCircle className="h-5 w-5 animate-spin text-blue-600"/>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Dashboard yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1320px] space-y-4 pb-10">
            <PageMeta
                title="Dashboard"
                description="Biznes statistikasi va umumiy holat"
            />

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.22),_transparent_30%),linear-gradient(135deg,_#ffffff,_#f8fafc)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.96))] dark:shadow-[0_20px_60px_rgba(2,6,23,0.42)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">Umumiy ko‘rinish</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Dashboard</h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Kurslar, studentlar, xodimlar va daromad bo‘yicha umumiy holat.
                        </p>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                        {(user?.firstname || "").trim() || "Workspace"}
                    </div>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {topStats.map((stat) => (
                    <div key={stat.label} className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br ${stat.tone} p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:hover:shadow-[0_20px_40px_rgba(2,6,23,0.4)]`}>
                        <span className={`absolute inset-x-0 top-0 h-1 ${stat.accent}`} />
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-105 ${stat.iconTone}`}>
                            <stat.icon className="h-5 w-5"/>
                        </div>
                        <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{stat.value}</div>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{stat.label}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.helper}</p>
                    </div>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_14px_34px_rgba(2,6,23,0.34)]">
                    <div className="grid gap-3 md:grid-cols-2">
                        {secondaryStats.map((stat) => (
                            <div key={stat.label} className={`rounded-[22px] border p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${stat.tone}`}>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${stat.iconTone}`}>
                                    <stat.icon className="h-4.5 w-4.5"/>
                                </div>
                                <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{stat.value}</div>
                                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{stat.label}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.helper}</p>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-slate-950/70">
                                    <div className={`h-full rounded-full ${stat.accent}`} style={{width: `${Math.max(stat.progress, 6)}%`}} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_14px_34px_rgba(2,6,23,0.34)]">
                    <div className="space-y-3">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="group flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-500/30 dark:hover:bg-slate-900"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{link.label}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{link.helper}</p>
                                </div>
                                <ArrowUpRight className="h-4.5 w-4.5 text-slate-400 transition group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-300"/>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-3 rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.95))] p-4 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(2,6,23,0.92))]">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Qisqa holat</h3>
                        <div className="mt-4 space-y-3">
                            {summaryRows.map((row) => (
                                <div key={row.label} className="flex items-start justify-between gap-3 rounded-2xl bg-white/80 px-3 py-3 dark:bg-slate-950/50">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.label}</p>
                                    <p className="text-right text-sm font-medium text-slate-900 dark:text-slate-100">{row.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
