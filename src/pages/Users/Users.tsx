import {useMemo, useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Trash2, UserPlus, UsersRound} from "lucide-react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label.tsx";
import Input from "../../components/form/input/InputField.tsx";
import Select from "../../components/form/Select.tsx";
import Button from "../../components/ui/button/Button.tsx";
import {useAddBusinessAssistant, useAddBusinessTeacher, useDeleteAssistant, useGetUsers} from "../../api/businessUser/useBusinessUser.ts";
import {useUser} from "../../api/auth/useAuth.ts";
import type {BusinessMember, TeamRole} from "../../api/businessUser/businessUserApi.ts";

type AddTeamMemberForm = {
    phone: string;
    role: TeamRole;
};

const roleOptions = [
    {value: "TEACHER", label: "Teacher"},
    {value: "ASSISTANT", label: "Assistant"},
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

    return (
        <>
            <PageMeta
                title="Team Management"
                description="Teacher va assistantlarni boshqaring"
            />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white px-7 py-6 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Business Admin</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Team Management</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Mavjud userlarni teacher yoki assistant roliga biriktiring va business jamoangizni shu yerdan boshqaring.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Query param flow: <span className="font-semibold text-slate-900">phone + ownerId + businessId</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <ComponentCard
                        title="Jamoa overview"
                        desc="Business hisobingizga biriktirilgan a'zolar holati."
                        className="xl:col-span-2"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                <p className="text-sm text-slate-500">Jami a'zolar</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{members.length}</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                                <p className="text-sm text-emerald-700">Teacherlar</p>
                                <p className="mt-2 text-3xl font-semibold text-emerald-900">{teachersCount}</p>
                            </div>
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
                                <p className="text-sm text-blue-700">Assistantlar</p>
                                <p className="mt-2 text-3xl font-semibold text-blue-900">{assistantsCount}</p>
                            </div>
                        </div>
                    </ComponentCard>

                    <ComponentCard
                        title="Business context"
                        desc="Add/remove actionlar login qilingan owner kontekstida ishlaydi."
                    >
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="rounded-2xl border border-slate-200 px-4 py-3">
                                <p className="text-slate-400">Business ID</p>
                                <p className="mt-1 break-all font-medium text-slate-900">{businessId || "Topilmadi"}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 px-4 py-3">
                                <p className="text-slate-400">Owner ID</p>
                                <p className="mt-1 break-all font-medium text-slate-900">{ownerId || "Topilmadi"}</p>
                            </div>
                        </div>
                    </ComponentCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <ComponentCard
                        title="Add member"
                        desc="Mavjud userni teacher yoki assistant roliga biriktiring."
                    >
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formik.handleSubmit();
                            }}
                            className="space-y-5"
                        >
                            <div>
                                <Label htmlFor="phone">Phone number</Label>
                                <Input<AddTeamMemberForm>
                                    type="text"
                                    formik={formik}
                                    name="phone"
                                    placeholder="998901234567"
                                />
                            </div>

                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    options={roleOptions}
                                    placeholder="Rolni tanlang"
                                    defaultValue={selectedRole}
                                    onChange={handleRoleChange}
                                />
                            </div>

                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                Bu flow yangi user yaratmaydi. Telefon raqami oldindan tizimda mavjud bo'lishi kerak.
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full rounded-2xl"
                                startIcon={<UserPlus className="h-4 w-4"/>}
                                isPending={isAddingTeacher || isAddingAssistant}
                                disabled={!businessId || !ownerId || isAddingTeacher || isAddingAssistant}
                            >
                                Add member
                            </Button>
                        </form>
                    </ComponentCard>

                    <ComponentCard
                        title="Team members"
                        desc="Teacher va assistantlar ro'yxati. Assistant uchun remove action mavjud."
                    >
                        {isUserLoading ? (
                            <div className="py-10 text-center text-sm text-slate-500">Foydalanuvchi ma'lumotlari yuklanmoqda...</div>
                        ) : !businessId ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                Business context topilmadi. Team management uchun login userda `businessId` bo'lishi kerak.
                            </div>
                        ) : isPending ? (
                            <div className="py-10 text-center text-sm text-slate-500">Jamoa ro'yxati yuklanmoqda...</div>
                        ) : isError ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error instanceof Error ? error.message : "Jamoa ro'yxatini olib bo'lmadi."}
                            </div>
                        ) : members.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
                                <UsersRound className="h-10 w-10 text-slate-300"/>
                                <p className="mt-4 text-base font-medium text-slate-700">Hozircha jamoa a'zolari yo'q</p>
                                <p className="mt-1 max-w-md text-sm text-slate-500">
                                    Chap tomondagi forma orqali mavjud userni teacher yoki assistant sifatida biriktiring.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                            <th className="px-5 py-4">Full name</th>
                                            <th className="px-5 py-4">Phone</th>
                                            <th className="px-5 py-4">Role</th>
                                            <th className="px-5 py-4 text-right">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                        {members.map((member) => {
                                            const isAssistant = member.role === "ASSISTANT";

                                            return (
                                                <tr key={member.id} className="text-sm text-slate-700">
                                                    <td className="px-5 py-4 font-medium text-slate-900">{member.fullName}</td>
                                                    <td className="px-5 py-4">{member.phone || "—"}</td>
                                                    <td className="px-5 py-4">
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    isAssistant
                                                                        ? "bg-blue-50 text-blue-700"
                                                                        : "bg-emerald-50 text-emerald-700"
                                                                }`}
                                                            >
                                                                {member.role}
                                                            </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        {isAssistant ? (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-xl text-red-600 ring-red-200 hover:bg-red-50"
                                                                startIcon={<Trash2 className="h-4 w-4"/>}
                                                                onClick={() => handleRemoveAssistant(member)}
                                                                disabled={isRemovingAssistant}
                                                            >
                                                                Remove
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">Teacher remove yo'q</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </ComponentCard>
                </div>
            </div>
        </>
    );
}
