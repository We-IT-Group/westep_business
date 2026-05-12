import {useMemo, useState} from "react";
import {AlertCircle, GraduationCap, LoaderCircle, PiggyBank, RefreshCcw, SearchX, Sparkles} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useBusinessStudents} from "../../api/courseStudents/useBusinessStudents.ts";
import BusinessStudentsFilters from "../../components/businessStudents/BusinessStudentsFilters.tsx";
import BusinessStudentsTable from "../../components/businessStudents/BusinessStudentsTable.tsx";
import BusinessStudentsCardList from "../../components/businessStudents/BusinessStudentsCardList.tsx";
import {parseApiError} from "../../utils/apiError.ts";

export default function Students() {
    const [search, setSearch] = useState("");
    const studentsQuery = useBusinessStudents();

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        const students = studentsQuery.data || [];

        if (!query) {
            return students;
        }

        return students.filter((student) => {
            const nameMatched = student.studentName.toLowerCase().includes(query);
            const courseMatched = student.courseNames.some((courseName) => courseName.toLowerCase().includes(query));
            return nameMatched || courseMatched;
        });
    }, [search, studentsQuery.data]);

    const totals = useMemo(() => {
        return filteredStudents.reduce(
            (accumulator, student) => ({
                totalPaidAmount: accumulator.totalPaidAmount + student.totalPaidAmount,
                completedCoursesCount: accumulator.completedCoursesCount + student.completedCoursesCount,
                ongoingCoursesCount: accumulator.ongoingCoursesCount + student.ongoingCoursesCount,
            }),
            {
                totalPaidAmount: 0,
                completedCoursesCount: 0,
                ongoingCoursesCount: 0,
            },
        );
    }, [filteredStudents]);

    const summaryCards = [
        {
            label: "Studentlar",
            value: filteredStudents.length,
            icon: GraduationCap,
            tone: "from-sky-500/18 via-cyan-400/10 to-white dark:from-sky-500/18 dark:via-cyan-500/10 dark:to-slate-950",
            iconTone: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
        },
        {
            label: "To‘langan summa",
            value: `${new Intl.NumberFormat("uz-UZ").format(Math.round(totals.totalPaidAmount))} so‘m`,
            icon: PiggyBank,
            tone: "from-emerald-500/18 via-teal-400/10 to-white dark:from-emerald-500/18 dark:via-teal-500/10 dark:to-slate-950",
            iconTone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        },
        {
            label: "Tugallangan kurslar",
            value: totals.completedCoursesCount,
            icon: Sparkles,
            tone: "from-amber-500/18 via-orange-400/10 to-white dark:from-amber-500/18 dark:via-orange-500/10 dark:to-slate-950",
            iconTone: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
        },
        {
            label: "Davom etayotgan",
            value: totals.ongoingCoursesCount,
            icon: GraduationCap,
            tone: "from-violet-500/18 via-fuchsia-400/10 to-white dark:from-violet-500/18 dark:via-fuchsia-500/10 dark:to-slate-950",
            iconTone: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
        },
    ];

    const parsedError = studentsQuery.error ? parseApiError(studentsQuery.error) : null;
    const isForbidden = parsedError?.status === 403;

    return (
        <div className="mx-auto max-w-[1560px] space-y-5 pb-10">
            <PageMeta
                title="Studentlar"
                description="Teacher va biznes admin uchun studentlar ro‘yxati."
            />

            <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className={`overflow-hidden rounded-[22px] border border-white/70 bg-gradient-to-br ${card.tone} p-4 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-800 sm:rounded-[24px] sm:p-5 xl:p-6`}
                        >
                            <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] shadow-sm ${card.iconTone} sm:h-12 sm:w-12 sm:rounded-[16px]`}>
                                <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                            </div>
                            <div className="mt-4 sm:mt-5">
                                <p className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-2xl xl:text-3xl">{card.value}</p>
                                <p className="mt-1.5 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100 sm:text-base xl:text-lg">{card.label}</p>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/82 dark:shadow-[0_18px_45px_rgba(2,6,23,0.38)]">
                <div className="p-4 sm:p-5">
                    <BusinessStudentsFilters
                        search={search}
                        onSearchChange={setSearch}
                        totalCount={filteredStudents.length}
                    />
                </div>

                {studentsQuery.isLoading ? (
                    <div className="grid gap-4 px-4 pb-5 sm:px-5 lg:grid-cols-2 xl:grid-cols-3">
                        {Array.from({length: 6}).map((_, index) => (
                            <div
                                key={index}
                                className="h-44 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/70"
                            />
                        ))}
                    </div>
                ) : studentsQuery.isError ? (
                    <div className="px-5 pb-6">
                        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-6 py-12 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm dark:bg-slate-950 dark:text-rose-300">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">
                                {isForbidden ? "Bu sahifaga kirish ruxsati yo‘q" : "Studentlar yuklanmadi"}
                            </h3>
                            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                                {parsedError?.message || "Studentlar ro‘yxatini olib bo‘lmadi."}
                            </p>
                            {!isForbidden ? (
                                <button
                                    type="button"
                                    onClick={() => void studentsQuery.refetch()}
                                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Qayta urinish
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="px-5 pb-6">
                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
                                {search.trim() ? <SearchX className="h-7 w-7" /> : <LoaderCircle className="h-7 w-7" />}
                            </div>
                            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                                {search.trim() ? "Mos student topilmadi" : "Studentlar hali yo‘q"}
                            </h3>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                                {search.trim()
                                    ? "Qidiruvga mos ism yoki kurs topilmadi. Boshqa kalit so‘z bilan urinib ko‘ring."
                                    : "Bu biznes uchun studentlar ro‘yxati hali shakllanmagan."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 pb-5 sm:px-5">
                        <BusinessStudentsCardList students={filteredStudents} />
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/55">
                            <BusinessStudentsTable students={filteredStudents} />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
