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
import {apiBaseOrigin} from "../../api/apiClient.ts";
import type {
    TrackingLink,
    TrackingLinkAnalytics,
    TrackingLinkCreateRequest,
    TrackingLinkUpdateRequest,
    TrackingOwnerType,
} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";
import {showSuccessToast} from "../../utils/toast.tsx";

const emptyAnalytics: TrackingLinkAnalytics = {
    clicks: 0,
    uniqueClicks: 0,
    leads: 0,
    checkoutStarted: 0,
    paidPurchases: 0,
    freeEnrolls: 0,
    paidAmount: 0,
    appliedFeeAmount: 0,
    failedOrAbandoned: 0,
    refunded: 0,
    refundedAmount: 0,
    revenue: 0,
    conversionRate: 0,
    lastActivityAt: null,
};

type TrackingFormState = {
    name: string;
    ownerType: TrackingOwnerType;
    ownerId: string;
    destinationUrl: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    expiresAt: string;
    isActive: boolean;
};

const getOwnerType = (roleName?: string): TrackingOwnerType => {
    const normalized = roleName?.toUpperCase() || "";
    return normalized.includes("TEACHER") ? "TEACHER" : "BUSINESS_OWNER";
};

const formatDate = (value?: string | null) => {
    if (!value) return "Belgilanmagan";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {dateStyle: "medium", timeStyle: "short"}).format(date);
};

const formatMoney = (value?: number) =>
    `${new Intl.NumberFormat("uz-UZ").format(Math.round(value || 0))} so‘m`;

const normalizeFrontendUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http")) return value;
    if (value.startsWith("/")) return `${window.location.origin}${value}`;
    return `${window.location.origin}/${value}`;
};

const normalizeBackendUrl = (value?: string | null) => {
    if (!value) return "";
    if (value.startsWith("http")) return value;
    if (value.startsWith("/")) return `${apiBaseOrigin}${value}`;
    return `${apiBaseOrigin}/${value}`;
};

const getShareLink = (link: TrackingLink) =>
    normalizeBackendUrl(link.trackingUrl) || `${apiBaseOrigin}/r/${link.code}`;

const getCourseLink = (link: TrackingLink) =>
    normalizeFrontendUrl(link.courseUrlWithRef) || normalizeFrontendUrl(link.destinationUrl);

const toInitialFormState = (courseId: string, ownerType: TrackingOwnerType, ownerId: string): TrackingFormState => ({
    name: "",
    ownerType,
    ownerId,
    destinationUrl: `/courses/${courseId}`,
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    expiresAt: "",
    isActive: true,
});

const buildCreatePayload = (state: TrackingFormState): TrackingLinkCreateRequest => ({
    name: state.name.trim(),
    ownerType: state.ownerType,
    ownerId: state.ownerId.trim(),
    destinationUrl: state.destinationUrl.trim(),
    utmSource: state.utmSource.trim() || undefined,
    utmMedium: state.utmMedium.trim() || undefined,
    utmCampaign: state.utmCampaign.trim() || undefined,
    expiresAt: state.expiresAt || null,
});

const buildUpdatePayload = (state: TrackingFormState): TrackingLinkUpdateRequest => ({
    ...buildCreatePayload(state),
    isActive: state.isActive,
});

