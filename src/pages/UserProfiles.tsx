import {BookOpen, LoaderCircle, Phone, ShieldCheck, Users, UserRound} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import {useUser} from "../api/auth/useAuth.ts";
import {useGetBusinessCourses, useGetMyCourses} from "../api/courses/useCourse.ts";
import {useGetUsers} from "../api/businessUser/useBusinessUser.ts";

const getFullName = (firstname?: string, lastname?: string) =>
    [firstname, lastname].filter(Boolean).join(" ").trim() || "Foydalanuvchi";

const getRoleLabel = (roleName?: string) => {
    const normalized = (roleName || "").toUpperCase();

    if (normalized.includes("BUSINESS_ADMIN")) return "Biznes admin";
    if (normalized.includes("TEACHER")) return "O‘qituvchi";
    if (normalized.includes("ASSISTANT")) return "Assistent";
    if (normalized.includes("STUDENT")) return "O‘quvchi";

    return "Workspace user";
};

export default function UserProfiles() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const {data: myCourses = [], isLoading: isMyCoursesLoading} = useGetMyCourses();
    const {data: businessCourses = [], isLoading: isBusinessCoursesLoading} = useGetBusinessCourses();
    const {data: members = [], isLoading: isMembersLoading} = useGetUsers(user?.businessId);

    const isLoading = isUserLoading || isMyCoursesLoading || isBusinessCoursesLoading || isMembersLoading;
    const fullName = getFullName(user?.firstname, user?.lastname);
    const roleLabel = getRoleLabel(user?.roleName);
    const phoneLabel = user?.phoneNumber ? `+${user.phoneNumber}` : "Telefon kiritilmagan";

    const statCards = [
        {
            label: "Mening kurslarim",
            value: myCourses.length,
            icon: BookOpen,
        },
        {
            label: "Biznes kurslari",
            value: businessCourses.length,
            icon: ShieldCheck,
        },
        {
            label: "Jamoa",
            value: members.length,
            icon: Users,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <LoaderCircle className="h-5 w-5 animate-spin text-blue-600"/>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Profil yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1320px] space-y-4 pb-10">
            <PageMeta
                title="Profil"
                description="Foydalanuvchi profili"
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                            <UserRound className="h-7 w-7"/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">{fullName}</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Profil ma’lumotlari va ishchi ko‘rsatkichlar.
                            </p>
                        </div>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                        {roleLabel}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-3 md:grid-cols-3">
                    {statCards.map((card) => (
                        <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
                                <card.icon className="h-5 w-5"/>
                            </div>
                            <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{card.value}</div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ism</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">{fullName}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Phone className="h-4 w-4"/>
                            Telefon
                        </div>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">{phoneLabel}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
