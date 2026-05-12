import {useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Copy, LoaderCircle, Phone, Search, UserPlus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useCourseStudents} from "../../api/courseStudents/useCourseStudents.ts";
import {useToast} from "../../hooks/useToast.tsx";
import {useCreateBusinessStudent} from "../../api/courseStudents/useBusinessStudents.ts";
import {BusinessStudentCreateResponse} from "../../api/courseStudents/businessStudentsApi.ts";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "../ui/dialog.tsx";
import {Button} from "../ui/button.tsx";

const formatDateTime = (value?: string) => {
    if (!value) {
        return {
            date: "Faollik yo‘q",
            time: "Hali qayd etilmagan",
        };
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return {
            date: value,
            time: "Soat noma’lum",
        };
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
        date: `${day}.${month}.${year}`,
        time: `${hours}:${minutes}`,
    };
};

const getStudentInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed ? trimmed[0].toUpperCase() : "S";
};

const getProgressTone = (value: number) => {
    if (value >= 80) return "bg-emerald-400";
    if (value >= 50) return "bg-amber-400";
    return "bg-orange-500";
};

type StudentCreateForm = {
    phone: string;
    firstName: string;
    lastName: string;
};

export default function CourseStudentsSection({
    courseId,
}: {
    courseId: string;
}) {
    const navigate = useNavigate();
    const toast = useToast();
    const {mutateAsync: createStudent, isPending: isCreatingStudent} = useCreateBusinessStudent();
    const {data: students = [], isLoading: isStudentsLoading, isError, error} = useCourseStudents(courseId);
    const [search, setSearch] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createdStudent, setCreatedStudent] = useState<BusinessStudentCreateResponse | null>(null);
    const [isCredentialsCopied, setIsCredentialsCopied] = useState(false);

    const createStudentFormik = useFormik<StudentCreateForm>({
        initialValues: {
            phone: "",
            firstName: "",
            lastName: "",
        },
        validationSchema: Yup.object({
            phone: Yup.string()
                .trim()
                .required("Telefon raqamini kiriting")
                .matches(/^998\d{9}$/, "Telefon formati 998901234567 ko‘rinishida bo‘lsin"),
            firstName: Yup.string().trim().required("Ismni kiriting"),
            lastName: Yup.string().trim().required("Familiyani kiriting"),
        }),
        onSubmit: async (values, helpers) => {
            try {
                const result = await createStudent({
                    phone: values.phone.trim(),
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim(),
                });
                setCreatedStudent(result);
                setIsCredentialsCopied(false);
                helpers.resetForm();
                helpers.setStatus(undefined);
            } catch (submitError) {
                helpers.setStatus(submitError instanceof Error ? submitError.message : "Student qo‘shib bo‘lmadi.");
            }
        },
    });

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return students;

        return students.filter((student) => {
            const name = student.studentName.toLowerCase();
            const phone = (student.phone || "").toLowerCase();
            return name.includes(query) || phone.includes(query);
        });
    }, [search, students]);

    const handleCloseCreateDialog = () => {
        setIsCreateDialogOpen(false);
        setCreatedStudent(null);
        setIsCredentialsCopied(false);
        createStudentFormik.resetForm();
        createStudentFormik.setStatus(undefined);
    };

    const handleCopyCredentials = async () => {
        if (!createdStudent) return;

        const credentials = `Student muvaffaqiyatli qo‘shildi. Login: ${createdStudent.phone}, vaqtinchalik parol: ${createdStudent.temporaryPassword}`;
        try {
            await navigator.clipboard.writeText(credentials);
            setIsCredentialsCopied(true);
            toast.success("Ma’lumot nusxalandi");
        } catch {
            toast.error("Nusxalab bo‘lmadi");
        }
    };

    const handleMetricNavigate = (studentId: string, view: "homework" | "quizzes" | "discussions") => {
        navigate(`/courses/details/${courseId}?view=${view}&studentId=${studentId}`);
    };

    return (
        <div className="min-h-[760px] rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <div className="border-b border-slate-200 px-7 py-6 dark:border-slate-800">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h3 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">O‘quvchilar</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Kursga biriktirilgan studentlar, progress va faoliyat.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="inline-flex h-12 items-center gap-3 rounded-[18px] bg-[#48bf45] px-5 text-base font-semibold text-white transition hover:bg-[#3dab3a]"
                        >
                            <UserPlus className="h-6 w-6" />
                            O‘quvchilarni qo‘shish
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-3 pb-3 pt-5">
                <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Qidirish"
                                className="h-14 w-full rounded-[20px] border border-slate-200 bg-white pl-16 pr-5 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-200 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[1160px] px-4 pb-6">
                            <div className="grid grid-cols-[2.1fr_1fr_0.9fr_0.8fr_0.8fr_0.8fr_1.2fr] gap-4 border-b border-slate-200 px-2 py-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-3">
                                    <span>O‘quvchi</span>
                                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                                        {filteredStudents.length}
                                    </span>
                                </div>
                                <div>Darslar</div>
                                <div>Progress</div>
                                <div>Vazifa</div>
                                <div>Test</div>
                                <div>Xabar</div>
                                <div>Faollik</div>
                            </div>

                            {isStudentsLoading ? (
                                <div className="flex items-center justify-center px-4 py-20 text-slate-500 dark:text-slate-400">
                                    <LoaderCircle className="mr-3 h-6 w-6 animate-spin" />
                                    O‘quvchilar yuklanmoqda...
                                </div>
                            ) : isError ? (
                                <div className="px-4 py-16 text-center text-rose-500 dark:text-rose-300">
                                    {error instanceof Error ? error.message : "O‘quvchilar yuklanmadi."}
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="px-4 py-20 text-center text-slate-500 dark:text-slate-400">
                                    O‘quvchilar topilmadi.
                                </div>
                            ) : (
                                filteredStudents.map((student) => {
                                    const lastActivity = formatDateTime(student.lastActivityAt);

                                    return (
                                        <div
                                            key={student.studentCourseId}
                                            className="grid w-full grid-cols-[2.1fr_1fr_0.9fr_0.8fr_0.8fr_0.8fr_1.2fr] gap-4 rounded-2xl px-2 py-6 text-left transition hover:bg-white/70 dark:hover:bg-white/[0.03]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white">
                                                    {getStudentInitial(student.studentName)}
                                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#48bf45] ring-2 ring-white dark:ring-slate-950" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{student.studentName}</div>
                                                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                        <Phone className="h-4 w-4" />
                                                        {student.phone || "Telefon yo‘q"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="self-center">
                                                <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                                    {student.completedLessons}/{student.totalLessons}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tugallangan darslar</div>
                                            </div>

                                            <div className="self-center">
                                                <div className="flex items-center gap-3">
                                                    <span className={`h-7 w-7 rounded-full ${getProgressTone(student.progressPercentage)}`} />
                                                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{student.progressPercentage} %</span>
                                                </div>
                                            </div>

                                            <div className="self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMetricNavigate(student.studentId, "homework")}
                                                    className="text-base font-semibold text-slate-900 transition hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                                                >
                                                    {student.homeworkSubmissionsCount}
                                                </button>
                                            </div>
                                            <div className="self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMetricNavigate(student.studentId, "quizzes")}
                                                    className="text-base font-semibold text-slate-900 transition hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                                                >
                                                    {student.quizAttemptsCount}
                                                </button>
                                            </div>
                                            <div className="self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMetricNavigate(student.studentId, "discussions")}
                                                    className="text-base font-semibold text-slate-900 transition hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                                                >
                                                    {student.messageCount}
                                                </button>
                                            </div>
                                            <div className="self-center">
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{lastActivity.date}</div>
                                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{lastActivity.time}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => (!open ? handleCloseCreateDialog() : setIsCreateDialogOpen(true))}>
                <DialogContent className="max-w-xl rounded-[28px] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-950">
                    <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                        <DialogHeader className="text-left">
                            <DialogTitle className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
                                O‘quvchi qo‘shish
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                Telefon, ism va familiyani kiriting. Student uchun vaqtinchalik parol backend tomonidan yaratiladi.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {createdStudent ? (
                        <div className="space-y-5 px-6 py-6">
                            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                <p className="text-base font-semibold text-emerald-800 dark:text-emerald-200">
                                    Student muvaffaqiyatli qo‘shildi.
                                </p>
                                <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
                                    Login: <span className="font-semibold">{createdStudent.phone}</span>
                                </p>
                                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                                    Vaqtinchalik parol: <span className="font-semibold">{createdStudent.temporaryPassword}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCopyCredentials}
                                    className="h-11 rounded-xl px-4"
                                >
                                    <Copy className="h-4 w-4" />
                                    {isCredentialsCopied ? "Nusxalandi" : "Nusxalash"}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCloseCreateDialog}
                                    className="h-11 rounded-xl bg-slate-900 px-4 text-white hover:bg-black dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                                >
                                    Yopish
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={createStudentFormik.handleSubmit} className="space-y-5 px-6 py-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
                                <input
                                    name="phone"
                                    value={createStudentFormik.values.phone}
                                    onChange={createStudentFormik.handleChange}
                                    onBlur={createStudentFormik.handleBlur}
                                    placeholder="998901234567"
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                {createStudentFormik.touched.phone && createStudentFormik.errors.phone ? (
                                    <p className="mt-2 text-xs font-medium text-rose-500">{createStudentFormik.errors.phone}</p>
                                ) : null}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Ism</label>
                                    <input
                                        name="firstName"
                                        value={createStudentFormik.values.firstName}
                                        onChange={createStudentFormik.handleChange}
                                        onBlur={createStudentFormik.handleBlur}
                                        placeholder="Ali"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                    {createStudentFormik.touched.firstName && createStudentFormik.errors.firstName ? (
                                        <p className="mt-2 text-xs font-medium text-rose-500">{createStudentFormik.errors.firstName}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Familiya</label>
                                    <input
                                        name="lastName"
                                        value={createStudentFormik.values.lastName}
                                        onChange={createStudentFormik.handleChange}
                                        onBlur={createStudentFormik.handleBlur}
                                        placeholder="Valiyev"
                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                    {createStudentFormik.touched.lastName && createStudentFormik.errors.lastName ? (
                                        <p className="mt-2 text-xs font-medium text-rose-500">{createStudentFormik.errors.lastName}</p>
                                    ) : null}
                                </div>
                            </div>

                            {createStudentFormik.status ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                                    {createStudentFormik.status}
                                </div>
                            ) : null}

                            <div className="flex flex-wrap justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseCreateDialog}
                                    className="h-11 rounded-xl px-4"
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreatingStudent}
                                    className="h-11 rounded-xl bg-[#48bf45] px-4 text-white hover:bg-[#3dab3a]"
                                >
                                    {isCreatingStudent ? "Saqlanmoqda..." : "O‘quvchini qo‘shish"}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