function TrackingLinksSection({courseId}: { courseId: string }) {
    const navigate = useNavigate();
    const {data: user} = useUser();
    const ownerType = getOwnerType(user?.roleName);
    const ownerId = user?.id || "";

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [analyticsLink, setAnalyticsLink] = useState<TrackingLink | null>(null);
    const [formError, setFormError] = useState("");
    const [formState, setFormState] = useState<TrackingFormState>(toInitialFormState(courseId, ownerType, ownerId));

    const linksQuery = useTrackingLinks(courseId);
    const courseAnalyticsQuery = useCourseTrackingAnalytics(courseId);
    const linkDetailQuery = useTrackingLink(editingId || undefined, isDialogOpen && !!editingId);
    const linkAnalyticsQueries = useTrackingLinksAnalytics(linksQuery.data?.content || []);

    const createMutation = useCreateTrackingLink(courseId);
    const updateMutation = useUpdateTrackingLink(courseId);
    const deleteMutation = useDeleteTrackingLink(courseId);
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
            name: link.name || "",
            ownerType: link.ownerType || ownerType,
            ownerId: link.ownerId || ownerId,
            destinationUrl: link.destinationUrl || `/courses/${courseId}`,
            utmSource: link.utmSource || "",
            utmMedium: link.utmMedium || "",
            utmCampaign: link.utmCampaign || "",
            expiresAt: link.expiresAt || "",
            isActive: link.isActive,
        });
    }, [courseId, isDialogOpen, linkDetailQuery.data, ownerId, ownerType]);

    const analyticsMap = useMemo(() => {
        const map = new Map<string, TrackingLinkAnalytics>();
        (linksQuery.data?.content || []).forEach((link, index) => {
            map.set(link.id, linkAnalyticsQueries[index]?.data || emptyAnalytics);
        });
        return map;
    }, [linkAnalyticsQueries, linksQuery.data?.content]);

    const openCreateDialog = () => {
        setEditingId(null);
        setFormError("");
        setFormState(toInitialFormState(courseId, ownerType, ownerId));
        setIsDialogOpen(true);
    };

    const openEditDialog = (link: TrackingLink) => {
        setEditingId(link.id);
        setFormError("");
        setFormState({
            name: link.name || "",
            ownerType: link.ownerType || ownerType,
            ownerId: link.ownerId || ownerId,
            destinationUrl: link.destinationUrl || `/courses/${courseId}`,
            utmSource: link.utmSource || "",
            utmMedium: link.utmMedium || "",
            utmCampaign: link.utmCampaign || "",
            expiresAt: link.expiresAt || "",
            isActive: link.isActive,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormError("");
        setFormState(toInitialFormState(courseId, ownerType, ownerId));
    };

    const handleCopy = async (value: string, message: string) => {
        await navigator.clipboard.writeText(value);
        showSuccessToast(message);
    };

    const handleDelete = async (link: TrackingLink) => {
        const confirmed = window.confirm(`"${link.name}" linkini o‘chirasizmi?`);
        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(link.id);
        } catch (error) {
            if (parseApiError(error).status === 401) {
                navigate("/login");
            }
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");

        if (!formState.name.trim()) {
            setFormError("Link nomini kiriting.");
            return;
        }

        if (!formState.ownerId.trim()) {
            setFormError("Current user topilmadi. Qayta login qilib ko‘ring.");
            return;
        }

        if (!formState.destinationUrl.trim()) {
            setFormError("Destination URL kiriting.");
            return;
        }

        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    body: buildUpdatePayload(formState),
                });
            } else {
                await createMutation.mutateAsync(buildCreatePayload(formState));
            }

            closeDialog();
        } catch (error) {
            const parsed = parseApiError(error);
            if (parsed.status === 401) {
                navigate("/login");
                return;
            }
            setFormError(parsed.message);
        }
    };

    const summaryCards = [
        {label: "Bosishlar", value: courseAnalyticsQuery.data?.clicks || 0},
        {label: "Noyob bosishlar", value: courseAnalyticsQuery.data?.uniqueClicks || 0},
        {label: "Checkout boshlangan", value: courseAnalyticsQuery.data?.checkoutStarted || 0},
        {label: "To‘langan xaridlar", value: courseAnalyticsQuery.data?.paidPurchases || 0},
        {label: "Tekin modullar", value: courseAnalyticsQuery.data?.freeEnrolls || 0},
        {label: "To‘langan summa", value: formatMoney(courseAnalyticsQuery.data?.paidAmount ?? courseAnalyticsQuery.data?.revenue)},
        {label: "Qo‘llangan komissiya", value: formatMoney(courseAnalyticsQuery.data?.appliedFeeAmount)},
        {label: "Qaytarilgan summa", value: formatMoney(courseAnalyticsQuery.data?.refundedAmount)},
    ];

    const links = linksQuery.data?.content || [];

    return (
        <div className="flex-1 overflow-auto bg-slate-50">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                <BarChart3 className="h-3.5 w-3.5"/>
                                Tracking linklar
                            </div>
                            <h2 className="mt-3 text-2xl font-bold text-slate-900">Tracking linklar va kurs ko‘rsatkichlari</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                <span className="font-semibold text-slate-900">Share link</span> tashqi ulashish uchun ishlatiladi.
                                <span className="ml-2 font-semibold text-slate-900">Course link</span> esa landing, CTA va ichki o‘tishlarda
                                `ref` yo‘qolmasligi uchun ishlatilishi kerak.
                            </p>
                        </div>

                        <Button
                            className="rounded-xl bg-slate-950 px-4 py-2 text-white hover:bg-slate-800"
                            onClick={openCreateDialog}
                        >
                            <Plus className="h-4 w-4"/>
                            Yangi tracking link
                        </Button>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-8">
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
                            Tracking linklar yuklanmoqda...
                        </div>
                    ) : linksQuery.isError ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                            {parseApiError(linksQuery.error).message}
                        </div>
                    ) : links.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-14 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                                <Link2 className="h-7 w-7"/>
                            </div>
                            <h3 className="mt-5 text-2xl font-semibold text-slate-900">Tracking link topilmadi</h3>
                            <p className="mt-3 text-sm text-slate-500">Kurs uchun hali tracking link yaratilmagan.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {links.map((link) => {
                                const analytics = analyticsMap.get(link.id) || emptyAnalytics;
                                const shareLink = getShareLink(link);
                                const courseLink = getCourseLink(link);

                                return (
                                    <article key={link.id} className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
                                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                                        {link.ownerType}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${link.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                                                        {link.isActive ? "Faol" : "Nofaol"}
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 text-2xl font-bold text-slate-900">{link.name}</h3>
                                                <p className="mt-2 text-sm text-slate-500">Kod: <span className="font-semibold text-slate-900">{link.code}</span></p>

                                                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">UTM manba</p>
                                                        <p className="mt-2 text-sm font-semibold text-slate-900">{link.utmSource || "-"}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">UTM kanal</p>
                                                        <p className="mt-2 text-sm font-semibold text-slate-900">{link.utmMedium || "-"}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">UTM kampaniya</p>
                                                        <p className="mt-2 text-sm font-semibold text-slate-900">{link.utmCampaign || "-"}</p>
                                                    </div>
                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2 xl:col-span-3">
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Amal qilish muddati</p>
                                                        <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(link.expiresAt)}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">Ulashish linki</p>
                                                                <p className="mt-1 text-xs leading-5 text-slate-500">Tashqi ulashish uchun. Bu link frontend kurs sahifasiga yo‘naltiradi.</p>
                                                            </div>
                                                            <Button className="rounded-xl" variant="outline" onClick={() => void handleCopy(shareLink, "Ulashish linki nusxalandi.")}>
                                                                <Copy className="h-4 w-4"/>
                                                                Nusxalash
                                                            </Button>
                                                        </div>
                                                        <p className="mt-3 break-all text-sm font-medium text-slate-700">{shareLink}</p>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">Kurs linki</p>
                                                                <p className="mt-1 text-xs leading-5 text-slate-500">Ichki o‘tishlar uchun. Landing, kurs kartasi va CTA shu link bilan ochilishi kerak.</p>
                                                            </div>
                                                            <Button className="rounded-xl" variant="outline" onClick={() => void handleCopy(courseLink, "Kurs linki nusxalandi.")}>
                                                                <Copy className="h-4 w-4"/>
                                                                Nusxalash
                                                            </Button>
                                                        </div>
                                                        <p className="mt-3 break-all text-sm font-medium text-slate-700">{courseLink}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="xl:w-[340px]">
                                                <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                                                    <p className="text-sm font-bold text-slate-900">Link tahlillari</p>
                                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                                        {[
                                                            {label: "Bosishlar", value: analytics.clicks},
                                                            {label: "Noyob", value: analytics.uniqueClicks},
                                                            {label: "Lidlar", value: analytics.leads},
                                                            {label: "Checkout", value: analytics.checkoutStarted},
                                                            {label: "Xaridlar", value: analytics.paidPurchases},
                                                            {label: "Tekin modul", value: analytics.freeEnrolls || 0},
                                                            {label: "To‘lov", value: formatMoney(analytics.paidAmount ?? analytics.revenue)},
                                                            {label: "Komissiya", value: formatMoney(analytics.appliedFeeAmount)},
                                                            {label: "Qaytarilgan", value: analytics.refunded},
                                                            {label: "Qaytgan summa", value: formatMoney(analytics.refundedAmount)},
                                                        ].map((item) => (
                                                            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                                                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                                                                <p className="mt-2 text-sm font-bold text-slate-900">{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <Button className="rounded-xl bg-slate-950 text-white hover:bg-slate-800" onClick={() => setAnalyticsLink(link)}>
                                                            <BarChart3 className="h-4 w-4"/>
                                                            Tahlillar
                                                        </Button>
                                                        <Button className="rounded-xl" variant="outline" onClick={() => openEditDialog(link)}>
                                                            <Pencil className="h-4 w-4"/>
                                                            Tahrirlash
                                                        </Button>
                                                        <Button className="rounded-xl" variant="outline" onClick={() => void handleDelete(link)}>
                                                            <Trash2 className="h-4 w-4"/>
                                                            O‘chirish
                                                        </Button>
                                                        <a href={shareLink} target="_blank" rel="noreferrer">
                                                            <Button className="rounded-xl" variant="outline">
                                                                <ExternalLink className="h-4 w-4"/>
                                                                Ochish
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Tracking linkni yangilash" : "Yangi tracking link yaratish"}</DialogTitle>
                            <DialogDescription>
                                Link uchun UTM va yo‘nalish qiymatlarini kiriting. Ulashish linki tashqi ulashish uchun, kurs linki esa ichki o‘tishlar uchun ishlatiladi.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nomi</label>
                                    <Input value={formState.name} onChange={(event) => setFormState((prev) => ({...prev, name: event.target.value}))}/>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Yo‘nalish URL</label>
                                    <Input value={formState.destinationUrl} onChange={(event) => setFormState((prev) => ({...prev, destinationUrl: event.target.value}))}/>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">UTM manba</label>
                                    <Input value={formState.utmSource} onChange={(event) => setFormState((prev) => ({...prev, utmSource: event.target.value}))}/>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">UTM kanal</label>
                                    <Input value={formState.utmMedium} onChange={(event) => setFormState((prev) => ({...prev, utmMedium: event.target.value}))}/>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">UTM kampaniya</label>
                                    <Input value={formState.utmCampaign} onChange={(event) => setFormState((prev) => ({...prev, utmCampaign: event.target.value}))}/>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Amal qilish muddati</label>
                                    <Input type="datetime-local" value={formState.expiresAt} onChange={(event) => setFormState((prev) => ({...prev, expiresAt: event.target.value}))}/>
                                </div>
                            </div>

                            {editingId ? (
                                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.isActive}
                                        onChange={(event) => setFormState((prev) => ({...prev, isActive: event.target.checked}))}
                                    />
                                    Linkni active holatda saqlash
                                </label>
                            ) : null}

                            {formError ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4"/>
                                        {formError}
                                    </div>
                                </div>
                            ) : null}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeDialog}>
                                    Bekor qilish
                                </Button>
                                <Button type="submit" className="bg-slate-950 text-white hover:bg-slate-800" disabled={isSubmitting}>
                                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}
                                    {editingId ? "Saqlash" : "Yaratish"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!analyticsLink} onOpenChange={(open) => !open && setAnalyticsLink(null)}>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{analyticsLink?.name || "Tracking tahlillari"}</DialogTitle>
                            <DialogDescription>
                                Shu tracking link bo‘yicha bosish, lid va xarid ko‘rsatkichlari.
                            </DialogDescription>
                        </DialogHeader>

                        {analyticsLink ? (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {[
                                    {label: "Bosishlar", value: analyticsMap.get(analyticsLink.id)?.clicks || 0},
                                    {label: "Noyob bosishlar", value: analyticsMap.get(analyticsLink.id)?.uniqueClicks || 0},
                                    {label: "Lidlar", value: analyticsMap.get(analyticsLink.id)?.leads || 0},
                                    {label: "Checkout boshlangan", value: analyticsMap.get(analyticsLink.id)?.checkoutStarted || 0},
                                    {label: "To‘langan xaridlar", value: analyticsMap.get(analyticsLink.id)?.paidPurchases || 0},
                                    {label: "Tekin modullar", value: analyticsMap.get(analyticsLink.id)?.freeEnrolls || 0},
                                    {label: "To‘langan summa", value: formatMoney(analyticsMap.get(analyticsLink.id)?.paidAmount ?? analyticsMap.get(analyticsLink.id)?.revenue)},
                                    {label: "Qo‘llangan komissiya", value: formatMoney(analyticsMap.get(analyticsLink.id)?.appliedFeeAmount)},
                                    {label: "Qaytarilgan", value: analyticsMap.get(analyticsLink.id)?.refunded || 0},
                                    {label: "Qaytarilgan summa", value: formatMoney(analyticsMap.get(analyticsLink.id)?.refundedAmount)},
                                ].map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                                        <p className="mt-3 text-xl font-bold text-slate-900">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default TrackingLinksSection;
