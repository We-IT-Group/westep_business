import {AlertCircle, LoaderCircle, ShieldCheck, UsersRound} from "lucide-react";
import {useCourseStaff} from "../../api/courseStaff/useCourseStaff.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {isAssistantRole} from "../../api/auth/useAuth.ts";

const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed ? trimmed[0].toUpperCase() : "S";
};

const getRoleLabel = (role: string) => isAssistantRole(role) ? "Assistent" : "O‘qituvchi";

export default function CourseStaffSection({courseId}: { courseId: string }) {
    const staffQuery = useCourseStaff(courseId, Boolean(courseId));
    const parsedError = staffQuery.error ? parseApiError(staffQuery.error) : null;
    const isForbidden = parsedError?.status === 403;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Course staff</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Mas'ul staff</h2>
                </div>
                <div className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                    {staffQuery.data?.length || 0}
                </div>
            </div>

            <div className="mt-4">
                {staffQuery.isPending ? (
                    <div className="flex items-center justify-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Staff ro‘yxati yuklanmoqda...
                    </div>
                ) : staffQuery.isError ? (
                    <div className="rounded-[20px] border border-rose-200 bg-rose-50/80 px-5 py-8 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
                        <AlertCircle className="mx-auto h-5 w-5 text-rose-500 dark:text-rose-300" />
                        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                            {isForbidden ? "Staff ro‘yxatini ko‘rishga ruxsat yo‘q" : parsedError?.message || "Staff ro‘yxatini olib bo‘lmadi."}
                        </p>
                    </div>
                ) : !staffQuery.data?.length ? (
                    <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
                        <UsersRound className="mx-auto h-7 w-7 text-slate-400 dark:text-slate-500" />
                        <p className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">Hozircha mas'ul staff biriktirilmagan</p>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {staffQuery.data.map((member) => {
                            return (
                                <div
                                    key={member.userId}
                                    className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                                >
                                    <div className="flex items-center gap-3">
                                        {member.avatarUrl ? (
                                            <img
                                                src={member.avatarUrl}
                                                alt={member.fullName}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#46cf43] text-lg font-semibold text-white">
                                                {getInitial(member.fullName)}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">{member.fullName}</p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{member.phone || "Telefon mavjud emas"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {getRoleLabel(member.role)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
