import {Bell, BookOpen, Cog, KeyRound, LoaderCircle, ShieldCheck, Sparkles, Users, Workflow} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useUser} from "../../api/auth/useAuth.ts";
import {useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {useGetUsers} from "../../api/businessUser/useBusinessUser.ts";

const settingCards = [
    {
        title: "Hisob xavfsizligi",
        description: "Auth flow, token refresh va session lifecycle shu qatlamda boshqariladi.",
        icon: KeyRound,
        tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
    },
    {
        title: "Rollar boshqaruvi",
        description: "Teacher va assistant assignment business owner control’ida saqlanadi.",
        icon: Users,
        tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
    },
    {
        title: "Asosiy oqimlar",
        description: "Course archive/live, builder va review oqimlari workspace rules bilan uyg‘unlashadi.",
        icon: Workflow,
        tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
    },
];

export default function Settings() {
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
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Sozlamalar</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Workspace sozlamalari yuklanmoqda</h2>
                    </div>
                </div>
            </div>
        );
    }

    const readinessRows = [
        {
            label: "Joriy foydalanuvchi",
            value: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "Noma'lum foydalanuvchi",
            helper: user?.roleName || "Rol aniqlanmagan",
        },
        {
            label: "Biznes katalogi ulangan",
            value: `${businessCourses.length} ta faol biznes kurs`,
            helper: user?.businessId ? `Biznes ID: ${user.businessId}` : "Biznes scope ulanmagan",
        },
        {
            label: "Jamoa tayyor",
            value: `${members.length} ta a'zo`,
            helper: "Teacher va assistant boshqaruvi ulangan",
        },
        {
            label: "Shaxsiy studiya",
            value: `${myCourses.length} ta shaxsiy kurs`,
            helper: "Teacher yaratgan kurslar workspace ichida ko‘rinadi",
        },
    ];

    const extensionSlots = [
        {
            title: "Bildirishnomalar markazi",
            description: "Bu slot `GET /api/notifications`, `unread-count`, `read-all` ulanishiga tayyor.",
            icon: Bell,
        },
        {
            title: "Profilni tahrirlash",
            description: "Bu slot `PUT /api/user/update` va `PUT /api/teacher-profiles/me` uchun staging maydon bo‘ladi.",
            icon: Cog,
        },
        {
            title: "Nashr siyosatlari",
            description: "Course lifecycle defaults va moderation rules keyingi wave’da shu yerga ulanadi.",
            icon: ShieldCheck,
        },
    ];

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title="Sozlamalar"
                description="Workspace sozlamalari va hisob tayyorligi"
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.9))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                Workspace boshqaruvi
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                {user?.roleName || "Operator"}
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                            Account, team va system readiness bitta control center ichida
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                            Bu sahifa hozirgi mavjud API’lar bilan workspace state’ni ko‘rsatadi va hali ulanmagan endpointlar uchun tayyor integration slotlarni beradi.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {settingCards.map((card) => (
                                <div key={card.title} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${card.tone}`}>
                                        <card.icon className="h-5 w-5"/>
                                    </div>
                                    <p className={`mt-4 text-base tracking-tight text-slate-950 dark:text-slate-100 ${card.title.includes("Asosiy") ? "font-semibold" : "font-black"}`}>{card.title}</p>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(255,255,255,0.98))] p-5 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:text-slate-100 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-500/70 dark:text-slate-500">Joriy tayyorgarlik</p>
                                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Boshqaruv xaritasi</h2>
                            </div>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-200"/>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {readinessRows.map((row) => (
                                <div key={row.label} className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{row.label}</p>
                                    <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{row.value}</p>
                                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{row.helper}</p>
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
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Hozir ulangan</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Faol tizim bloklari</h2>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                            <ShieldCheck className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300 dark:shadow-none">
                                <BookOpen className="h-5 w-5"/>
                            </div>
                            <p className="mt-4 text-base font-black text-slate-950 dark:text-slate-100">Kurs hayot sikli</p>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                `/api/course/get`, `/api/course/my-business`, archive/live toggle va builder flowlar ishlayapti.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/75 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300 dark:shadow-none">
                                <Users className="h-5 w-5"/>
                            </div>
                            <p className="mt-4 text-base font-black text-slate-950 dark:text-slate-100">Jamoa boshqaruvi</p>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                `/business/members`, `teacher/add`, `assistant/add/remove` orqali team orchestration ulangan.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Keyingi integratsiyalar</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Tayyor slotlar</h2>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                            <Cog className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {extensionSlots.map((slot) => (
                            <div key={slot.title} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300 dark:shadow-none">
                                        <slot.icon className="h-4 w-4"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-950 dark:text-slate-100">{slot.title}</p>
                                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{slot.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
