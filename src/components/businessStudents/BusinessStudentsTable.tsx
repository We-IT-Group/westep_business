import type {BusinessStudentOverview} from "../../types/types.ts";

const formatMoney = (value: number) =>
    `${new Intl.NumberFormat("uz-UZ").format(Math.round(value))} so‘m`;

const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed ? trimmed[0].toUpperCase() : "S";
};

type BusinessStudentsTableProps = {
    students: BusinessStudentOverview[];
};

export default function BusinessStudentsTable({students}: BusinessStudentsTableProps) {
    return (
        <div className="hidden overflow-x-auto lg:block">
            <div className="min-w-[1120px]">
                <div className="grid grid-cols-[2fr_2.1fr_1.1fr_0.9fr_0.9fr] gap-4 border-b border-slate-200 px-6 py-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                    <div>Student</div>
                    <div>Kurslar</div>
                    <div>To‘lov</div>
                    <div>Tugallagan</div>
                    <div>Davom etayotgan</div>
                </div>

                <div className="space-y-3 px-4 py-4">
                    {students.map((student) => (
                        <div
                            key={student.studentId}
                            className="grid grid-cols-[2fr_2.1fr_1.1fr_0.9fr_0.9fr] gap-4 rounded-[22px] border border-slate-200 bg-white/80 px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white shadow-[0_12px_26px_rgba(70,207,67,0.28)]">
                                    {getInitial(student.studentName)}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">{student.studentName}</div>
                                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {student.courseNames.length > 0 ? `${student.courseNames.length} ta kurs` : "Kurs biriktirilmagan"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap content-start gap-2">
                                {student.courseNames.length > 0 ? student.courseNames.map((courseName) => (
                                    <span
                                        key={`${student.studentId}-${courseName}`}
                                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {courseName}
                                    </span>
                                )) : (
                                    <span className="text-sm text-slate-400 dark:text-slate-500">Kurs yo‘q</span>
                                )}
                            </div>

                            <div className="self-center">
                                <div className="text-base font-semibold text-slate-950 dark:text-slate-100">{formatMoney(student.totalPaidAmount)}</div>
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Jami to‘langan</div>
                            </div>

                            <div className="self-center">
                                <div className="inline-flex min-w-14 items-center justify-center rounded-full bg-emerald-50 px-3 py-2 text-base font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    {student.completedCoursesCount}
                                </div>
                            </div>

                            <div className="self-center">
                                <div className="inline-flex min-w-14 items-center justify-center rounded-full bg-amber-50 px-3 py-2 text-base font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                    {student.ongoingCoursesCount}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
