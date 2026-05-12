import {useEffect, useState} from "react";
import {Send} from "lucide-react";
import type {CourseHomeworkSubmissionDetail} from "../../../types/types.ts";
import {Button} from "../../ui/button.tsx";
import {Textarea} from "../../ui/textarea.tsx";

export default function HomeworkReviewForm({
    detail,
    isSubmitting,
    onSubmit,
}: {
    detail: CourseHomeworkSubmissionDetail;
    isSubmitting: boolean;
    onSubmit: (values: {score: number; feedback: string; revisionRequested: boolean}) => Promise<void>;
}) {
    const [score, setScore] = useState(String(detail.score ?? ""));
    const [feedback, setFeedback] = useState(detail.feedback || "");
    const [revisionRequested, setRevisionRequested] = useState(detail.revisionRequested);

    useEffect(() => {
        setScore(detail.score == null ? "" : String(detail.score));
        setFeedback(detail.feedback || "");
        setRevisionRequested(detail.revisionRequested);
    }, [detail]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const numericScore = Number(score);
        await onSubmit({
            score: Number.isNaN(numericScore) ? 0 : numericScore,
            feedback: feedback.trim(),
            revisionRequested,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Review composer</p>
                <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Uyga vazifani tekshirish</h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Ball bering, feedback yozing va kerak bo‘lsa qayta topshirishga qaytaring.
                </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)]">
                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Score</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={score}
                        onChange={(event) => setScore(event.target.value)}
                        className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-lg font-semibold text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500/40 dark:focus:bg-slate-950"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">0 dan 100 gacha</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Feedback</label>
                    <Textarea
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        placeholder="Feedback yozing..."
                        className="mt-2 min-h-[180px] rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <input
                        type="checkbox"
                        checked={revisionRequested}
                        onChange={(event) => setRevisionRequested(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Qayta topshirishga qaytarish
                </label>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Belgilansa student vazifani to‘g‘rilab qayta yuboradi.
                </p>
            </div>

            <div className="flex justify-end">
                <Button type="submit" className="rounded-2xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700" disabled={isSubmitting}>
                    <Send className="h-4 w-4"/>
                    Review yuborish
                </Button>
            </div>
        </form>
    );
}
