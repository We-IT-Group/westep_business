import React from "react";
import {useParams} from "react-router-dom";
import {
    ClipboardCheck,
    DollarSign,
    FolderKanban,
    Sparkles,
    Target,
    Users,
} from "lucide-react";
import AddLesson from "./lessonDetails/AddLesson";
import TrackingLinksSection from "./TrackingLinksSection";
import HomeworkReviewSection from "./HomeworkReviewSection";
import DiscussionSection from "./DiscussionSection";
import QuizAnalyticsSection from "./QuizAnalyticsSection";
import CourseStudentsSection from "./CourseStudentsSection.tsx";

type SessionType =
    | "lesson"
    | "module"
    | "course"
    | "pricing"
    | "analytics"
    | "students"
    | "homework"
    | "discussions"
    | "quizzes"
    | "none";

interface UnifiedEditorProps {
    session: {
        type: SessionType;
        id: string | null;
        moduleId?: string | null;
    };
    courseName?: string;
}

const placeholderCards = [
    {
        title: "Build curriculum rhythm",
        description: "Modullarni chap navigator orqali tanlang va lessonlar oqimini bosqichma-bosqich to‘ldiring.",
        icon: FolderKanban,
        tone: "from-sky-500/15 to-cyan-400/10 text-sky-700",
    },
    {
        title: "Review student work",
        description: "Homework, quiz va discussions bloklari teacher feedback workflow’ini birlashtiradi.",
        icon: ClipboardCheck,
        tone: "from-emerald-500/15 to-teal-400/10 text-emerald-700",
    },
    {
        title: "Track enrolled students",
        description: "Progress, submissions va message activity course ichida student kesimida ko‘rinadi.",
        icon: Users,
        tone: "from-violet-500/15 to-indigo-400/10 text-violet-700",
    },
    {
        title: "Track acquisition",
        description: "Analytics bo‘limida promo linklar va conversion signal’larini ko‘rib boring.",
        icon: Target,
        tone: "from-amber-500/15 to-orange-400/10 text-amber-700",
    },
];

const ModulePlaceholder = () => (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,rgba(240,249,255,0.8),rgba(255,255,255,0.9))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-600">Module blueprint</p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Module settings will live here</h3>
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                        Bu joyga modul detaili, reorder priority, pricing va unlock rules kabi boshqaruvlar yig‘iladi.
                    </p>
                </div>
                <div className="rounded-[24px] bg-sky-500/10 p-4 text-sky-700">
                    <FolderKanban className="h-6 w-6"/>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
                    <div className="text-sm font-black text-slate-900">Identity</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Title, description va learner-facing message.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
                    <div className="text-sm font-black text-slate-900">Access logic</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Order, prerequisite va availability conditions.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
                    <div className="text-sm font-black text-slate-900">Monetization</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Price layers va packaging strategy shu blokka tushadi.</p>
                </div>
            </div>
        </div>
    </div>
);

const CoursePlaceholder = ({courseName}: {courseName?: string}) => (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.97),rgba(248,250,252,0.94))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Course blueprint</p>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{courseName || "Course"} operational view</h3>
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                        Bu canvas course promise, positioning, publishing cadence va internal operating notes uchun markaziy joy bo‘ladi.
                    </p>
                </div>
                <div className="rounded-[24px] bg-slate-950 p-4 text-white">
                    <Sparkles className="h-6 w-6"/>
                </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
                    <div className="text-sm font-black text-slate-900">Positioning</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Kurs kimga mo‘ljallangani va qanday natija va’da qilishini belgilash.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
                    <div className="text-sm font-black text-slate-900">Publishing rhythm</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Draft, live, archived holatlar va release ops shu yerda boshqariladi.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
                    <div className="text-sm font-black text-slate-900">Team notes</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Teacher, assistant va business owner uchun internal coordination bloki.</p>
                </div>
            </div>
        </div>
    </div>
);

const PricingPlaceholder = () => (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.9),rgba(255,255,255,0.94))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-600">Revenue design</p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Pricing workspace is staged for next pass</h3>
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                        Bu bo‘lim kurs pricing tiers, package offers va access strategy uchun maxsus control surface bo‘ladi.
                    </p>
                </div>
                <div className="rounded-[24px] bg-emerald-500/10 p-4 text-emerald-700">
                    <DollarSign className="h-6 w-6"/>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
                    <div className="text-sm font-black text-slate-900">Tier plans</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Basic, premium yoki bundle kabi takliflar shu yerga ulanadi.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
                    <div className="text-sm font-black text-slate-900">Commercial rules</div>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Discount, promo period va visibility shartlari shu yerda jamlanadi.</p>
                </div>
            </div>
        </div>
    </div>
);

const UnifiedEditor: React.FC<UnifiedEditorProps> = ({session, courseName}) => {
    const {id: courseId} = useParams<{ id: string }>();

    if (session.type === "none") {
        return (
            <div className="mx-auto flex min-h-[680px] max-w-5xl flex-col justify-center px-6 py-12 md:px-8">
                <div className="rounded-[36px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.06)]">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700">
                                <Sparkles className="h-3.5 w-3.5"/>
                                Curriculum canvas
                            </div>
                            <h3 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                                Select a lesson, module or review flow to begin shaping {courseName || "this course"}
                            </h3>
                            <p className="mt-4 text-sm font-medium leading-7 text-slate-500">
                                Chapdagi navigator course structure bilan ishlaydi. Lessonni tanlasangiz editor ochiladi, analytics va review bloklari esa operatsion workspace’ga o‘tadi.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
                            {placeholderCards.map((card) => (
                                <div key={card.title} className="rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                                    <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${card.tone}`}>
                                        <card.icon className="h-5 w-5"/>
                                    </div>
                                    <h4 className="mt-4 text-base font-black tracking-tight text-slate-950">{card.title}</h4>
                                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.52),rgba(255,255,255,0.88))]">
            {session.type === "lesson" && <AddLesson lessonId={session.id ?? undefined} courseId={courseId} moduleId={session.moduleId ?? undefined}/>}
            {session.type === "analytics" && courseId && <TrackingLinksSection courseId={courseId}/>}
            {session.type === "students" && courseId && <CourseStudentsSection courseId={courseId}/>}
            {session.type === "homework" && courseId && <HomeworkReviewSection courseId={courseId}/>}
            {session.type === "discussions" && courseId && <DiscussionSection courseId={courseId}/>}
            {session.type === "quizzes" && courseId && <QuizAnalyticsSection courseId={courseId}/>}
            {session.type === "module" && <ModulePlaceholder/>}
            {session.type === "course" && <CoursePlaceholder courseName={courseName}/>}
            {session.type === "pricing" && <PricingPlaceholder/>}
        </div>
    );
};

export default UnifiedEditor;
