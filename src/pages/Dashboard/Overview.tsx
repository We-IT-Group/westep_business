import {useMemo} from "react";
import {Link} from "react-router-dom";
import {
    Archive,
    ArrowUpRight,
    Bell,
    BookOpen,
    BriefcaseBusiness,
    Clock3,
    Layers3,
    Sparkles,
    Users,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useGetArchivedBusinessCourses, useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import {useGetUsers} from "../../api/businessUser/useBusinessUser.ts";
import {useUnreadNotificationsCount} from "../../api/notifications/useNotifications.ts";
import type {Course} from "../../types/types.ts";

type StatCard = {
    label: string;
    value: number;
    hint: string;
    icon: typeof BookOpen;
    tone: string;
};

const percentage = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

const shortText = (value: string | undefined, fallback: string) => {
    if (!value?.trim()) return fallback;
    return value.length > 78 ? `${value.slice(0, 75)}...` : value;
};

export default function Overview() {
    const {data: user} = useUser();
    const {data: myCoursesData} = useGetMyCourses();
    const {data: businessCoursesData} = useGetBusinessCourses();
    const {data: archivedCoursesData} = useGetArchivedBusinessCourses();
    const {data: teamMembersData} = useGetUsers(user?.businessId);
    const {data: unreadNotifications} = useUnreadNotificationsCount();

    const myCourses = useMemo(() => myCoursesData ?? [], [myCoursesData]);
    const businessCourses = useMemo(() => businessCoursesData ?? [], [businessCoursesData]);
    const archivedCourses = useMemo(() => archivedCoursesData ?? [], [archivedCoursesData]);
    const teamMembers = useMemo(() => teamMembersData ?? [], [teamMembersData]);
    const unreadCount = unreadNotifications || 0;

    const allCourses = useMemo(() => {
        const uniqueCourses = new Map<string, Course>();

        [...myCourses, ...businessCourses, ...archivedCourses].forEach((course) => {
            uniqueCourses.set(course.id, course);
        });

        return Array.from(uniqueCourses.values());
    }, [archivedCourses, businessCourses, myCourses]);

    const sortedCourses = useMemo(
        () =>
            [...allCourses].sort(
                (left, right) =>
                    new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime(),
            ),
        [allCourses],
    );

    const totalCourses = allCourses.length;
    const activeCourses = allCourses.filter((course) => course.active).length;
    const publishedCourses = allCourses.filter((course) => course.isPublished).length;
    const draftCourses = Math.max(totalCourses - publishedCourses, 0);
    const archivedCount = allCourses.filter((course) => course.active === false).length;
    const teachersCount = teamMembers.filter((member) => member.role === "TEACHER").length;
    const assistantsCount = teamMembers.filter((member) => member.role === "ASSISTANT").length;
    const activeRate = percentage(activeCourses, totalCourses);
    const publishedRate = percentage(publishedCourses, totalCourses);
    const archiveRate = percentage(archivedCount, totalCourses);
    const recentCourses = sortedCourses.slice(0, 5);

    const heroStats: StatCard[] = [
        {
            label: "Jami kurslar",
            value: totalCourses,
            hint: `${publishedCourses} ta nashrda`,
            icon: BookOpen,
            tone: "from-sky-500/20 to-blue-500/10 text-sky-700 dark:text-sky-200",
        },
        {
            label: "Faol kurslar",
            value: activeCourses,
            hint: `${activeRate}% hozir ochiq`,
            icon: Sparkles,
            tone: "from-emerald-500/20 to-teal-500/10 text-emerald-700 dark:text-emerald-200",
        },
        {
            label: "Jamoa a'zolari",
            value: teamMembers.length,
            hint: `${teachersCount} teacher, ${assistantsCount} assistant`,
            icon: Users,
            tone: "from-violet-500/20 to-indigo-500/10 text-violet-700 dark:text-violet-200",
        },
        {
            label: "O'qilmagan xabarlar",
            value: unreadCount,
            hint: "Tezkor javob kutmoqda",
            icon: Bell,
            tone: "from-rose-500/20 to-orange-500/10 text-rose-700 dark:text-rose-200",
        },
    ];

    const detailStats: StatCard[] = [
        {
            label: "Biznes katalogi",
            value: businessCourses.length,
            hint: "Workspace tarkibi",
            icon: BriefcaseBusiness,
            tone: "from-blue-500/20 to-cyan-500/10 text-blue-700 dark:text-blue-200",
        },
        {
            label: "Studiyam",
            value: myCourses.length,
            hint: "Shaxsiy kurslar",
            icon: BookOpen,
            tone: "from-slate-500/20 to-slate-400/10 text-slate-700 dark:text-slate-200",
        },
        {
            label: "Qoralamalar",
            value: draftCourses,
            hint: "Builder kutmoqda",
            icon: Layers3,
            tone: "from-amber-500/20 to-orange-500/10 text-amber-700 dark:text-amber-200",
        },
        {
            label: "Arxiv",
            value: archivedCount,
            hint: `${archiveRate}% portfel`,
            icon: Archive,
            tone: "from-fuchsia-500/20 to-violet-500/10 text-fuchsia-700 dark:text-fuchsia-200",
        },
    ];

    const quickLinks = [
        {label: "Yangi kurs", to: "/courses/add", hint: "Builderni ochish"},
        {label: "Jamoa", to: "/users", hint: "Teacher va assistantlar"},
        {label: "Tekshiruv", to: "/students", hint: "Vazifa va quiz oqimi"},
    ];

    const monitoringRows = [
        {
            label: "Faol katalog ulushi",
            value: `${activeRate}%`,
            progress: activeRate,
            hint: `${activeCourses} ta kurs faol holatda`,
        },
        {
            label: "Nashrga chiqqan kurslar",
            value: `${publishedRate}%`,
            progress: publishedRate,
            hint: `${publishedCourses} ta kurs learner-facing`,
        },
        {
            label: "Qoralama yuklamasi",
            value: `${draftCourses}`,
            progress: percentage(draftCourses, totalCourses || 1),
            hint: "Kontent tugallanmagan kurslar",
        },
        {
            label: "Arxiv hajmi",
            value: `${archivedCount}`,
            progress: archiveRate,
            hint: "Qayta faollashtirishga tayyor kurslar",
        },
    ];

    return (
        <>
            <PageMeta
                title="Boshqaruv"
                description="Ta'lim biznesingiz uchun statistik boshqaruv markazi."
            />

            <div className="mx-auto max-w-[1560px] space-y-5 pb-10">
                <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_0.95fr]">
                    <div className="relative overflow-hidden rounded-[30px] border border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <div className="absolute -right-14 top-0 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
                        <div className="absolute bottom-[-44px] left-[-26px] h-44 w-44 rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-500/10" />

                        <div className="relative space-y-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="max-w-3xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                                        <BriefcaseBusiness className="h-3.5 w-3.5" />
                                        Statistik boshqaruv paneli
                                    </div>

                                    <h2 className="mt-4 text-2xl font-bold tracking-[-0.05em] text-slate-950 dark:text-slate-100 md:text-[2.35rem]">
                                        Kurslar, jamoa va ish oqimi bo'yicha eng muhim sonlar bir joyda.
                                    </h2>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
                                        Bu panel marketing matndan ko'ra operatsion holatni ko'rsatadi: nechta kurs faol, nechta qoralama, jamoada kimlar bor va nimalar e'tibor kutmoqda.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:w-[360px] xl:grid-cols-1">
                                    {quickLinks.map((link) => (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className="group rounded-[18px] border border-slate-200 bg-white/90 px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/80 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-blue-500/30 dark:hover:bg-slate-900"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">{link.label}</div>
                                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{link.hint}</div>
                                                </div>
                                                <ArrowUpRight className="h-4.5 w-4.5 shrink-0 text-slate-400 transition group-hover:text-blue-700 dark:text-slate-500 dark:group-hover:text-blue-300" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-[20px] border border-blue-100 bg-blue-50/80 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-300">Faol ulush</div>
                                    <div className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">{activeRate}%</div>
                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activeCourses} ta kurs hozir faol</div>
                                </div>
                                <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/80 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Nashr ulushi</div>
                                    <div className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">{publishedRate}%</div>
                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{publishedCourses} ta kurs learner-facing</div>
                                </div>
                                <div className="rounded-[20px] border border-violet-100 bg-violet-50/80 px-4 py-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Jamoa tarkibi</div>
                                    <div className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">{teamMembers.length}</div>
                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{teachersCount} teacher, {assistantsCount} assistant</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                                {heroStats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                                    >
                                        <div className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${stat.tone}`}>
                                            <stat.icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-950 dark:text-slate-100">{stat.value}</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{stat.label}</div>
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.hint}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                                {detailStats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-[20px] border border-slate-200 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                                    >
                                        <div className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${stat.tone}`}>
                                            <stat.icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="mt-3 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">{stat.value}</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{stat.label}</div>
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stat.hint}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-[26px] border border-white/60 bg-white/86 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Jamoa va oqim</p>
                            <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Operatsion kesim</h3>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-[20px] border border-slate-200 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Teacherlar</div>
                                    <div className="mt-2 text-3xl font-bold tracking-[-0.05em] text-slate-950 dark:text-slate-100">{teachersCount}</div>
                                </div>
                                <div className="rounded-[20px] border border-slate-200 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Assistentlar</div>
                                    <div className="mt-2 text-3xl font-bold tracking-[-0.05em] text-slate-950 dark:text-slate-100">{assistantsCount}</div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Kuzatuv holati</div>
                                        <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">Bugungi monitoring signallari</div>
                                    </div>
                                    <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                                        {unreadCount} ta signal
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {monitoringRows.map((row) => (
                                        <div key={row.label} className="space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{row.label}</div>
                                                <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">{row.value}</div>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400"
                                                    style={{width: `${Math.min(row.progress, 100)}%`}}
                                                />
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{row.hint}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[26px] border border-white/60 bg-white/86 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                                    <Clock3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Tezkor vazifalar</p>
                                    <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Bugun nimaga qaraladi</h3>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {[
                                    `${draftCourses} ta qoralama builder'da yakunlanishi kerak`,
                                    `${archivedCount} ta kurs arxivdan qayta faollashtirilishi mumkin`,
                                    `${unreadCount} ta bildirishnoma javob kutmoqda`,
                                ].map((item, index) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-slate-50/75 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60"
                                    >
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100 dark:shadow-none">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[26px] border border-white/60 bg-white/86 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">So'nggi kurslar</p>
                                <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Portfel ichidagi harakat</h3>
                            </div>
                            <Link to="/courses" className="text-sm font-medium text-sky-700 dark:text-sky-300">
                                Barchasi
                            </Link>
                        </div>

                        <div className="mt-5 space-y-2.5">
                            {recentCourses.length === 0 ? (
                                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900 dark:shadow-none">
                                        <BookOpen className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Hali kurs yo'q</h4>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Birinchi curriculumni builder orqali yaratib boshlang.
                                    </p>
                                </div>
                            ) : (
                                recentCourses.map((course) => (
                                    <Link
                                        key={course.id}
                                        to={`/courses/details/${course.id}`}
                                        className="group flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-slate-50/75 px-4 py-3.5 transition hover:border-sky-200 hover:bg-sky-50/60 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-500/30 dark:hover:bg-slate-900"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                                <BookOpen className="h-4.5 w-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">
                                                    {course.name}
                                                </div>
                                                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {shortText(course.description, "Izoh kiritilmagan")}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                course.isPublished
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                                                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
                                            }`}>
                                                {course.isPublished ? "Nashrda" : "Qoralama"}
                                            </span>
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                course.active
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                                                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            }`}>
                                                {course.active ? "Faol" : "Arxiv"}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-[26px] border border-white/60 bg-white/86 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                                <Clock3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Bugungi snapshot</p>
                                <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Tez ko'rinadigan kesim</h3>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {[
                                {label: "Teacher", value: teachersCount},
                                {label: "Assistant", value: assistantsCount},
                                {label: "Studiyam", value: myCourses.length},
                                {label: "Biznes", value: businessCourses.length},
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-[18px] border border-slate-200 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                                >
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{item.label}</div>
                                    <div className="mt-2 text-2xl font-bold tracking-[-0.05em] text-slate-950 dark:text-slate-100">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">Eslatma</div>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Talabalar sonini ham shu panelga chiqarish uchun alohida student analytics yoki enrollment count endpointi kerak bo'ladi. Hozir bu panel faqat mavjud backend ma'lumotlari bilan ishlayapti.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
