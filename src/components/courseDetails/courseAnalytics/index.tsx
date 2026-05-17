import {type FormEvent, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {AlertCircle, CheckCircle2, Link2, LoaderCircle, Plus} from "lucide-react";
import {Button} from "../../ui/button.tsx";
import {Input} from "../../ui/input.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog.tsx";
import {useUser} from "../../../api/auth/useAuth.ts";
import {
    useCourseTrackingAnalytics,
    useCreateTrackingLink,
    useDeleteTrackingLink,
    useSourceTrackingAnalytics,
    useTrackingLinks,
    useUpdateTrackingLink,
} from "../../../api/trackingLinks/useTrackingLinks.ts";
import type {TrackingLinkAnalytics, TrackingOwnerType, TrackingSourceType} from "../../../types/types.ts";
import {parseApiError} from "../../../utils/apiError.ts";
import LinkCard from "./LinkCard.tsx";
import MetricsSummaryBar from "./MetricsSummaryBar.tsx";
import SourceTabs from "./SourceTabs.tsx";
import {defaultSourceTypes, getSourceLabel, sourceTypeOptions} from "./utils.ts";

const emptyAnalytics: TrackingLinkAnalytics = {
    clicks: 0,
    uniqueClicks: 0,
    leads: 0,
    checkoutStarted: 0,
    paidPurchases: 0,
    freeEnrolls: 0,
    paidAmount: 0,
    appliedFeeAmount: 0,
    netAmount: 0,
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
    sourceType: TrackingSourceType;
    isActive: boolean;
};

const getOwnerType = (roleName?: string): TrackingOwnerType => {
    const normalized = roleName?.toUpperCase() || "";
    return normalized.includes("TEACHER") ? "TEACHER" : "BUSINESS_OWNER";
};

const toInitialFormState = (ownerType: TrackingOwnerType, ownerId: string): TrackingFormState => ({
    name: "",
    ownerType,
    ownerId,
    sourceType: ownerType === "TEACHER" ? "TEACHER_LINK" : "BUSINESS_LINK",
    isActive: true,
});

function CourseAnalyticsPage({courseId}: {courseId: string}) {
    const navigate = useNavigate();
    const {data: user} = useUser();
    const ownerType = getOwnerType(user?.roleName);
    const ownerId = user?.id || "";

    const [selectedSource, setSelectedSource] = useState<"ALL" | TrackingSourceType>("ALL");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [analyticsLinkId, setAnalyticsLinkId] = useState<string | null>(null);
    const [formError, setFormError] = useState("");
    const [formState, setFormState] = useState<TrackingFormState>(toInitialFormState(ownerType, ownerId));

    const linksQuery = useTrackingLinks(courseId);
    const courseAnalyticsQuery = useCourseTrackingAnalytics(courseId);
    const sourceAnalyticsQuery = useSourceTrackingAnalytics(courseId, selectedSource);
    const createMutation = useCreateTrackingLink(courseId);
    const updateMutation = useUpdateTrackingLink(courseId);
    const deleteMutation = useDeleteTrackingLink(courseId);
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        const error = linksQuery.error || courseAnalyticsQuery.error || sourceAnalyticsQuery.error;
        if (error && parseApiError(error).status === 401) {
            navigate("/login");
        }
    }, [courseAnalyticsQuery.error, linksQuery.error, navigate, sourceAnalyticsQuery.error]);

    useEffect(() => {
        if (!isDialogOpen || !editingId) return;
        const link = (linksQuery.data?.content || []).find((item) => item.id === editingId);
        if (!link) return;
        setFormState({
            name: link.name || "",
            ownerType: link.ownerType || ownerType,
            ownerId: link.ownerId || ownerId,
            sourceType: link.sourceType || "BUSINESS_LINK",
            isActive: link.isActive,
        });
    }, [editingId, isDialogOpen, linksQuery.data?.content, ownerId, ownerType]);

    const sourceAnalyticsMap = useMemo(() => {
        const map = new Map<string, TrackingLinkAnalytics>();
        (sourceAnalyticsQuery.data || []).forEach((item) => {
            if (!item.id) return;
            map.set(item.id, item);
        });
        return map;
    }, [sourceAnalyticsQuery.data]);

    const links = useMemo(() => linksQuery.data?.content || [], [linksQuery.data?.content]);
    const filteredLinks = useMemo(
        () => (selectedSource === "ALL" ? links : links.filter((link) => link.sourceType === selectedSource)),
        [links, selectedSource],
    );

    const summary = useMemo(() => {
        if (selectedSource === "ALL") {
            return courseAnalyticsQuery.data || emptyAnalytics;
        }

        return (sourceAnalyticsQuery.data || []).reduce<TrackingLinkAnalytics>(
            (accumulator, item) => ({
                ...accumulator,
                clicks: accumulator.clicks + (item.clicks || 0),
                uniqueClicks: accumulator.uniqueClicks + (item.uniqueClicks || 0),
                leads: accumulator.leads + (item.leads || 0),
                checkoutStarted: accumulator.checkoutStarted + (item.checkoutStarted || 0),
                paidPurchases: accumulator.paidPurchases + (item.paidPurchases || 0),
                freeEnrolls: (accumulator.freeEnrolls || 0) + (item.freeEnrolls || 0),
                paidAmount: (accumulator.paidAmount || 0) + (item.paidAmount || 0),
                appliedFeeAmount: (accumulator.appliedFeeAmount || 0) + (item.appliedFeeAmount || 0),
                netAmount: (accumulator.netAmount || 0) + (item.netAmount || 0),
                refunded: accumulator.refunded + (item.refunded || 0),
                refundedAmount: (accumulator.refundedAmount || 0) + (item.refundedAmount || 0),
            }),
            {...emptyAnalytics},
        );
    }, [courseAnalyticsQuery.data, selectedSource, sourceAnalyticsQuery.data]);

    const openCreateDialog = (sourceType: TrackingSourceType) => {
        setEditingId(null);
        setFormError("");
        setFormState({
            ...toInitialFormState(ownerType, ownerId),
            sourceType,
            name: getSourceLabel(sourceType),
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (linkId: string) => {
        const link = links.find((item) => item.id === linkId);
        if (!link) return;
        setEditingId(linkId);
        setFormError("");
        setFormState({
            name: link.name || "",
            ownerType: link.ownerType || ownerType,
            ownerId: link.ownerId || ownerId,
            sourceType: link.sourceType || "TEACHER_LINK",
            isActive: link.isActive,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingId(null);
        setFormError("");
        setFormState(toInitialFormState(ownerType, ownerId));
    };

    const handleDelete = async (linkId: string) => {
        const link = links.find((item) => item.id === linkId);
        const confirmed = window.confirm(`"${link?.name || "Tracking link"}" linkini o‘chirasizmi?`);
        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(linkId);
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

        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    body: {
                        name: formState.name.trim(),
                        sourceType: formState.sourceType,
                        isActive: formState.isActive,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    courseId,
                    name: formState.name.trim(),
                    ownerType: formState.ownerType,
                    ownerId: formState.ownerId.trim(),
                    sourceType: formState.sourceType,
                });
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

    const analyticsLink = links.find((item) => item.id === analyticsLinkId) || null;
    const analyticsStats = analyticsLink ? sourceAnalyticsMap.get(analyticsLink.id) || emptyAnalytics : emptyAnalytics;
    const emptyMessage =
        selectedSource === "ALL"
            ? "Kurs uchun tracking linklar hali yaratilmagan."
            : "Tanlangan source uchun link topilmadi.";
    const hasTeacherLinkFilter = selectedSource === "TEACHER_LINK";
    const filteredDefaultLinks = filteredLinks.filter((link) => link.sourceType && defaultSourceTypes.includes(link.sourceType));
    const filteredTeacherLinks = filteredLinks.filter((link) => link.sourceType === "TEACHER_LINK");

    return (
        <div className="flex-1 overflow-auto bg-slate-50">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-950">Tracking linklar va analytics</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Qaysi source orqali foydalanuvchi kelib, xarid yoki tekin modul olganini shu yerda ko‘rasiz.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                className="rounded-lg bg-slate-950 text-white hover:bg-slate-800"
                                onClick={() => openCreateDialog("BUSINESS_LINK")}
                            >
                                <Plus className="h-4 w-4"/>
                                Yangi link
                            </Button>
                            <Button type="button" variant="outline" className="rounded-lg" onClick={() => openCreateDialog("TEACHER_LINK")}>
                                <Plus className="h-4 w-4"/>
                                O‘qituvchi linki
                            </Button>
                        </div>
                    </div>
                </section>

                <MetricsSummaryBar summary={summary}/>
                <SourceTabs value={selectedSource} onChange={setSelectedSource}/>

                <section className="space-y-4">
                    {linksQuery.isLoading ? (
                        <div className="grid gap-4">
                            {Array.from({length: 3}).map((_, index) => (
                                <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="h-5 w-40 rounded bg-slate-200"/>
                                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_380px]">
                                        <div className="space-y-3">
                                            <div className="h-14 rounded-xl bg-slate-100"/>
                                            <div className="h-14 rounded-xl bg-slate-100"/>
                                            <div className="h-14 rounded-xl bg-slate-100"/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                                            {Array.from({length: 6}).map((__, cardIndex) => (
                                                <div key={cardIndex} className="h-16 rounded-lg bg-slate-100"/>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : linksQuery.isError ? (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                            {parseApiError(linksQuery.error).message}
                        </div>
                    ) : filteredLinks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Link2 className="h-7 w-7"/>
                            </div>
                            <h3 className="mt-5 text-2xl font-semibold text-slate-950">Tracking link topilmadi</h3>
                            <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!hasTeacherLinkFilter ? (
                                <div className="space-y-4">
                                    {filteredDefaultLinks.map((link) => (
                                        <div key={link.id} className="translate-y-0 opacity-100 transition-all duration-150">
                                            <LinkCard
                                                link={link}
                                                stats={sourceAnalyticsMap.get(link.id) || emptyAnalytics}
                                                onViewAnalytics={setAnalyticsLinkId}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            {filteredTeacherLinks.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredTeacherLinks.map((link) => (
                                        <div key={link.id} className="translate-y-0 opacity-100 transition-all duration-150">
                                            <LinkCard
                                                link={link}
                                                stats={sourceAnalyticsMap.get(link.id) || emptyAnalytics}
                                                onEdit={openEditDialog}
                                                onDelete={handleDelete}
                                                onViewAnalytics={setAnalyticsLinkId}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )}
                </section>

                <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Tracking linkni yangilash" : "Yangi tracking link yaratish"}</DialogTitle>
                            <DialogDescription>
                                Asosiy linklar source type bilan boshqariladi, o‘qituvchi linki esa alohida yaratiladi.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nomi</label>
                                    <Input value={formState.name} onChange={(event) => setFormState((prev) => ({...prev, name: event.target.value}))}/>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Source turi</label>
                                    <select
                                        value={formState.sourceType}
                                        onChange={(event) => setFormState((prev) => ({...prev, sourceType: event.target.value as TrackingSourceType}))}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-slate-400 focus-visible:ring-1 focus-visible:ring-slate-400"
                                    >
                                        {sourceTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {editingId ? (
                                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={formState.isActive}
                                        onChange={(event) => setFormState((prev) => ({...prev, isActive: event.target.checked}))}
                                    />
                                    Link faol bo‘lsin
                                </label>
                            ) : null}

                            {formError ? (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4"/>
                                        {formError}
                                    </div>
                                </div>
                            ) : null}

                            <DialogFooter>
                                <Button type="button" variant="outline" className="rounded-lg" onClick={closeDialog}>
                                    Bekor qilish
                                </Button>
                                <Button type="submit" className="rounded-lg bg-slate-950 text-white hover:bg-slate-800" disabled={isSubmitting}>
                                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}
                                    {editingId ? "Saqlash" : "Yaratish"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!analyticsLink} onOpenChange={(open) => !open && setAnalyticsLinkId(null)}>
                    <DialogContent className="sm:max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>{analyticsLink?.name || "Link tahlillari"}</DialogTitle>
                            <DialogDescription>Tanlangan tracking link bo‘yicha to‘liq natijalar.</DialogDescription>
                        </DialogHeader>
                        <MetricsSummaryBar summary={analyticsStats}/>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default CourseAnalyticsPage;
