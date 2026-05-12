import {useEffect, useMemo, useState} from "react";
import {
    AlertCircle,
    GraduationCap,
    LoaderCircle,
    Pencil,
    Plus,
    RefreshCcw,
    Search,
    ShieldCheck,
    Trash2,
    Users as UsersIcon,
    UsersRound,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button.tsx";
import {
    useAddBusinessAssistant,
    useAddBusinessTeacher,
    useDeleteAssistant,
    useGetBusinessMembers,
    useUpdateMemberAssignedCourses,
} from "../../api/businessUser/useBusinessUser.ts";
import {useUser, isAssistantRole} from "../../api/auth/useAuth.ts";
import type {BusinessMember, Course} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../../components/ui/dialog.tsx";
import MultiSelect from "../../components/form/MultiSelect.tsx";
import {useGetBusinessCourses, useGetMyCourses} from "../../api/courses/useCourse.ts";

const normalizePhone = (value: string) => value.trim().replace(/^\+/, "");

const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed ? trimmed[0].toUpperCase() : "U";
};

const getRoleLabel = (role: string) =>
    isAssistantRole(role) ? "Assistent" : "O‘qituvchi";

const getRoleTone = (role: string) =>
    isAssistantRole(role)
        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200";

type AddMemberRole = "TEACHER" | "ASSISTANT";

type AddMemberFormState = {
    phone: string;
    role: AddMemberRole;
    courseIds: string[];
};

