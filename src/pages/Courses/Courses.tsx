import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {
    Archive,
    ArrowRight,
    BookOpen,
    Compass,
    Layers3,
    Plus,
    Search,
    Sparkles,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useGetArchivedBusinessCourses, useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {Button} from "../../components/ui/button/newButton.tsx";
import CourseCard from "../../components/courses/CourseCard.tsx";
import {Course} from "../../types/types.ts";
import {CourseCreationFlow} from "../../components/courses/CourseCreationFlow.tsx";
import {Input} from "../../components/ui/input.tsx";

type CourseSource = "my" | "business" | "archived";
type CourseFilter = "all" | "published" | "draft";

const sourceOptions: Array<{ id: CourseSource; label: string; helper: string }> = [
    {id: "my", label: "Mening studiyam", helper: "O'zim yaratgan kurslar"},
    {id: "business", label: "Biznes katalogi", helper: "Workspace ichidagi faol kurslar"},
    {id: "archived", label: "Arxiv ombori", helper: "Saqlab qo'yilgan kurslar"},
];

export default function Courses() {
    const [source, setSource] = useState<CourseSource>("my");
    const [activeFilter, setActiveFilter] = useState<CourseFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreationFlow, setShowCreationFlow] = useState(false);

    const myResult = useGetMyCourses();
    const businessResult = useGetBusinessCourses();
    const archivedResult = useGetArchivedBusinessCourses();

    const mergedPortfolio = useMemo(() => {
        const uniqueCourses = new Map<string, Course>();

        [archivedResult.data || [], myResult.data || [], businessResult.data || []].forEach((courseList) => {
            courseList.forEach((course) => {
                const existing = uniqueCourses.get(course.id);

                if (!existing) {
                    uniqueCourses.set(course.id, course);
                    return;
                }

                if (!existing.active && course.active) {
                    uniqueCourses.set(course.id, {...existing, ...course});
                    return;
                }

                if (existing.active && !course.active) {
                    return;
                }

                uniqueCourses.set(course.id, {...existing, ...course});
            });
        });

        return Array.from(uniqueCourses.values());
    }, [archivedResult.data, businessResult.data, myResult.data]);

    const businessCourses = useMemo(
        () => mergedPortfolio.filter((course) => course.active),
        [mergedPortfolio],
    );

    const archivedCourses = useMemo(
        () => mergedPortfolio.filter((course) => !course.active),
        [mergedPortfolio],
    );

    const courses = useMemo(() => {
        if (source === "my") return myResult.data || [];
        if (source === "business") return businessCourses;
        return archivedCourses;
    }, [archivedCourses, businessCourses, myResult.data, source]);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredCourses = useMemo(() => (
        courses.filter((course) => {
            const matchesSearch = !normalizedQuery
                || course.name?.toLowerCase().includes(normalizedQuery)
                || course.description?.toLowerCase().includes(normalizedQuery);

            const matchesFilter = activeFilter === "all"
                || (activeFilter === "published" && course.isPublished)
                || (activeFilter === "draft" && !course.isPublished);

            return matchesSearch && matchesFilter;
        })
    ), [activeFilter, courses, normalizedQuery]);

    const sourceCounts = {
        my: myResult.data?.length || 0,
        business: businessCourses.length,
        archived: archivedCourses.length,
    };

    const stats = [
        {
            label: "Jami portfel",
            value: mergedPortfolio.length,
            hint: `${sourceCounts.business} ta catalogda`,
            icon: BookOpen,
            accent: "from-sky-500/20 to-blue-500/10 text-sky-700",
        },
        {
            label: "Hozir nashrda",
            value: mergedPortfolio.filter((course) => course.isPublished).length,
            hint: `${mergedPortfolio.filter((course) => !course.isPublished).length} ta draft`,
            icon: Sparkles,
            accent: "from-emerald-500/20 to-teal-500/10 text-emerald-700",
        },
        {
            label: "Arxiv ombori",
            value: sourceCounts.archived,
            hint: "Tiklashga tayyor",
            icon: Archive,
            accent: "from-violet-500/20 to-indigo-500/10 text-violet-700",
        },
    ];

    const sourceMeta = sourceOptions.find((item) => item.id === source);
    const isLoading = myResult.isLoading || businessResult.isLoading || archivedResult.isLoading;

    return (
        <div className="mx-auto max-w-[1560px] space-y-4 pb-10">
            <PageMeta
                title="Kurslar oynasi"
                description="Ta'lim mahsulotlarini boshqarish uchun ishchi panel."
            />

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.8fr]">
                <div className="relative overflow-hidden rounded-[24px] border border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 text-slate-900 shadow-[0_14px_32px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))] dark:text-slate-100 dark:shadow-[0_14px_32px_rgba(2,6,23,0.4)] md:p-5">
                    <div className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
                    <div className="absolute bottom-[-28px] left-[-18px] h-28 w-28 rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-500/10" />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                            <Compass className="h-3 w-3" />
                            Kurslar
                        </div>

                        <h1 className="mt-3 max-w-2xl text-[1.65rem] font-bold leading-[1.05] tracking-[-0.04em] md:text-[2rem]">
                            Kurslar katalogini ixcham boshqaring.
                        </h1>

                        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-300">
                            Yaratish, nashr qilish va arxiv oqimi shu oynada.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                                onClick={() => setShowCreationFlow(true)}
                                className="rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg transition hover:scale-[1.01] hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" />
                                Yangi kurs
                            </Button>

                            <Link
                                to="/students"
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-blue-200 dark:hover:bg-slate-800"
                            >
                                Tekshiruv
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {stats.map((stat) => (
                                <div key={stat.label} className="rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                    <div className={`inline-flex rounded-lg bg-gradient-to-br p-1.5 ${stat.accent}`}>
                                        <stat.icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="mt-2 text-lg font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">{stat.value}</div>
                                    <div className="mt-1 text-xs font-semibold leading-4 text-slate-900 dark:text-slate-100">{stat.label}</div>
                                    <div className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{stat.hint}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[22px] border border-white/60 bg-white/86 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_14px_30px_rgba(2,6,23,0.35)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Joriy inventar</p>
                    <h2 className="mt-1.5 text-xl font-bold tracking-[-0.03em] text-slate-950 dark:text-slate-100">
                        {sourceMeta?.label}
                    </h2>
                    <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                        {sourceMeta?.helper}
                    </p>

                    <div className="mt-4 space-y-2">
                        {sourceOptions.map((option) => {
                            const active = source === option.id;
                            const count = sourceCounts[option.id];

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSource(option.id)}
                                    className={`flex w-full items-center justify-between rounded-[16px] border px-3.5 py-3 text-left transition ${
                                        active
                                            ? "border-sky-200 bg-sky-50 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/10"
                                            : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                    }`}
                                >
                                    <div>
                                        <div className={`text-sm font-semibold tracking-[-0.02em] ${active ? "text-sky-900 dark:text-sky-200" : "text-slate-900 dark:text-slate-100"}`}>
                                            {option.label}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.helper}</div>
                                    </div>
                                    <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${active ? "bg-sky-900 text-white dark:bg-sky-500/20 dark:text-sky-100" : "bg-white text-slate-500 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"}`}>
                                        {count}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="rounded-[26px] border border-white/60 bg-white/86 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)] md:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="flex flex-wrap items-center gap-1.5 rounded-[16px] bg-slate-100/80 p-1.5 dark:bg-slate-900/80">
                            {(["all", "published", "draft"] as CourseFilter[]).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setActiveFilter(filter)}
                                    className={`rounded-xl px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition ${
                                        activeFilter === filter
                                            ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    }`}
                                >
                                    {filter === "all" ? "Barchasi" : filter === "published" ? "Nashrda" : "Qoralama"}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                            {filteredCourses.length} ta course ko‘rinmoqda
                        </div>
                    </div>

                    <div className="relative w-full xl:max-w-[300px]">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Kurslarni qidirish..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="rounded-[16px] border-slate-200 bg-slate-50 py-4 pl-11 pr-4 text-sm font-medium text-slate-700 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
                        />
                    </div>
                </div>
            </section>

            {isLoading ? (
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-[300px] animate-pulse rounded-[24px] border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70" />
                    ))}
                </section>
            ) : filteredCourses.length > 0 ? (
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} source={source}/>
                    ))}
                </section>
            ) : (
                <section className="rounded-[28px] border border-white/60 bg-white/86 px-6 py-16 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400 shadow-sm dark:bg-slate-900 dark:text-slate-500 dark:shadow-none">
                        <Layers3 className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Kurs topilmadi</h3>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                        {normalizedQuery
                            ? `"${searchQuery}" bo'yicha mos course topilmadi. Query yoki filterlarni almashtirib ko'ring.`
                            : "Bu bo'limda hozircha course yo'q. Yangi premium curriculum yaratishni shu yerdan boshlashingiz mumkin."}
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                        <Button
                            onClick={() => setShowCreationFlow(true)}
                            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white dark:bg-blue-600"
                        >
                            <Plus className="h-4 w-4" />
                            Kurs yaratish
                        </Button>
                        <Link
                            to="/users"
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            Jamoani ochish
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            )}

            <CourseCreationFlow
                open={showCreationFlow}
                onClose={() => setShowCreationFlow(false)}
            />
        </div>
    );
}
