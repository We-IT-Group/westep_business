import {FormEvent, useEffect, useState} from "react";
import {BookOpenText, Search} from "lucide-react";
import {useSearchParams} from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard.tsx";
import {Button} from "../../components/ui/button.tsx";
import {Input} from "../../components/ui/input.tsx";
import LessonTeacherReviewPanel from "../../components/courseDetails/lessonDetails/LessonTeacherReviewPanel.tsx";

export default function Students() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [lessonIdInput, setLessonIdInput] = useState(searchParams.get("lessonId") || "");
    const activeLessonId = searchParams.get("lessonId") || "";

    useEffect(() => {
        setLessonIdInput(activeLessonId);
    }, [activeLessonId]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedLessonId = lessonIdInput.trim();
        if (!normalizedLessonId) {
            setSearchParams({});
            return;
        }

        setSearchParams({lessonId: normalizedLessonId});
    };

    return (
        <>
            <PageMeta
                title="Students"
                description="Teacher and business admin review workspace"
            />

            <div className="space-y-6 p-8 max-w-[1600px] mx-auto">
                <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white px-7 py-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Teacher Workspace</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Students Review</h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-600">
                            Teacher va Business Admin lesson discussion, homework submission va quiz natijalarini shu sahifada ko‘radi.
                        </p>
                    </div>
                    {activeLessonId && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Active lesson: <span className="font-semibold text-slate-900">{activeLessonId}</span>
                        </div>
                    )}
                </div>

                <ComponentCard
                    title="Lesson Selection"
                    desc="Lesson ID kiriting va shu lesson bo‘yicha teacher-side review panelni oching."
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl">
                            <p className="text-sm text-slate-600">
                                `lessonId` kiriting. Shu ID bo‘yicha discussion, homework va quiz natijalari yuklanadi.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                                <Input
                                    value={lessonIdInput}
                                    onChange={(event) => setLessonIdInput(event.target.value)}
                                    placeholder="Masalan: 6f8b2f4a-lesson-id"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" className="bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90">
                                Open Review
                            </Button>
                        </form>
                    </div>
                </ComponentCard>

                {!activeLessonId ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-500">
                            <BookOpenText className="h-8 w-8"/>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">Lesson tanlanmagan</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Yuqoridagi formdan `lessonId` kiriting. Shundan keyin page ichida
                            `Discussion`, `Homework`, `Quiz Results` bo‘limlari chiqadi.
                        </p>
                    </div>
                ) : (
                    <LessonTeacherReviewPanel lessonId={activeLessonId}/>
                )}
            </div>
        </>
    );
}