export default function Users() {
    const [search, setSearch] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<BusinessMember | null>(null);
    const [addForm, setAddForm] = useState<AddMemberFormState>({
        phone: "",
        role: "TEACHER",
        courseIds: [],
    });
    const [assignmentCourseIds, setAssignmentCourseIds] = useState<string[]>([]);

    const {data: user, isLoading: isUserLoading} = useUser();
    const businessId = user?.businessId;
    const ownerId = user?.id;

    const membersQuery = useGetBusinessMembers(businessId);
    const myCoursesQuery = useGetMyCourses(Boolean(businessId));
    const businessCoursesQuery = useGetBusinessCourses(Boolean(businessId));
    const {mutateAsync: addTeacher, isPending: isAddingTeacher} = useAddBusinessTeacher();
    const {mutateAsync: addAssistant, isPending: isAddingAssistant} = useAddBusinessAssistant();
    const {mutateAsync: removeAssistant, isPending: isRemovingAssistant} = useDeleteAssistant();
    const updateAssignmentsMutation = useUpdateMemberAssignedCourses(businessId);
    const isAddingMember = isAddingTeacher || isAddingAssistant;

    const availableCourses = useMemo(() => {
        const uniqueCourses = new Map<string, Course>();
        [...(myCoursesQuery.data || []), ...(businessCoursesQuery.data || [])].forEach((course) => {
            uniqueCourses.set(course.id, course);
        });
        return Array.from(uniqueCourses.values());
    }, [businessCoursesQuery.data, myCoursesQuery.data]);

    const courseOptions = useMemo(
        () => availableCourses.map((course) => ({value: course.id, text: course.name})),
        [availableCourses],
    );

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();
        const members = membersQuery.data?.members || [];
        if (!query) {
            return members;
        }

        return members.filter((member) => {
            const nameMatched = member.fullName.toLowerCase().includes(query);
            const phoneMatched = member.phone.toLowerCase().includes(query);
            const roleMatched = getRoleLabel(member.role).toLowerCase().includes(query);
            const assignedMatched = member.assignedCourses.some((course) => course.courseName.toLowerCase().includes(query));
            const courseMatched = member.courseNames.some((courseName) => courseName.toLowerCase().includes(query));
            return nameMatched || phoneMatched || roleMatched || assignedMatched || courseMatched;
        });
    }, [membersQuery.data?.members, search]);

    const teachersCount = useMemo(
        () => filteredMembers.filter((member) => !isAssistantRole(member.role)).length,
        [filteredMembers],
    );
    const assistantsCount = useMemo(
        () => filteredMembers.filter((member) => isAssistantRole(member.role)).length,
        [filteredMembers],
    );

    const summaryCards = [
        {
            label: "Jamoa a’zolari",
            value: filteredMembers.length,
            icon: UsersIcon,
            tone: "from-sky-500/18 via-cyan-400/10 to-white dark:from-sky-500/18 dark:via-cyan-500/10 dark:to-slate-950",
            iconTone: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
        },
        {
            label: "O‘qituvchilar",
            value: teachersCount,
            icon: GraduationCap,
            tone: "from-emerald-500/18 via-teal-400/10 to-white dark:from-emerald-500/18 dark:via-teal-500/10 dark:to-slate-950",
            iconTone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        },
        {
            label: "Assistentlar",
            value: assistantsCount,
            icon: ShieldCheck,
            tone: "from-violet-500/18 via-fuchsia-400/10 to-white dark:from-violet-500/18 dark:via-fuchsia-500/10 dark:to-slate-950",
            iconTone: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
        },
    ];

    useEffect(() => {
        if (selectedMember && isAssignmentDialogOpen) {
            setAssignmentCourseIds(selectedMember.assignedCourses.map((course) => course.courseId));
        }
    }, [isAssignmentDialogOpen, selectedMember]);

    const handleOpenAddDialog = () => {
        setAddForm({
            phone: "",
            role: "TEACHER",
            courseIds: [],
        });
        setIsAddDialogOpen(true);
    };

    const handleAddMember = async () => {
        if (!businessId || !ownerId || isAddingMember) return;

        const normalizedPhone = normalizePhone(addForm.phone);
        if (!/^998\d{9}$/.test(normalizedPhone)) {
            window.alert("Telefon raqamini +998770440105 yoki 998770440105 formatda kiriting.");
            return;
        }

        if (addForm.role === "TEACHER") {
            await addTeacher({
                businessId,
                ownerId,
                teacherPhone: normalizedPhone,
                courseIds: addForm.courseIds,
            });
        } else {
            await addAssistant({
                businessId,
                ownerId,
                assistantPhone: normalizedPhone,
                courseIds: addForm.courseIds,
            });
        }

        setIsAddDialogOpen(false);
    };

    const handleOpenAssignmentDialog = (member: BusinessMember) => {
        setSelectedMember(member);
        setAssignmentCourseIds(member.assignedCourses.map((course) => course.courseId));
        setIsAssignmentDialogOpen(true);
    };

    const handleSaveAssignments = async () => {
        if (!selectedMember) return;
        await updateAssignmentsMutation.mutateAsync({
            userId: selectedMember.id,
            courseIds: assignmentCourseIds,
        });
        setIsAssignmentDialogOpen(false);
        setSelectedMember(null);
    };

    const handleRemoveAssistant = async (member: BusinessMember) => {
        if (!businessId || !ownerId) return;

        const confirmed = window.confirm(`${member.fullName} ni assistentlar ro‘yxatidan chiqarishni xohlaysizmi?`);
        if (!confirmed) return;

        await removeAssistant({
            businessId,
            ownerId,
            assistantPhone: member.phone,
        });
    };

    const parsedError = membersQuery.error ? parseApiError(membersQuery.error) : null;
    const isForbidden = parsedError?.status === 403;

    return (
        <div className="mx-auto max-w-[1560px] space-y-5 pb-10">
            <PageMeta
                title="Jamoa"
                description="Teacher va assistantlarni boshqarish sahifasi"
            />

            <section className="grid gap-3 md:grid-cols-3">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className={`overflow-hidden rounded-[22px] border border-white/70 bg-gradient-to-br ${card.tone} p-4 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-800 sm:rounded-[24px] sm:p-5`}
                        >
                            <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] shadow-sm ${card.iconTone} sm:h-12 sm:w-12 sm:rounded-[16px]`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="mt-4 sm:mt-5">
                                <p className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-2xl xl:text-3xl">{card.value}</p>
                                <p className="mt-1.5 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100 sm:text-base xl:text-lg">{card.label}</p>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/82 dark:shadow-[0_18px_45px_rgba(2,6,23,0.38)]">
                <div className="p-4 sm:p-5">
                    <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Team workspace</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Joriy ro‘yxat</h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-slate-900 px-4 text-lg font-semibold text-white dark:bg-white dark:text-slate-950">
                                    {filteredMembers.length}
                                </div>
                                <Button
                                    type="button"
                                    variant="primary"
                                    className="rounded-[16px] px-4 py-2.5 text-sm font-medium"
                                    startIcon={<Plus className="h-4 w-4"/>}
                                    isPending={isAddingMember}
                                    disabled={!businessId || !ownerId || isAddingMember}
                                    onClick={handleOpenAddDialog}
                                >
                                    Qo‘shish
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 relative">
                            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Ism, telefon, rol yoki kurs bo‘yicha qidirish"
                                className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50/80 pl-14 pr-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:focus:bg-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {isUserLoading ? (
                    <div className="px-5 pb-6">
                        <div className="flex items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-5 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                            Foydalanuvchi ma’lumotlari yuklanmoqda...
                        </div>
                    </div>
                ) : !businessId ? (
                    <div className="px-5 pb-6">
                        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                            Business context topilmadi.
                        </div>
                    </div>
                ) : membersQuery.isPending ? (
                    <div className="grid gap-4 px-4 pb-5 sm:px-5 lg:grid-cols-2 xl:grid-cols-3">
                        {Array.from({length: 6}).map((_, index) => (
                            <div
                                key={index}
                                className="h-40 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/70"
                            />
                        ))}
                    </div>
                ) : membersQuery.isError ? (
                    <div className="px-5 pb-6">
                        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-6 py-12 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm dark:bg-slate-950 dark:text-rose-300">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-100">
                                {isForbidden ? "Bu sahifaga kirish ruxsati yo‘q" : "Jamoa ro‘yxati yuklanmadi"}
                            </h3>
                            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                                {parsedError?.message || "Jamoa ro‘yxatini olib bo‘lmadi."}
                            </p>
                            {!isForbidden ? (
                                <button
                                    type="button"
                                    onClick={() => void membersQuery.refetch()}
                                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Qayta urinish
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="px-5 pb-6">
                        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-sm dark:bg-slate-900 dark:shadow-none">
                                <UsersRound className="h-7 w-7 text-slate-400 dark:text-slate-500"/>
                            </div>
                            <p className="mt-5 text-xl font-semibold text-slate-900 dark:text-slate-100">
                                {search.trim() ? "Mos a’zo topilmadi" : "Jamoa hali bo‘sh"}
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                {search.trim() ? "Qidiruvga mos teacher yoki assistant topilmadi." : "Qo‘shish tugmasi orqali teacher yoki assistant ulang."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 pb-5 sm:px-5">
                        <div className="space-y-4 lg:hidden">
                            {filteredMembers.map((member) => {
                                const assistant = isAssistantRole(member.role);
                                const visibleCourses = member.assignedCourses.length ? member.assignedCourses.map((course) => course.courseName) : member.courseNames;

                                return (
                                    <article
                                        key={member.id}
                                        className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80"
                                    >
                                        <div className="flex items-center gap-4">
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.fullName} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white shadow-[0_12px_26px_rgba(70,207,67,0.28)]">
                                                    {getInitial(member.fullName)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">{member.fullName}</h3>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{member.phone || "Telefon mavjud emas"}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {visibleCourses.length > 0 ? visibleCourses.map((courseName) => (
                                                <span
                                                    key={`${member.id}-${courseName}`}
                                                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                >
                                                    {courseName}
                                                </span>
                                            )) : (
                                                <span className="text-sm text-slate-400 dark:text-slate-500">Mas'ul kurs biriktirilmagan</span>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getRoleTone(member.role)}`}>
                                                {getRoleLabel(member.role)}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-[16px]"
                                                    startIcon={<Pencil className="h-4 w-4"/>}
                                                    onClick={() => handleOpenAssignmentDialog(member)}
                                                >
                                                    Mas'ul kurslar
                                                </Button>

                                                {assistant ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-[16px] text-red-600"
                                                        startIcon={<Trash2 className="h-4 w-4"/>}
                                                        onClick={() => handleRemoveAssistant(member)}
                                                        disabled={isRemovingAssistant}
                                                    >
                                                        Olib tashlash
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="hidden overflow-x-auto rounded-[24px] border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/55 lg:block">
                            <div className="min-w-[1280px]">
                                <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1.4fr] gap-4 border-b border-slate-200 px-6 py-5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                                    <div>A’zo</div>
                                    <div>Mas'ul kurslar</div>
                                    <div>Telefon</div>
                                    <div>Rol</div>
                                    <div>Amal</div>
                                </div>

                                <div className="space-y-3 px-4 py-4">
                                    {filteredMembers.map((member) => {
                                        const assistant = isAssistantRole(member.role);
                                        const visibleCourses = member.assignedCourses.length ? member.assignedCourses.map((course) => course.courseName) : member.courseNames;

                                        return (
                                            <div
                                                key={member.id}
                                                className="grid grid-cols-[2fr_2fr_1.2fr_1fr_1.4fr] gap-4 rounded-[22px] border border-slate-200 bg-white/80 px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {member.avatarUrl ? (
                                                        <img src={member.avatarUrl} alt={member.fullName} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#46cf43] text-2xl font-semibold text-white shadow-[0_12px_26px_rgba(70,207,67,0.28)]">
                                                            {getInitial(member.fullName)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="truncate text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">{member.fullName}</div>
                                                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{assistant ? "Support va operations" : "Kurs va review oqimi"}</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap content-start gap-2">
                                                    {visibleCourses.length > 0 ? visibleCourses.map((courseName) => (
                                                        <span
                                                            key={`${member.id}-${courseName}`}
                                                            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                        >
                                                            {courseName}
                                                        </span>
                                                    )) : (
                                                        <span className="self-center text-sm text-slate-400 dark:text-slate-500">Mas'ul kurs biriktirilmagan</span>
                                                    )}
                                                </div>

                                                <div className="self-center text-base font-semibold text-slate-950 dark:text-slate-100">
                                                    {member.phone || "Telefon mavjud emas"}
                                                </div>

                                                <div className="self-center">
                                                    <span className={`inline-flex rounded-full px-3 py-2 text-sm font-semibold ${getRoleTone(member.role)}`}>
                                                        {getRoleLabel(member.role)}
                                                    </span>
                                                </div>

                                                <div className="self-center">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-[16px]"
                                                            startIcon={<Pencil className="h-4 w-4"/>}
                                                            onClick={() => handleOpenAssignmentDialog(member)}
                                                        >
                                                            Mas'ul kurslar
                                                        </Button>
                                                        {assistant ? (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-[16px] text-red-600"
                                                                startIcon={<Trash2 className="h-4 w-4"/>}
                                                                onClick={() => handleRemoveAssistant(member)}
                                                                disabled={isRemovingAssistant}
                                                            >
                                                                Olib tashlash
                                                            </Button>
                                                        ) : (
                                                            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                                                                Himoyalangan rol
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Teacher yoki assistant qo‘shish</DialogTitle>
                        <DialogDescription>Telefon raqamini kiriting va kerak bo‘lsa kurslarni biriktiring.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
                                <input
                                    type="text"
                                    value={addForm.phone}
                                    onChange={(event) => setAddForm((prev) => ({...prev, phone: event.target.value}))}
                                    placeholder="+998901234567"
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
                                <select
                                    value={addForm.role}
                                    onChange={(event) => setAddForm((prev) => ({...prev, role: event.target.value as AddMemberRole}))}
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value="TEACHER">TEACHER</option>
                                    <option value="ASSISTANT">ASSISTANT</option>
                                </select>
                            </div>
                        </div>

                        <MultiSelect
                            label="Mas'ul kurslar"
                            options={courseOptions}
                            value={addForm.courseIds}
                            onChange={(selected) => setAddForm((prev) => ({...prev, courseIds: selected}))}
                            placeholder="Kurslarni tanlang"
                            disabled={myCoursesQuery.isLoading || businessCoursesQuery.isLoading}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Bekor qilish
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleAddMember}
                            isPending={isAddingMember}
                            disabled={!businessId || !ownerId || isAddingMember}
                        >
                            Qo‘shish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Mas'ul kurslarni tahrirlash</DialogTitle>
                        <DialogDescription>{selectedMember?.fullName || "Member"} uchun biriktirilgan kurslarni yangilang.</DialogDescription>
                    </DialogHeader>

                    <MultiSelect
                        label="Mas'ul kurslar"
                        options={courseOptions}
                        value={assignmentCourseIds}
                        onChange={setAssignmentCourseIds}
                        placeholder="Kurslarni tanlang"
                        disabled={updateAssignmentsMutation.isPending || myCoursesQuery.isLoading || businessCoursesQuery.isLoading}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                            Bekor qilish
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleSaveAssignments}
                            isPending={updateAssignmentsMutation.isPending}
                            disabled={!selectedMember || updateAssignmentsMutation.isPending}
                        >
                            Saqlash
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
