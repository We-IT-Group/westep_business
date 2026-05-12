import {LaptopMinimal, LoaderCircle, Smartphone, Trash2} from "lucide-react";
import type {DeviceLimitExceededDetails, UserDeviceSession} from "../../types/types.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog.tsx";
import Button from "../ui/button/Button.tsx";

interface DeviceLimitDialogProps {
    details: DeviceLimitExceededDetails | null;
    isOpen: boolean;
    isPending: boolean;
    onClose: () => void;
    onReplaceSession: (sessionId: string) => Promise<void>;
}

const formatLastSeenAt = (value?: string) => {
    if (!value) {
        return "Faollik vaqti noma’lum";
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

const getDeviceMetaLine = (device: UserDeviceSession) =>
    [device.platform, device.browser, device.ipAddress].filter(Boolean).join(" • ") || "Qurilma ma’lumoti yo‘q";

export default function DeviceLimitDialog({
    details,
    isOpen,
    isPending,
    onClose,
    onReplaceSession,
}: DeviceLimitDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <DialogContent className="max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-0 shadow-[0_32px_100px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200/80 bg-gradient-to-br from-amber-50 via-white to-white px-6 py-6 dark:border-slate-800 dark:from-amber-500/10 dark:via-slate-950 dark:to-slate-950">
                    <DialogHeader className="text-left">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-600 shadow-sm dark:border-amber-500/20 dark:bg-slate-900 dark:text-amber-300">
                            <LaptopMinimal className="h-6 w-6"/>
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">
                            Qurilmalar limiti to‘ldi
                        </DialogTitle>
                        <DialogDescription className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                            Bu account bir vaqtning o‘zida maksimal {details?.maxDevices || 2} ta qurilmada ishlaydi.
                            Davom etish uchun pastdagi sessiyalardan bittasini almashtiring.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-3 px-6 py-6">
                    {details?.activeDevices.map((device) => (
                        <div
                            key={device.sessionId}
                            className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                                    <Smartphone className="h-5 w-5"/>
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-900 dark:text-slate-100">
                                        {device.deviceName}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {getDeviceMetaLine(device)}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                        Oxirgi faollik: {formatLastSeenAt(device.lastSeenAt)}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="danger"
                                onClick={() => void onReplaceSession(device.sessionId)}
                                disabled={isPending}
                                isPending={isPending}
                                startIcon={!isPending ? <Trash2 className="h-4 w-4"/> : <LoaderCircle className="h-4 w-4 animate-spin"/>}
                                className="w-full rounded-2xl px-4 md:w-auto"
                            >
                                O‘chirish va kirish
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
