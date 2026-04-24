import {ShieldCheck, Sparkles, UserRound, Phone, Building2, KeySquare, LoaderCircle, Users, BookOpen} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import {useUser} from "../api/auth/useAuth.ts";
import {useGetBusinessCourses, useGetMyCourses} from "../api/courses/useCourse.ts";
import {useGetUsers} from "../api/businessUser/useBusinessUser.ts";

export default function UserProfiles() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const {data: myCourses = [], isLoading: isMyCoursesLoading} = useGetMyCourses();
    const {data: businessCourses = [], isLoading: isBusinessCoursesLoading} = useGetBusinessCourses();
    const {data: members = [], isLoading: isMembersLoading} = useGetUsers(user?.businessId);

    const isLoading = isUserLoading || isMyCoursesLoading || isBusinessCoursesLoading || isMembersLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <LoaderCircle className="h-10 w-10 animate-spin text-sky-600"/>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Profile</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Identity workspace loading</h2>
                    </div>
                </div>
            </div>
        );
    }

    const infoCards = [
        {
            label: "Role",
            value: user?.roleName || "Unknown role",
            icon: ShieldCheck,
        },
        {
            label: "Phone",
            value: user?.phoneNumber ? `+${user.phoneNumber}` : "No phone",
            icon: Phone,
        },
        {
            label: "Business scope",
            value: user?.businessId || "No business attached",
            icon: Building2,
        },
    ];

    const statCards = [
        {
            label: "Personal Courses",
            value: myCourses.length,
            hint: "Teacher-owned course assets",
            icon: BookOpen,
            tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
        },
        {
            label: "Business Courses",
            value: businessCourses.length,
            hint: "Catalog under your workspace",
            icon: Sparkles,
            tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
        },
        {
            label: "Team Reach",
            value: members.length,
            hint: "Members inside your business",
            icon: Users,
            tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
        },
    ];

    const permissions = user?.permissionsList?.length ? user.permissionsList : ["Workspace access"];

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title="Profile"
                description="Workspace identity and operator profile"
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.9))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex items-start gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-950 text-white shadow-[0_20px_40px_rgba(15,23,42,0.14)] dark:bg-slate-900 dark:shadow-[0_20px_40px_rgba(2,6,23,0.35)]">
                                <UserRound className="h-8 w-8"/>
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                        Identity Layer
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                        {user?.roleName || "Workspace user"}
                                    </span>
                                </div>
                                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                                    {[user?.firstname, user?.lastname].filter(Boolean).join(" ") || "Workspace operator"}
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                                    Bu sahifa `GET /api/user/me` natijasini business va course konteksti bilan birlashtirib, operator identity’ni aniq ko‘rsatadi.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {statCards.map((card) => (
                                <div key={card.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${card.tone}`}>
                                        <card.icon className="h-5 w-5"/>
                                    </div>
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{card.label}</p>
                                    <div className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{card.value}</div>
                                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{card.hint}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-white/75 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/55">Operator card</p>
                                <h2 className="mt-3 text-2xl font-black tracking-tight">Workspace identity</h2>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                                <KeySquare className="h-5 w-5 text-white/80"/>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {infoCards.map((item) => (
                                <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-white/10 p-3">
                                            <item.icon className="h-4 w-4"/>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">{item.label}</p>
                                            <p className="mt-1 text-base font-black text-white break-all">{item.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Identity details</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Business context</h2>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                            <Building2 className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">First name</p>
                            <p className="mt-2 text-lg font-black text-slate-950 dark:text-slate-100">{user?.firstname || "-"}</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Last name</p>
                            <p className="mt-2 text-lg font-black text-slate-950 dark:text-slate-100">{user?.lastname || "-"}</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Phone</p>
                            <p className="mt-2 text-lg font-black text-slate-950 dark:text-slate-100">{user?.phoneNumber ? `+${user.phoneNumber}` : "-"}</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Business ID</p>
                            <p className="mt-2 text-lg font-black text-slate-950 break-all dark:text-slate-100">{user?.businessId || "-"}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Permissions</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Access profile</h2>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                            <ShieldCheck className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {permissions.map((permission) => (
                            <div
                                key={permission}
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                                {permission}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                        <p className="text-sm font-black text-slate-950 dark:text-slate-100">Next profile layer</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            `PUT /api/user/update` va `teacher-profiles/me` hooklari qo‘shilgach, shu sahifada editable professional identity va notification preferences ham ishlaydi.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
