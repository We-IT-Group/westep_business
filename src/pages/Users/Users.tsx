import {useMemo} from "react";
import {
    GraduationCap,
    List,
    LoaderCircle,
    Plus,
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
    useGetUsers,
} from "../../api/businessUser/useBusinessUser.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import type {BusinessMember} from "../../api/businessUser/businessUserApi.ts";

const normalizePhone = (value: string) => value.trim().replace(/^\+/, "");

export default function Users() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const businessId = user?.businessId;
    const ownerId = user?.id;

    const {data: members = [], isPending, isError, error} = useGetUsers(businessId);
    const {mutateAsync: addTeacher, isPending: isAddingTeacher} = useAddBusinessTeacher();
    const {mutateAsync: addAssistant, isPending: isAddingAssistant} = useAddBusinessAssistant();
    const {mutateAsync: removeAssistant, isPending: isRemovingAssistant} = useDeleteAssistant();
    const isAddingMember = isAddingTeacher || isAddingAssistant;

    const teachersCount = useMemo(
        () => members.filter((member) => member.role === "TEACHER").length,
        [members],
    );
    const assistantsCount = useMemo(
        () => members.filter((member) => member.role === "ASSISTANT").length,
        [members],
    );

    const workspaceCards = [
        {
            label: "Jamoa a’zolari",
            value: members.length,
            helper: "Umumiy active tarkib",
            icon: UsersIcon,
            tone: "from-sky-500/18 via-cyan-400/12 to-white dark:from-sky-500/18 dark:via-cyan-500/10 dark:to-slate-950",
            iconTone: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
            accent: "bg-sky-500",
        },
        {
            label: "O‘qituvchilar",
            value: teachersCount,
            helper: "Kurs va review oqimi",
            icon: GraduationCap,
            tone: "from-emerald-500/18 via-teal-400/12 to-white dark:from-emerald-500/18 dark:via-teal-500/10 dark:to-slate-950",
            iconTone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
            accent: "bg-emerald-500",
        },
        {
            label: "Assistentlar",
            value: assistantsCount,
            helper: "Support va operations",
            icon: ShieldCheck,
            tone: "from-violet-500/18 via-fuchsia-400/12 to-white dark:from-violet-500/18 dark:via-fuchsia-500/10 dark:to-slate-950",
            iconTone: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
            accent: "bg-violet-500",
        },
    ];

    const handleAddMember = async () => {
        if (!businessId || !ownerId || isAddingMember) return;

        const phoneInput = window.prompt("Telefon raqamini kiriting", "+998901234567");
        if (!phoneInput) return;

        const normalizedPhone = normalizePhone(phoneInput);
        if (!/^998\d{9}$/.test(normalizedPhone)) {
            window.alert("Telefon raqamini +998770440105 yoki 998770440105 formatda kiriting.");
            return;
        }

        const roleInput = window.prompt("Rolni kiriting: TEACHER yoki ASSISTANT", "TEACHER");
        if (!roleInput) return;

        const normalizedRole = roleInput.trim().toUpperCase();
        if (normalizedRole !== "TEACHER" && normalizedRole !== "ASSISTANT") {
            window.alert("Rol faqat TEACHER yoki ASSISTANT bo‘lishi kerak.");
            return;
        }

        if (normalizedRole === "TEACHER") {
            await addTeacher({
                businessId,
                ownerId,
                teacherPhone: normalizedPhone,
            });
            return;
        }

        await addAssistant({
            businessId,
            ownerId,
            assistantPhone: normalizedPhone,
        });
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

    return (
        <div className="mx-auto max-w-[1320px] space-y-4 pb-10">
            <PageMeta
                title="Jamoa"
                description="Teacher va assistantlarni boshqarish sahifasi"
            />

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.22),_transparent_30%),linear-gradient(135deg,_#ffffff,_#f8fafc)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.96))] dark:shadow-[0_20px_60px_rgba(2,6,23,0.42)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">Team workspace</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Jamoa</h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Teacher va assistentlarni bir joydan boshqaring.
                        </p>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                        {(user?.firstname || "").trim() || "Workspace"}
                    </div>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
                {workspaceCards.map((card) => (
                    <div key={card.label} className={`group relative overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br ${card.tone} p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:hover:shadow-[0_20px_40px_rgba(2,6,23,0.4)]`}>
                        <span className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-105 ${card.iconTone}`}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{card.value}</div>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{card.label}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.helper}</p>
                    </div>
                ))}
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_14px_34px_rgba(2,6,23,0.34)]">
                <div className="rounded-[22px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                    `Qo‘shish` tugmasi orqali mavjud userni jamoaga ulang. Telefonni `+998770440105` yoki `998770440105` formatda yozishingiz mumkin.
                </div>

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Joriy ro‘yxat</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Teacher va assistentlar list ko‘rinishida.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            {members.length} ta a’zo
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            className="rounded-[16px] px-4 py-2.5 text-sm font-medium"
                            startIcon={<Plus className="h-4 w-4"/>}
                            isPending={isAddingMember}
                            disabled={!businessId || !ownerId || isAddingMember}
                            onClick={handleAddMember}
                        >
                            Qo‘shish
                        </Button>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <List className="h-4 w-4" />
                            Ro‘yxat ko‘rinishi
                        </div>
                    </div>

                    <div className="mt-3">
                        {isUserLoading ? (
                            <div className="flex items-center justify-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50/80 px-5 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Foydalanuvchi ma’lumotlari yuklanmoqda...
                            </div>
                        ) : !businessId ? (
                            <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                                Business context topilmadi.
                            </div>
                        ) : isPending ? (
                            <div className="flex items-center justify-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50/80 px-5 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Jamoa ro‘yxati yuklanmoqda...
                            </div>
                        ) : isError ? (
                            <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                                {error instanceof Error ? error.message : "Jamoa ro‘yxatini olib bo‘lmadi."}
                            </div>
                        ) : members.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-sm dark:bg-slate-900 dark:shadow-none">
                                    <UsersRound className="h-7 w-7 text-slate-400 dark:text-slate-500"/>
                                </div>
                                <p className="mt-5 text-xl font-semibold text-slate-900 dark:text-slate-100">Jamoa hali bo‘sh</p>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    Chap tomondan teacher yoki assistent qo‘shing.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-[22px] border border-slate-200 dark:border-slate-800">
                                {members.map((member) => {
                                    const isAssistant = member.role === "ASSISTANT";

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/75 p-4 transition duration-200 hover:bg-white md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                        isAssistant
                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                    }`}>
                                                        {isAssistant ? <UsersIcon className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">{member.fullName}</p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{member.phone || "Telefon mavjud emas"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 md:min-w-[300px]">
                                                <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                                                    isAssistant
                                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                                                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                                                }`}>
                                                    {isAssistant ? "Assistent" : "O‘qituvchi"}
                                                </span>

                                                <p className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                                                    {isAssistant ? "Support va yordam oqimi" : "Kurs va review oqimi"}
                                                </p>

                                                <div className="flex justify-end">
                                                    {isAssistant ? (
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
                                                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                                            Himoyalangan rol
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
