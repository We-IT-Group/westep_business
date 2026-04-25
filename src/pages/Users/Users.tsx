import {useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {
    BriefcaseBusiness,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users as UsersIcon,
    UsersRound,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import Select from "../../components/form/Select.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {
    useAddBusinessAssistant,
    useAddBusinessTeacher,
    useDeleteAssistant,
    useGetUsers,
} from "../../api/businessUser/useBusinessUser.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import type {BusinessMember, TeamRole} from "../../api/businessUser/businessUserApi.ts";

type AddTeamMemberForm = {
    phone: string;
    role: TeamRole;
};

const roleOptions = [
    {value: "TEACHER", label: "O‘qituvchi"},
    {value: "ASSISTANT", label: "Assistent"},
];

export default function Users() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const businessId = user?.businessId;
    const ownerId = user?.id;
    const [selectedRole, setSelectedRole] = useState<TeamRole>("TEACHER");

    const {data: members = [], isPending, isError, error} = useGetUsers(businessId);
    const {mutateAsync: addTeacher, isPending: isAddingTeacher} = useAddBusinessTeacher();
    const {mutateAsync: addAssistant, isPending: isAddingAssistant} = useAddBusinessAssistant();
    const {mutateAsync: removeAssistant, isPending: isRemovingAssistant} = useDeleteAssistant();

    const teachersCount = useMemo(
        () => members.filter((member) => member.role === "TEACHER").length,
        [members],
    );
    const assistantsCount = useMemo(
        () => members.filter((member) => member.role === "ASSISTANT").length,
        [members],
    );

    const formik = useFormik<AddTeamMemberForm>({
        initialValues: {
            phone: "",
            role: "TEACHER",
        },
        validationSchema: Yup.object({
            phone: Yup.string()
                .trim()
                .required("Telefon raqamini kiriting")
                .min(9, "Telefon raqami noto'g'ri"),
            role: Yup.mixed<TeamRole>()
                .oneOf(["TEACHER", "ASSISTANT"])
                .required(),
        }),
        onSubmit: async (values, helpers) => {
            if (!businessId || !ownerId) return;

            if (values.role === "TEACHER") {
                await addTeacher({
                    businessId,
                    ownerId,
                    teacherPhone: values.phone.trim(),
                });
            } else {
                await addAssistant({
                    businessId,
                    ownerId,
                    assistantPhone: values.phone.trim(),
                });
            }

            helpers.resetForm();
            setSelectedRole("TEACHER");
        },
    });

    const handleRoleChange = (value: string) => {
        const nextRole = value as TeamRole;
        setSelectedRole(nextRole);
        formik.setFieldValue("role", nextRole);
    };

    const handleRemoveAssistant = async (member: BusinessMember) => {
        if (!businessId || !ownerId) return;

        const confirmed = window.confirm(
            `${member.fullName} ni assistantlar ro'yxatidan chiqarishni xohlaysizmi?`,
        );

        if (!confirmed) return;

        await removeAssistant({
            businessId,
            ownerId,
            assistantPhone: member.phone,
        });
    };

    const workspaceCards = [
        {
            label: "Jamoa hajmi",
            value: members.length,
            hint: "Businessga biriktirilgan jami a'zolar",
            tone: "from-sky-500/20 to-blue-500/10 text-sky-700",
        },
        {
            label: "O‘qituvchilar",
            value: teachersCount,
            hint: "Course va review workflows",
            tone: "from-emerald-500/20 to-teal-500/10 text-emerald-700",
        },
        {
            label: "Assistentlar",
            value: assistantsCount,
            hint: "Support va operations layer",
            tone: "from-violet-500/20 to-indigo-500/10 text-violet-700",
        },
    ];

    return (
        <div className="mx-auto max-w-[1560px] space-y-5 pb-10">
            <PageMeta
                title="Jamoa oynasi"
                description="Biznes admin uchun jamoa boshqaruv sahifasi."
            />

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[30px] border border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.94))] dark:text-slate-100 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)] md:p-7">
                    <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
                    <div className="absolute bottom-[-48px] left-[-28px] h-48 w-48 rounded-full bg-sky-100/70 blur-3xl dark:bg-sky-500/10" />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                            <BriefcaseBusiness className="h-3.5 w-3.5" />
                            Jamoa oynasi
                        </div>

                        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-[0.98] tracking-[-0.05em] md:text-[3rem]">
                            Teacher va assistantlarni bitta operator console ichida boshqaring.
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
                            Mavjud userlarni business workflow’ga biriktiring, role balansini kuzating va workspace ownershipni aniq boshqaring.
                        </p>

                        <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
                            {workspaceCards.map((card) => (
                                <div key={card.label} className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                                    <div className={`inline-flex rounded-xl bg-gradient-to-br p-2.5 ${card.tone}`}>
                                        <UsersIcon className="h-4.5 w-4.5" />
                                    </div>
                                    <div className="mt-3 text-2xl font-black tracking-[-0.04em] dark:text-slate-100">{card.value}</div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{card.label}</div>
                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.hint}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[26px] border border-white/60 bg-white/86 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Workspace konteksti</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Biznes egaligi</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Add/remove actionlari login qilingan owner kontekstida ishlaydi.
                    </p>

                    <div className="mt-5 space-y-2.5">
                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Biznes ID</div>
                            <div className="mt-2 break-all text-sm font-bold text-slate-900 dark:text-slate-100">{businessId || "Topilmadi"}</div>
                        </div>

                        <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Ega ID</div>
                            <div className="mt-2 break-all text-sm font-bold text-slate-900 dark:text-slate-100">{ownerId || "Topilmadi"}</div>
                        </div>

                        <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                            Bu flow yangi user yaratmaydi. Tizimda oldindan mavjud bo'lgan telefon raqami role ichiga ulanadi.
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[26px] border border-white/60 bg-white/86 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">A'zo qo‘shish</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Rol biriktirish</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Teacher yoki assistant sifatida mavjud userni workspacega biriktiring.
                    </p>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            formik.handleSubmit();
                        }}
                        className="mt-6 space-y-4"
                    >
                        <div>
                            <Label htmlFor="phone">Telefon raqami</Label>
                            <Input<AddTeamMemberForm>
                                type="text"
                                formik={formik}
                                name="phone"
                                placeholder="998901234567"
                            />
                        </div>

                        <div>
                            <Label htmlFor="role">Rol</Label>
                            <Select
                                options={roleOptions}
                                placeholder="Rolni tanlang"
                                defaultValue={selectedRole}
                                onChange={handleRoleChange}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full rounded-[18px] py-3.5 text-sm font-medium"
                            startIcon={<UserPlus className="h-4 w-4"/>}
                            isPending={isAddingTeacher || isAddingAssistant}
                            disabled={!businessId || !ownerId || isAddingTeacher || isAddingAssistant}
                        >
                            Workspace'ga a'zo qo‘shish
                        </Button>
                    </form>
                </div>

                <div className="rounded-[26px] border border-white/60 bg-white/86 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_16px_40px_rgba(2,6,23,0.35)]">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Jamoa a'zolari</p>
                            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950 dark:text-slate-100">Joriy ro‘yxat</h2>
                        </div>
                        <div className="rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                            {members.length} ta faol a'zo
                        </div>
                    </div>

                    <div className="mt-6">
                        {isUserLoading ? (
                            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Foydalanuvchi ma'lumotlari yuklanmoqda...</div>
                        ) : !businessId ? (
                            <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                                Business context topilmadi. Team management uchun login userda `businessId` bo'lishi kerak.
                            </div>
                        ) : isPending ? (
                            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Jamoa ro'yxati yuklanmoqda...</div>
                        ) : isError ? (
                            <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                                {error instanceof Error ? error.message : "Jamoa ro'yxatini olib bo'lmadi."}
                            </div>
                        ) : members.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white shadow-sm dark:bg-slate-900 dark:shadow-none">
                                    <UsersRound className="h-8 w-8 text-slate-300 dark:text-slate-500"/>
                                </div>
                                <p className="mt-5 text-lg font-black text-slate-900 dark:text-slate-100">Hozircha jamoa a'zolari yo'q</p>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    Chap tomondagi role assignment formasi orqali teacher yoki assistantni workspacega qo'shing.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.map((member) => {
                                    const isAssistant = member.role === "ASSISTANT";

                                    return (
                                        <div
                                            key={member.id}
                                            className="flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/60"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${isAssistant ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"}`}>
                                                    {isAssistant ? <UsersIcon className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-base font-black tracking-[-0.03em] text-slate-950 dark:text-slate-100">
                                                        {member.fullName}
                                                    </div>
                                                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                        {member.phone || "Telefon mavjud emas"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${
                                                        isAssistant ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                                                    }`}
                                                >
                                                    {member.role}
                                                </span>

                                                {isAssistant ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-[18px] text-red-600"
                                                        startIcon={<Trash2 className="h-4 w-4"/>}
                                                        onClick={() => handleRemoveAssistant(member)}
                                                        disabled={isRemovingAssistant}
                                                    >
                                                        Olib tashlash
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                                        Himoyalangan rol
                                                    </span>
                                                )}
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
