import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    ArrowUpRight,
    Edit2,
    ImageIcon,
    MoreVertical,
} from "lucide-react";
import {Course} from "../../types/types.ts";
import {usePatchCourseActive} from "../../api/courses/useCourse.ts";
import {baseUrlImage} from "../../api/apiClient.ts";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../ui/dropdown-menu.tsx";
import {Switch} from "../ui/switch.tsx";
import {showSuccessToast} from "../../utils/toast.tsx";

type CourseSource = "my" | "business" | "inactive";

function CourseCard({
    course,
    source = "my",
    canManageCourse = true,
}: {
    course: Course;
    source?: CourseSource;
    canManageCourse?: boolean;
}) {
    const navigate = useNavigate();
    const {mutateAsync: patchActive, isPending: isPatchPending} = usePatchCourseActive();
    const [imageFailed, setImageFailed] = useState(false);

    const normalizedAttachmentUrl = course.attachmentUrl
        ? (course.attachmentUrl.startsWith("http")
            ? course.attachmentUrl
            : `${baseUrlImage.replace(/\/api$/, "")}${course.attachmentUrl}`)
        : "";

    const handleToggleActive = async (checked: boolean) => {
        await patchActive({id: course.id, value: checked, source});
        showSuccessToast(checked ? "Kurs active qilindi" : "Kurs non-active qilindi");
    };

    const formattedPrice = typeof course.price === "number"
        ? `${course.price.toLocaleString("ru-RU")} so‘m`
        : null;

    return (
        <>
            <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/40">
                <div className="flex gap-3">
                    <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                        {normalizedAttachmentUrl && !imageFailed ? (
                            <img
                                src={normalizedAttachmentUrl}
                                alt={course.name}
                                className="h-full w-full object-cover"
                                onError={() => setImageFailed(true)}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <ImageIcon className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="line-clamp-1 text-base font-semibold text-slate-950 dark:text-slate-100">
                                    {course.name}
                                </h3>
                                {formattedPrice ? (
                                    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {formattedPrice}
                                    </p>
                                ) : null}
                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                    {course.description || "Tavsif kiritilmagan."}
                                </p>
                            </div>

                            {canManageCourse ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-200 p-1.5 dark:border-slate-800">
                                        <DropdownMenuItem
                                            onClick={() => navigate(`/courses/edit/${course.id}`)}
                                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            <Edit2 className="mr-2 h-4 w-4 text-blue-600" />
                                            Kursni tahrirlash
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : null}
                        </div>

                    </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Studentlarga ko‘rinishi</p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {canManageCourse ? "Switch yoqilsa kurs ko‘rinadi." : (course.active ? "Kurs hozir studentlarga ko‘rinadi." : "Kurs hozir studentlarga yopiq.")}
                            </p>
                        </div>
                        {canManageCourse ? (
                            <Switch
                                checked={course.active}
                                onCheckedChange={handleToggleActive}
                                disabled={isPatchPending}
                            />
                        ) : (
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                course.active
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                    : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}>
                                {course.active ? "Active" : "Nofaol"}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-3">
                    <Link
                        to={`/courses/details/${course.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Darslarga kirish
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </article>
        </>
    );
}

export default CourseCard;
