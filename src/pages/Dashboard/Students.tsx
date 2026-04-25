import {useMemo, useState} from "react";
import {BookOpenText, Users} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import CourseStudentsSection from "../../components/courseDetails/CourseStudentsSection.tsx";
import {useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {Course} from "../../types/types.ts";

type SelectionCardProps = {
    title: string;
    description: string;
    items: Array<{ id: string; title: string; helper?: string }>;
    selectedId: string | null;
    onSelect: (id: string) => void;
    emptyMessage: string;
    isLoading?: boolean;
};

function SelectionCard({
    title,
    description,
    items,
    selectedId,
    onSelect,
    emptyMessage,
    isLoading,
}: SelectionCardProps) {
    return (
        <div className="rounded-[24px] border border-white/60 bg-white/86 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Kurs tanlash</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>

            <div className="mt-4 space-y-2.5">
                {isLoading ? (
                    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        Yuklanmoqda...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                        {emptyMessage}
                    </div>
                ) : (
                    items.map((item) => {
                        const active = selectedId === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onSelect(item.id)}
                                className={`w-full rounded-[18px] border px-4 py-3.5 text-left transition ${
                                    active
                                        ? "border-sky-200 bg-sky-50 shadow-sm dark:border-sky-500/30 dark:bg-sky-500/10"
                                        : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className={`truncate text-sm font-semibold tracking-tight ${active ? "text-sky-900 dark:text-sky-200" : "text-slate-950 dark:text-slate-100"}`}>
                                            {item.title}
                                        </div>
                                        {item.helper ? (
                                            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.helper}</div>
                                        ) : null}
                                    </div>

                                    {active ? (
                                        <div className="rounded-full bg-sky-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-sky-500/20 dark:text-sky-100">
                                            Tanlandi
                                        </div>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default function Students() {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const myCoursesQuery = useGetMyCourses();
    const businessCoursesQuery = useGetBusinessCourses();

    const allCourses = useMemo(() => {
        const uniqueCourses = new Map<string, Course>();
        [...(myCoursesQuery.data || []), ...(businessCoursesQuery.data || [])].forEach((course) => {
            uniqueCourses.set(course.id, course);
        });
        return Array.from(uniqueCourses.values());
    }, [businessCoursesQuery.data, myCoursesQuery.data]);

    const selectedCourse = useMemo(
        () => allCourses.find((course) => course.id === selectedCourseId) || null,
        [allCourses, selectedCourseId],
    );

    const courseItems = useMemo(
        () => allCourses.map((course) => ({
            id: course.id,
            title: course.name,
            helper: course.isPublished ? "Nashrdagi kurs" : "Qoralama kurs",
        })),
        [allCourses],
    );

    return (
        <div className="mx-auto max-w-[1560px] space-y-5 pb-10">
            <PageMeta
                title="Kurs studentlari"
                description="Teacher va biznes admin uchun kurs bo‘yicha studentlar oynasi."
            />

            <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                <SelectionCard
                    title="Kurs studentlarini ko‘rish"
                    description="Kursni tanlang, shu kursga biriktirilgan studentlar va ularning homework, test, message statistikalari shu yerda ochiladi."
                    items={courseItems}
                    selectedId={selectedCourseId}
                    onSelect={setSelectedCourseId}
                    emptyMessage="Kurs topilmadi."
                    isLoading={myCoursesQuery.isLoading || businessCoursesQuery.isLoading}
                />

                <div className="rounded-[24px] border border-white/60 bg-white/86 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Tanlangan kurs</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                            <BookOpenText className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
                                {selectedCourse?.name || "Kurs tanlanmagan"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {selectedCourse
                                    ? "Studentlar ro‘yxati, progress va faoliyat tafsilotlari pastda ko‘rinadi."
                                    : "Chap tomondan kursni tanlang."}
                            </p>
                        </div>
                    </div>

                    {selectedCourse ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Holat</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {selectedCourse.active ? "Faol" : "Nofaol"}
                                </p>
                            </div>
                            <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Nashr</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {selectedCourse.isPublished ? "Nashrda" : "Qoralama"}
                                </p>
                            </div>
                            <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Business</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {selectedCourse.businessId || "Belgilanmagan"}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>

            {!selectedCourseId ? (
                <section className="rounded-[28px] border border-white/60 bg-white/86 px-6 py-16 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400 shadow-sm dark:bg-slate-900 dark:text-slate-500 dark:shadow-none">
                        <Users className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Studentlar paneli hali ochilmadi</h3>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                        Yuqoridan kursni tanlang. Keyin shu kursga tegishli studentlar ro‘yxati, progress va homework/test/message tafsilotlari ochiladi.
                    </p>
                </section>
            ) : (
                <section className="overflow-hidden rounded-[28px] border border-white/60 bg-white/92 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                    <CourseStudentsSection courseId={selectedCourseId} />
                </section>
            )}
        </div>
    );
}
