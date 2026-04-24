import {useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {
    Archive,
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    Edit2,
    ImageIcon,
    MoreVertical,
    Power,
    Sparkles,
} from "lucide-react";
import {Course} from "../../types/types.ts";
import {usePatchCourseActive} from "../../api/courses/useCourse.ts";
import UpdateCourse from "./UpdateCourse.tsx";
import {baseUrlImage} from "../../api/apiClient.ts";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../ui/dropdown-menu.tsx";
import {Switch} from "../ui/switch.tsx";
import {showSuccessToast} from "../../utils/toast.tsx";

type CourseSource = "my" | "business" | "archived";

function CourseCard({course, source = "my"}: { course: Course; source?: CourseSource }) {
    const {mutateAsync: patchActive, isPending: isPatchPending} = usePatchCourseActive();
    const [openEdit, setOpenEdit] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const isArchivedView = source === "archived";
    const normalizedAttachmentUrl = course.attachmentUrl
        ? (course.attachmentUrl.startsWith("http")
            ? course.attachmentUrl
            : `${baseUrlImage.replace(/\/api$/, "")}${course.attachmentUrl}`)
        : "";

    const statusChip = useMemo(() => {
        if (isArchivedView) {
            return {
                label: "Arxivda",
                className: "border-slate-300 bg-slate-900 text-white",
                icon: Archive,
            };
        }

        if (course.isPublished && course.active) {
            return {
                label: "Nashrda",
                className: "border-emerald-200 bg-emerald-50 text-emerald-700",
                icon: CheckCircle2,
            };
        }

        if (!course.isPublished) {
            return {
                label: "Qoralama",
                className: "border-amber-200 bg-amber-50 text-amber-700",
                icon: Clock3,
            };
        }

        return {
            label: "Nofaol",
            className: "border-slate-200 bg-slate-100 text-slate-600",
            icon: Power,
        };
    }, [course.active, course.isPublished, isArchivedView]);

    const handleToggleActive = async (checked: boolean) => {
        await patchActive({id: course.id, value: checked, source});

        if (isArchivedView) {
            showSuccessToast("Kurs archived ro'yxatdan chiqarildi");
            return;
        }

        showSuccessToast(checked ? "Kurs faollashtirildi" : "Kurs archive holatiga o'tkazildi");
    };

    const StatusIcon = statusChip.icon;

    return (
        <>
            <article className="group overflow-hidden rounded-[24px] border border-white/60 bg-white/92 shadow-[0_16px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]">
                <div className="relative aspect-[16/8.8] overflow-hidden bg-[linear-gradient(135deg,#1e3a8a,#2563eb_55%,#93c5fd_140%)]">
                {normalizedAttachmentUrl && !imageFailed ? (
                    <img
                        src={normalizedAttachmentUrl}
                        alt={course.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center text-white/85">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/12 backdrop-blur-sm">
                                <ImageIcon className="h-6 w-6" />
                            </div>
                            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/90">
                                Kurs rasmi
                            </p>
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />

                <div className="absolute left-4 top-4 flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] shadow-sm ${statusChip.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusChip.label}
                    </div>
                </div>

                <div className="absolute right-4 top-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/92 text-slate-700 shadow-lg transition hover:bg-white">
                                <MoreVertical className="h-4.5 w-4.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-[24px] border-slate-200 p-2">
                            <DropdownMenuItem
                                onClick={() => setOpenEdit(true)}
                                className="rounded-2xl px-4 py-3 font-bold text-slate-700"
                            >
                                <Edit2 className="mr-2 h-4 w-4 text-sky-600" />
                                Kursni tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleToggleActive(isArchivedView)}
                                disabled={isPatchPending}
                                className="rounded-2xl px-4 py-3 font-bold text-slate-700"
                            >
                                {isArchivedView ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 text-emerald-600" />
                                        Biznesga qaytarish
                                    </>
                                ) : (
                                    <>
                                        <Archive className="mr-2 h-4 w-4 text-amber-600" />
                                        Arxivga yuborish
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="line-clamp-2 text-lg font-semibold leading-6 tracking-[-0.03em] text-slate-950 transition group-hover:text-sky-700">
                            {course.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-slate-500">
                            {course.description || "Kurs uchun professional tavsif hali kiritilmagan. Builder ichida positioning va curriculum story ustida ishlash mumkin."}
                        </p>
                    </div>

                    <div className="hidden rounded-[16px] bg-slate-100/80 p-2.5 text-slate-500 md:block">
                        <BookOpen className="h-4 w-4" />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-[16px] border border-slate-200 bg-slate-50/80 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Ko‘rinish</div>
                        <div className="mt-1.5 text-xs font-semibold leading-4 text-slate-950">
                            {course.isPublished ? "Ochiq katalog" : "Yopiq qoralama"}
                        </div>
                    </div>

                    <div className="rounded-[16px] border border-slate-200 bg-slate-50/80 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Rejim</div>
                        <div className="mt-1.5 text-xs font-semibold leading-4 text-slate-950">
                            {isArchivedView ? "Arxiv elementi" : course.active ? "Faol oqim" : "To‘xtatilgan oqim"}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-50/80 px-3.5 py-2.5">
                    <div className="min-w-0 pr-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {isArchivedView ? "Qaytarish" : "Faollik holati"}
                        </div>
                        <div className="mt-1 text-xs font-medium leading-4 text-slate-900">
                            {isArchivedView ? "Biznes katalogiga qaytarish uchun yoqing" : course.active ? "Hozir workspace ichida faol" : "Biznes katalogidan arxivga o‘tkazilgan"}
                        </div>
                    </div>

                    <Switch
                        checked={isArchivedView ? false : course.active}
                        onCheckedChange={handleToggleActive}
                        disabled={isPatchPending}
                    />
                </div>

                <div className="mt-4 flex gap-2">
                    <Link
                        to={`/courses/details/${course.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        Builderni ochish
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>

                    <button
                        type="button"
                        onClick={() => setOpenEdit(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                        <Edit2 className="h-4 w-4" />
                        Tez tahrirlash
                    </button>
                </div>
            </div>
            </article>

            <UpdateCourse data={course} open={openEdit} onClose={() => setOpenEdit(false)} />
        </>
    );
}

export default CourseCard;
