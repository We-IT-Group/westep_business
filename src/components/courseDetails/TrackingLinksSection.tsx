import {type FormEvent, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Copy,
    ExternalLink,
    Link2,
    LoaderCircle,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import {Button} from "../ui/button.tsx";
import {Input} from "../ui/input.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog.tsx";
import {useUser} from "../../api/auth/useAuth.ts";
import {
    useCourseTrackingAnalytics,
    useCreateTrackingLink,
    useDeleteTrackingLink,
    useTrackingLink,
    useTrackingLinks,
    useTrackingLinksAnalytics,
    useUpdateTrackingLink,
} from "../../api/trackingLinks/useTrackingLinks.ts";
import {TrackingLink, TrackingLinkAnalytics, TrackingLinkPayload, TrackingOwnerType} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {showSuccessToast} from "../../utils/toast.tsx";

const emptyAnalytics: TrackingLinkAnalytics = {
    clicks: 0,
    uniqueClicks: 0,
    leads: 0,
    checkoutStarted: 0,
    paidPurchases: 0,
    failedOrAbandoned: 0,
    refunded: 0,
    revenue: 0,
    conversionRate: 0,
    lastActivityAt: null,
};

const getOwnerType = (roleName?: string): TrackingOwnerType => {
    const normalized = roleName?.toUpperCase() || "";
    return normalized.includes("TEACHER") ? "TEACHER" : "BUSINESS_OWNER";
};

const formatDate = (value?: string | null) => {
    if (!value) return "No activity yet";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const formatMoney = (value?: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(value || 0);

const formatPercent = (value?: number) => `${(value || 0).toFixed(2)}%`;

const normalizeTrackingUrl = (link?: TrackingLink | null) => {
    if (!link) return "";

    if (link.trackingUrl) {
        if (link.trackingUrl.startsWith("http")) {
            return link.trackingUrl;
        }

        if (link.trackingUrl.startsWith("/")) {
            return `${window.location.origin}${link.trackingUrl}`;
        }
    }

    return `${window.location.origin}/r/${link.code}`;
};

const toInitialFormState = (courseId: string, ownerType: TrackingOwnerType, ownerId: string) => ({
    name: "telegram-main",
    ownerType,
    ownerId,
    destinationUrl: `/courses/${courseId}`,
    utmSource: "telegram",
    utmMedium: "group",
    utmCampaign: "aprel",
    isActive: true,
});

function TrackingLinksSection({courseId}: { courseId: string }) {
    const navigate = useNavigate();
    const {data: user} = useUser();
    const ownerType = getOwnerType(user?.roleName);
    const ownerId = user?.id || "";

    const initialForm = useMemo(
        () => toInitialFormState(courseId, ownerType, ownerId),
        [courseId, ownerId, ownerType],
    );

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formError, setFormError] = useState("");
    const [formState, setFormState] = useState(initialForm);

    const linksQuery = useTrackingLinks(courseId);
    const courseAnalyticsQuery = useCourseTrackingAnalytics(courseId);
    const activeLink = linksQuery.data?.content?.[0] || null;
    const linkDetailQuery = useTrackingLink(editingId || activeLink?.id, !!(editingId || activeLink?.id) && isDialogOpen);
    const linkAnalyticsQueries = useTrackingLinksAnalytics(activeLink ? [activeLink] : []);
    const linkAnalytics = linkAnalyticsQueries[0]?.data || emptyAnalytics;

    const createMutation = useCreateTrackingLink(courseId);
    const updateMutation = useUpdateTrackingLink(courseId);
    const deleteMutation = useDeleteTrackingLink(courseId);
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        setFormState((previous) => ({
            ...previous,
            ownerType,
            ownerId,
            destinationUrl: previous.destinationUrl || `/courses/${courseId}`,
        }));
    }, [courseId, ownerId, ownerType]);

    useEffect(() => {
        const error = linksQuery.error || courseAnalyticsQuery.error;
        if (error && parseApiError(error).status === 401) {
            navigate("/login");
        }
    }, [courseAnalyticsQuery.error, linksQuery.error, navigate]);

    useEffect(() => {
        if (!isDialogOpen || !linkDetailQuery.data) return;

        const link = linkDetailQuery.data;
        setFormState({
            name: link.name || "telegram-main",
            ownerType: link.ownerType || ownerType,
            ownerId: link.ownerId || ownerId,
            destinationUrl: link.destinationUrl || `/courses/${courseId}`,
            utmSource: link.utmSource || "telegram",
            utmMedium: link.utmMedium || "group",
            utmCampaign: link.utmCampaign || "aprel",
            isActive: link.isActive,
        });
    }, [courseId, isDialogOpen, linkDetailQuery.data, ownerId, ownerType]);

    const openCreateDialog = () => {
        setEditingId(null);
        setFormError("");
        setFormState(toInitialFormState(courseId, ownerType, ownerId));
        setIsDialogOpen(true);
    };

    const openEditDialog = () => {
        if (!activeLink) return;
        setEditingId(activeLink.id);
        setFormError("");
        setFormState({
            name: activeLink.name || "telegram-main",
            ownerType: activeLink.ownerType || ownerType,
            ownerId: activeLink.ownerId || ownerId,
            destinationUrl: activeLink.destinationUrl || `/courses/${courseId}`,
            utmSource: activeLink.utmSource || "telegram",
            utmMedium: activeLink.utmMedium || "group",
            utmCampaign: activeLink.utmCampaign || "aprel",
            isActive: activeLink.isActive,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormError("");
        setFormState(toInitialFormState(courseId, ownerType, ownerId));
    };

    const handleCopy = async () => {
        if (!activeLink) return;

        const trackingUrl = normalizeTrackingUrl(activeLink);
        await navigator.clipboard.writeText(trackingUrl);
        showSuccessToast("Promo link nusxalandi.");
    };

    const handleDelete = async () => {
        if (!activeLink) return;

        const confirmed = window.confirm("Kurs promo linkini o'chirasizmi?");
        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(activeLink.id);
        } catch (error) {
            if (parseApiError(error).status === 401) {
                navigate("/login");
            }
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");

        if (!formState.ownerId.trim()) {
            setFormError("Current user topilmadi. Qayta login qilib ko'ring.");
            return;
        }

        const payload: TrackingLinkPayload = {
            name: formState.name.trim() || "telegram-main",
            ownerType: formState.ownerType,
            ownerId: formState.ownerId.trim(),
            destinationUrl: formState.destinationUrl.trim() || `/courses/${courseId}`,
            utmSource: formState.utmSource.trim() || "telegram",
            utmMedium: formState.utmMedium.trim() || "group",
            utmCampaign: formState.utmCampaign.trim() || "aprel",
        };

        try {
            if (activeLink?.id) {
                await updateMutation.mutateAsync({
                    id: activeLink.id,
                    body: {
                        ...payload,
                        isActive: formState.isActive,
                    },
                });
            } else {
                await createMutation.mutateAsync(payload);
            }

            closeDialog();
        } catch (error) {
            const parsed = parseApiError(error);

            if (parsed.status === 401) {
                navigate("/login");
                return;
            }

            if (parsed.status === 400) {
                setFormError(parsed.message);
                return;
            }

            setFormError(parsed.message);
        }
    };

    const summaryCards = [
        {label: "Clicks", value: courseAnalyticsQuery.data?.clicks || 0},
        {label: "Checkout Started", value: courseAnalyticsQuery.data?.checkoutStarted || 0},
        {label: "Paid Purchases", value: courseAnalyticsQuery.data?.paidPurchases || 0},
        {label: "Revenue", value: formatMoney(courseAnalyticsQuery.data?.revenue)},
    ];

    return (
        <div className="flex-1 overflow-auto bg-slate-50">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                <BarChart3 className="h-3.5 w-3.5"/>
                                Single Promo Link
                            </div>
                            <h2 className="mt-3 text-2xl font-bold text-slate-900">Telegram uchun bitta ulashiladigan link</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                Endi owner uchun faqat bitta sodda share qilinadigan link ishlatiladi: <span className="font-semibold text-slate-900">/r/{"{code}"}</span>.
                                O'quvchi shu linkni bosganda frontend hech narsa hisoblamaydi, browser darhol backend resolverga o'tadi va click attribution hamda cookie backendda yoziladi.
                            </p>
                        </div>

                        <Button
                            className="rounded-xl bg-slate-950 px-4 py-2 text-white hover:bg-slate-800"
                            onClick={activeLink ? openEditDialog : openCreateDialog}
                        >
                            {activeLink ? <Pencil className="h-4 w-4"/> : <Plus className="h-4 w-4"/>}
                            {activeLink ? "Edit promo link" : "Create promo link"}
                        </Button>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
                        </div>
                    ))}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    {linksQuery.isLoading ? (
                        <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                            <LoaderCircle className="h-5 w-5 animate-spin"/>
                            Promo link yuklanmoqda...
                        </div>
                    ) : linksQuery.isError ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                            {parseApiError(linksQuery.error).message}
                        </div>
                    ) : !activeLink ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                <Link2 className="h-6 w-6"/>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">Promo link hali yaratilmagan</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Teacher yoki business admin uchun bitta `telegram-main` link yarating va telegramga ulashing.
                            </p>
                            <Button className="mt-5 rounded-xl" onClick={openCreateDialog}>
                                <Plus className="h-4 w-4"/>
                                Create promo link
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                            <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_100%)] p-6 text-white">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">Tracking URL</p>
                                <h3 className="mt-3 text-xl font-semibold">{activeLink.name}</h3>
                                <p className="mt-4 break-all rounded-2xl bg-white/10 px-4 py-4 text-sm text-slate-100">
                                    {normalizeTrackingUrl(activeLink)}
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Button type="button" variant="secondary" className="rounded-xl bg-white text-slate-900 hover:bg-slate-100" onClick={handleCopy}>
                                        <Copy className="h-4 w-4"/>
                                        Copy link
                                    </Button>
                                    <a href={normalizeTrackingUrl(activeLink)} target="_blank" rel="noreferrer">
                                        <Button type="button" variant="outline" className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10">
                                            <ExternalLink className="h-4 w-4"/>
                                            Open
                                        </Button>
                                    </a>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl border-rose-300/40 bg-transparent text-white hover:bg-white/10"
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4"/>
                                        Delete
                                    </Button>
                                </div>

                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs text-sky-100">Owner</p>
                                        <p className="mt-2 text-sm font-medium">{activeLink.ownerType}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/10 p-4">
                                        <p className="text-xs text-sky-100">Destination</p>
                                        <p className="mt-2 text-sm font-medium">{activeLink.destinationUrl}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-sm font-semibold text-slate-900">Link analytics</p>
                                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Clicks</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">{linkAnalytics.clicks}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Unique clicks</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">{linkAnalytics.uniqueClicks}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Leads</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">{linkAnalytics.leads}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Checkout started</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">{linkAnalytics.checkoutStarted}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Paid purchases</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">{linkAnalytics.paidPurchases}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Revenue</p>
                                            <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(linkAnalytics.revenue)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <p className="text-sm font-semibold text-slate-900">Attribution health</p>
                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                        <p>Conversion: <span className="font-semibold text-slate-900">{formatPercent(linkAnalytics.conversionRate)}</span></p>
                                        <p>Failed/Abandoned: <span className="font-semibold text-slate-900">{linkAnalytics.failedOrAbandoned}</span></p>
                                        <p>Refunded: <span className="font-semibold text-slate-900">{linkAnalytics.refunded}</span></p>
                                        <p>Last activity: <span className="font-semibold text-slate-900">{formatDate(linkAnalytics.lastActivityAt)}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => (!open ? closeDialog() : setIsDialogOpen(true))}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{activeLink ? "Update promo link" : "Create promo link"}</DialogTitle>
                        <DialogDescription>
                            UI’da faqat backend resolver link ishlatiladi. `?ref=...` linklar userga ko'rsatilmaydi.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">Link name</span>
                                <Input value={formState.name} onChange={(event) => setFormState((prev) => ({...prev, name: event.target.value}))}/>
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">Destination URL</span>
                                <Input value={formState.destinationUrl} onChange={(event) => setFormState((prev) => ({...prev, destinationUrl: event.target.value}))}/>
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">Owner type</span>
                                <select
                                    value={formState.ownerType}
                                    onChange={(event) => setFormState((prev) => ({...prev, ownerType: event.target.value as TrackingOwnerType}))}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                                >
                                    <option value="TEACHER">TEACHER</option>
                                    <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
                                </select>
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">Owner ID</span>
                                <Input value={formState.ownerId} onChange={(event) => setFormState((prev) => ({...prev, ownerId: event.target.value}))}/>
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">UTM source</span>
                                <Input value={formState.utmSource} onChange={(event) => setFormState((prev) => ({...prev, utmSource: event.target.value}))}/>
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">UTM medium</span>
                                <Input value={formState.utmMedium} onChange={(event) => setFormState((prev) => ({...prev, utmMedium: event.target.value}))}/>
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">UTM campaign</span>
                                <Input value={formState.utmCampaign} onChange={(event) => setFormState((prev) => ({...prev, utmCampaign: event.target.value}))}/>
                            </label>
                        </div>

                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <input
                                type="checkbox"
                                checked={formState.isActive}
                                onChange={(event) => setFormState((prev) => ({...prev, isActive: event.target.checked}))}
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-800">Link active</p>
                                <p className="text-xs text-slate-500">Inactive bo'lsa attribution ishlamaydi.</p>
                            </div>
                        </label>

                        {linkDetailQuery.isLoading && editingId && (
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                <LoaderCircle className="h-4 w-4 animate-spin"/>
                                Promo link detail yuklanmoqda...
                            </div>
                        )}

                        {formError && (
                            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/>
                                <span>{formError}</span>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}
                                {activeLink ? "Save promo link" : "Create promo link"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TrackingLinksSection;
