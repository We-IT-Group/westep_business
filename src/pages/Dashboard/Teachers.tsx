import {BookOpen, GraduationCap, LoaderCircle, ShieldCheck, Sparkles, Users} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useUser} from "../../api/auth/useAuth.ts";
import {useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";
import {useGetUsers} from "../../api/businessUser/useBusinessUser.ts";

export default function Teachers() {
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
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">O‘qituvchilar</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Mentorlar bo‘limi yuklanmoqda</h2>
                    </div>
                </div>
            </div>
        );
    }

    const teachers = members.filter((member) => member.role === "TEACHER");
    const assistants = members.filter((member) => member.role === "ASSISTANT");
    const averageCourseLoad = teachers.length ? (businessCourses.length / teachers.length).toFixed(1) : "0.0";

    const heroCards = [
        {
            label: "Faol o‘qituvchilar",
            value: teachers.length,
            hint: "Teacher rolidagi biznes a'zolari",
            icon: GraduationCap,
            tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
        },
        {
            label: "Assistentlar yordami",
            value: assistants.length,
            hint: "Jarayonni qo‘llab-quvvatlovchi operatorlar",
            icon: Users,
            tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
        },
        {
            label: "O‘rtacha kurs yuki",
            value: averageCourseLoad,
            hint: "Har o‘qituvchiga to‘g‘ri keladigan biznes kurslar",
            icon: BookOpen,
            tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
        },
    ];

    const teacherSignals = [
        {
            title: "Mentorlar soni",
            description: `${teachers.length} teacher business ichida hozir mavjud.`,
        },
        {
            title: "Katalog talabi",
            description: `${businessCourses.length} ta business course mentor attention talab qilmoqda.`,
        },
        {
            title: "Shaxsiy o‘qituvchi kurslari",
            description: `${myCourses.length} ta personal course teacher studio tomonidan yaratilgan.`,
        },
    ];

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta
                title="O‘qituvchilar"
                description="O‘qituvchilar qamrovi va mentorlar boshqaruvi"
            />

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.9))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                Mentor stoli
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                Jamoa ijrosi
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                            Teacher coverage, support capacity va course load bitta operator panelda
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                            Mavjud business members va course API’lari asosida mentor operations sahifasi qayta yig‘ildi.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {heroCards.map((card) => (
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

                    <div className="rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(255,255,255,0.98))] p-5 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:text-slate-100 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-500/70 dark:text-slate-500">Qamrov holati</p>
                                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Joriy signallar</h2>
                            </div>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-200"/>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {teacherSignals.map((item) => (
                                <div key={item.title} className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{item.title}</p>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
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
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Ro‘yxat</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">O‘qituvchilar katalogi</h2>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
                            <Users className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {teachers.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                                Hozircha teacher biriktirilmagan.
                            </div>
                        ) : (
                            teachers.map((teacher) => (
                                <div key={teacher.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-base font-black text-slate-950 dark:text-slate-100">{teacher.fullName}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{teacher.phone || "Telefon ko‘rsatilmagan"}</p>
                                        </div>
                                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                            {teacher.role}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Keyingi qatlam</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Teacher API bloklari</h2>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                            <ShieldCheck className="h-5 w-5"/>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-sm font-black text-slate-950 dark:text-slate-100">Teacher profili</p>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                `GET/PUT /api/teacher-profiles/me` ulanadigan professional profile block shu yerga tushadi.
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <p className="text-sm font-black text-slate-950 dark:text-slate-100">Natijalar oynasi</p>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                                Homework review, quiz natijalari va discussion activity bilan mentor scorecard keyingi wave’da boyiydi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
