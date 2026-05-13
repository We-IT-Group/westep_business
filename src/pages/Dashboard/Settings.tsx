import {LaptopMinimal, LoaderCircle, ShieldCheck, Smartphone, Trash2, Wifi} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {useUser} from "../../api/auth/useAuth.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {useDeleteMyDevice, useMyDevices} from "../../api/userDevices/useUserDevices.ts";
import {isCurrentDeviceSession} from "../../utils/device.ts";
import Button from "../../components/ui/button/Button.tsx";
import type {UserDeviceSession} from "../../types/types.ts";
import BusinessWalletTopUpSection from "../../components/payments/BusinessWalletTopUpSection.tsx";

const formatDateTime = (value?: string) => {
    if (!value) {
        return "Hozircha aniqlanmagan";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const getDeviceMeta = (device: UserDeviceSession) =>
    [device.platform, device.browser, device.ipAddress].filter(Boolean).join(" • ") || "Qurilma tafsiloti yo‘q";

const currentDeviceLabel = (device: UserDeviceSession) =>
    isCurrentDeviceSession(device.deviceId);

export default function Settings() {
    const {data: user, isLoading: isUserLoading} = useUser();
    const devicesQuery = useMyDevices();
    const deleteDeviceMutation = useDeleteMyDevice();

    const isLoading = isUserLoading || devicesQuery.isLoading;
    const parsedError = devicesQuery.error ? parseApiError(devicesQuery.error) : null;
    const isForbidden = parsedError?.status === 403;
    const devices = devicesQuery.data || [];
    const currentDevice = devices.find((device) => currentDeviceLabel(device)) || null;

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/60 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <LoaderCircle className="h-10 w-10 animate-spin text-sky-600"/>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Qurilmalar</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                            Sessiyalar yuklanmoqda
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    if (isForbidden) {
        return (
            <div className="rounded-[32px] border border-amber-200 bg-amber-50/90 p-6 text-amber-900 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                <p className="text-sm font-black uppercase tracking-[0.28em]">Ruxsat cheklangan</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight">Qurilmalar bo‘limi sizning rolga yopiq</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-amber-800/80 dark:text-amber-100/80">
                    {parsedError?.message || "Ushbu bo‘limni ko‘rish uchun qo‘shimcha ruxsat kerak."}
                </p>
            </div>
        );
    }

    if (devicesQuery.isError) {
        return (
            <div className="rounded-[32px] border border-rose-200 bg-rose-50/90 p-6 text-rose-900 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
                <p className="text-sm font-black uppercase tracking-[0.28em]">Xatolik</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight">Qurilmalarni olib bo‘lmadi</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-rose-800/80 dark:text-rose-100/80">
                    {parsedError?.message || "Sessiyalar ro‘yxati vaqtincha ochilmadi."}
                </p>
                <Button
                    className="mt-5 rounded-2xl px-5"
                    onClick={() => void devicesQuery.refetch()}
                >
                    Qayta urinish
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-8">
            <PageMeta title="Sozlamalar" description="Qurilmalar va sessiyalar boshqaruvi"/>

            <BusinessWalletTopUpSection defaultPhoneNumber={user?.phoneNumber}/>

            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.97),_rgba(248,250,252,0.92))] shadow-[0_32px_90px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))] dark:shadow-[0_32px_90px_rgba(2,6,23,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:150px_150px] opacity-40 dark:opacity-20"/>
                <div className="relative grid gap-6 px-6 py-6 md:px-8 xl:grid-cols-[minmax(0,1.15fr)_360px]">
                    <div className="rounded-[30px] border border-white/75 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                                Account xavfsizligi
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                {user?.roleName || "Workspace user"}
                            </span>
                        </div>

                        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100 md:text-[2.7rem]">
                            Login qilgan qurilmalar va sessiyalarni shu yerdan boshqaring
                        </h1>
                        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 dark:text-slate-300 md:text-base">
                            Business panel har user uchun maksimal 2 ta qurilma sessiyasini ushlab turadi.
                            Kerak bo‘lsa eski sessiyalarni o‘chirib, faqat kerakli qurilmalarni qoldirishingiz mumkin.
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                                    <LaptopMinimal className="h-5 w-5"/>
                                </div>
                                <p className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{devices.length}</p>
                                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Faol sessiyalar</p>
                            </div>

                            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    <ShieldCheck className="h-5 w-5"/>
                                </div>
                                <p className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{currentDevice ? 1 : 0}</p>
                                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Joriy qurilma</p>
                            </div>

                            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                <div className="inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                                    <Wifi className="h-5 w-5"/>
                                </div>
                                <p className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{Math.max(0, 2 - devices.length)}</p>
                                <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Bo‘sh login slot</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(255,255,255,0.98))] p-5 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] dark:text-slate-100 dark:shadow-[0_24px_60px_rgba(2,6,23,0.45)]">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-500/70 dark:text-slate-500">Joriy sessiya</p>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">
                            {currentDevice?.deviceName || "Qurilma topilmadi"}
                        </h2>
                        <p className="mt-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            {currentDevice ? getDeviceMeta(currentDevice) : "Joriy qurilmani aniqlash uchun kamida bitta aktiv sessiya kerak."}
                        </p>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Oxirgi faollik</p>
                                <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">
                                    {formatDateTime(currentDevice?.lastSeenAt)}
                                </p>
                            </div>
                            <div className="rounded-[22px] border border-blue-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Login limit</p>
                                <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">2 ta qurilma</p>
                                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Yangi qurilma kirganda eski sessiyani almashtirish mumkin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[32px] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.07)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Qurilmalar</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Faol device sessiyalari</h2>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            Bu ro‘yxatda account kirgan barcha aktiv browser va qurilmalar ko‘rinadi.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-2xl px-5"
                        onClick={() => void devicesQuery.refetch()}
                    >
                        Yangilash
                    </Button>
                </div>

                {devices.length === 0 ? (
                    <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500">
                            <Smartphone className="h-7 w-7"/>
                        </div>
                        <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">Qurilma topilmadi</h3>
                        <p className="mt-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            Hozircha bu account uchun saqlangan aktiv device sessiyalari yo‘q.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {devices.map((device) => {
                            const isCurrent = currentDeviceLabel(device);
                            const isDeleting = deleteDeviceMutation.isPending && deleteDeviceMutation.variables === device.sessionId;

                            return (
                                <div
                                    key={device.sessionId}
                                    className="rounded-[28px] border border-slate-200 bg-slate-50/75 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                                                <LaptopMinimal className="h-6 w-6"/>
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-100">
                                                        {device.deviceName}
                                                    </h3>
                                                    {isCurrent ? (
                                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                            Joriy qurilma
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                    {`${getDeviceMeta(device)} • Oxirgi faollik: ${formatDateTime(device.lastSeenAt)}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="lg:w-[220px]">
                                            <Button
                                                variant="danger"
                                                startIcon={<Trash2 className="h-4 w-4"/>}
                                                className="w-full rounded-2xl px-5"
                                                disabled={isCurrent || isDeleting}
                                                isPending={isDeleting}
                                                onClick={() => void deleteDeviceMutation.mutateAsync(device.sessionId)}
                                            >
                                                {isCurrent ? "Joriy sessiya" : "Qurilmani o‘chirish"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
