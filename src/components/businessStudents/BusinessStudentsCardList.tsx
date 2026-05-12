import type {BusinessStudentOverview} from "../../types/types.ts";

const formatMoney = (value: number) =>
    `${new Intl.NumberFormat("uz-UZ").format(Math.round(value))} so‘m`;

const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed ? trimmed[0].toUpperCase() : "S";
};

type BusinessStudentsCardListProps = {
    students: BusinessStudentOverview[];
};

export default function BusinessStudentsCardList({students}: BusinessStudentsCardListProps) {
    return (
        <div className="space-y-4 lg:hidden">
            {students.map((student) => (
                <article
                    key={student.studentId}
                    className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white shadow-[0_12px_26px_rgba(70,207,67,0.28)]">
                            {getInitial(student.studentName)}
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">{student.studentName}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatMoney(student.totalPaidAmount)}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
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

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Tugallagan</p>
                            <p className="mt-2 text-lg font-semibold text-emerald-700 dark:text-emerald-300">{student.completedCoursesCount}</p>
                        </div>
                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Davom etayotgan</p>
                            <p className="mt-2 text-lg font-semibold text-amber-700 dark:text-amber-300">{student.ongoingCoursesCount}</p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
