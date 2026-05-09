import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {
    BookOpen,
    Plus,
    Search,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useGetBusinessCourses, useGetInactiveBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import CourseCard from "../../components/courses/CourseCard.tsx";
import {Course} from "../../types/types.ts";
import {Input} from "../../components/ui/input.tsx";
import {isCourseManagerRole, useUser} from "../../api/auth/useAuth.ts";

type CourseSource = "my" | "business" | "inactive";
type CourseFilter = "all" | "active" | "inactive";

const sourceOptions: Array<{ id: CourseSource; label: string; helper: string }> = [
    {id: "my", label: "Mening kurslarim", helper: "O'zim yaratgan"},
    {id: "business", label: "Biznes kurslari", helper: "Barcha biznes kurslari"},
    {id: "inactive", label: "Nofaol kurslar", helper: "Studentlarga ko'rinmaydi"},
];

export default function Courses() {
    const {data: user} = useUser();
    const canManageCourses = isCourseManagerRole(user?.roleName);
    const [source, setSource] = useState<CourseSource>("my");
    const [activeFilter, setActiveFilter] = useState<CourseFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const myResult = useGetMyCourses();
    const businessResult = useGetBusinessCourses(canManageCourses);
    const inactiveResult = useGetInactiveBusinessCourses(canManageCourses);

    const mergedPortfolio = useMemo(() => {
        const uniqueCourses = new Map<string, Course>();

        [inactiveResult.data || [], myResult.data || [], businessResult.data || []].forEach((courseList) => {
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
    }, [businessResult.data, inactiveResult.data, myResult.data]);

    const inactiveCourses = useMemo(
        () => mergedPortfolio.filter((course) => !course.active),
        [mergedPortfolio],
    );

    const courses = useMemo(() => {
        if (source === "my") return myResult.data || [];
        if (source === "business") return businessResult.data || [];
        return inactiveCourses;
    }, [businessResult.data, inactiveCourses, myResult.data, source]);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredCourses = useMemo(() => (
        courses.filter((course) => {
            const matchesSearch = !normalizedQuery
                || course.name?.toLowerCase().includes(normalizedQuery)
                || course.description?.toLowerCase().includes(normalizedQuery);

            const matchesFilter = activeFilter === "all"
                || (activeFilter === "active" && course.active)
                || (activeFilter === "inactive" && !course.active);

            return matchesSearch && matchesFilter;
        })
    ), [activeFilter, courses, normalizedQuery]);

    const sourceCounts: Record<CourseSource, number> = {
        my: myResult.data?.length || 0,
        business: businessResult.data?.length || 0,
        inactive: inactiveCourses.length,
    };

    const isLoading = myResult.isLoading || businessResult.isLoading || inactiveResult.isLoading;
    const visibleSourceOptions = canManageCourses
        ? sourceOptions
        : sourceOptions.filter((option) => option.id === "my");

    return (
        <div className="mx-auto max-w-[1320px] space-y-4 pb-10">
            <PageMeta
                title="Kurslar oynasi"
                description="Ta'lim mahsulotlarini boshqarish uchun ishchi panel."
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Kurslar</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kurslarni yaratish, tahrirlash va active holatini boshqarish.
                        </p>
                    </div>
                    {canManageCourses ? (
                        <Link
                            to="/courses/create"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 md:w-auto"
                        >
                            <Plus className="h-4 w-4" />
                            Yangi kurs
                        </Link>
                    ) : null}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-3">
                    <div className="grid gap-2 md:grid-cols-3">
                        {visibleSourceOptions.map((option) => {
                            const active = source === option.id;
                            const count = sourceCounts[option.id];

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSource(option.id)}
                                    className={`rounded-xl border px-4 py-3 text-left transition ${
                                        active
                                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-200"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold">{option.label}</span>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            active
                                                ? "bg-blue-600 text-white dark:bg-blue-500"
                                                : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                                        }`}>
                                            {count}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.helper}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                            {(["all", "active", "inactive"] as CourseFilter[]).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setActiveFilter(filter)}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        activeFilter === filter
                                            ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                    }`}
                                >
                                    {filter === "all" ? "Barchasi" : filter === "active" ? "Active" : "Nofaol"}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:max-w-[320px]">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Kurslarni qidirish..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="rounded-xl border-slate-200 bg-white py-3 pl-11 pr-4 text-sm dark:border-slate-800 dark:bg-slate-950"
                        />
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {filteredCourses.length} ta kurs ko‘rinmoqda.
                    </p>
                </div>
            </section>

            {isLoading ? (
                <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-[260px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
                    ))}
                </section>
            ) : filteredCourses.length > 0 ? (
                <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} source={source} canManageCourse={canManageCourses}/>
                    ))}
                </section>
            ) : (
                <section className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">Kurs topilmadi</h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {normalizedQuery
                            ? `"${searchQuery}" bo'yicha mos kurs topilmadi.`
                            : "Bu bo'limda hozircha kurs yo'q."}
                    </p>
                    {canManageCourses ? (
                        <Link
                            to="/courses/create"
                            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Kurs yaratish
                        </Link>
                    ) : null}
                </section>
            )}
        </div>
    );
}
