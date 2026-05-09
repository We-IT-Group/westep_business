import React from "react";
import {useParams} from "react-router-dom";
import {DollarSign, FolderKanban, FileText} from "lucide-react";
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
    onBack?: () => void;
}

const ModulePlaceholder = () => (
    <div className="flex min-h-[620px] items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                <FolderKanban className="h-5 w-5"/>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Modul tanlandi</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Endi shu modul ichidan dars tanlang yoki yangi dars qo‘shing. Dars ma'lumotlari shu panelda ochiladi.
            </p>
        </div>
    </div>
);

const CoursePlaceholder = ({courseName}: {courseName?: string}) => (
    <div className="flex min-h-[620px] items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                <FileText className="h-5 w-5"/>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">{courseName || "Kurs"} kontenti</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Chap tomondan modul tanlang. So‘ng darsni bosing va ichidagi video, vazifa, test va resurslarni shu yerda to‘ldiring.
            </p>
        </div>
    </div>
);

const PricingPlaceholder = () => (
    <div className="flex min-h-[620px] items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                <DollarSign className="h-5 w-5"/>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Narx bo‘limi</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Bu yer keyingi bosqichda kursning tijoriy sozlamalari uchun ishlatiladi.
            </p>
        </div>
    </div>
);

const UnifiedEditor: React.FC<UnifiedEditorProps> = ({
    session,
    courseName,
    onBack,
}) => {
    const {id: courseId} = useParams<{ id: string }>();

    if (session.type === "none") {
        return (
            <div className="flex min-h-[620px] items-center justify-center px-6 py-8">
                <div className="w-full max-w-2xl rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                        <FileText className="h-6 w-6"/>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">{courseName || "Kurs"} builder</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Chap tomondan modul qo‘shing yoki mavjud modulni oching. Darsni bosganingizdan keyin uning barcha ma'lumotlari shu panelda sodda ko‘rinishda ochiladi.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.52),rgba(255,255,255,0.88))]">
            {session.type === "lesson" && (
                <AddLesson
                    lessonId={session.id ?? undefined}
                    courseId={courseId}
                    moduleId={session.moduleId ?? undefined}
                    onBack={onBack}
                />
            )}
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
