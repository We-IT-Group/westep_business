import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {
    AlertCircle,
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Check,
    Search,
    Trash2,
    X,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Spinner from "../../components/common/Spinner.tsx";
import {hasPermission, useUser} from "../../api/auth/useAuth.ts";
import {
    useCreateProfession,
    useDeleteProfession,
    useGetProfessionFields,
    useGetProfession,
    useGetProfessions,
    useSetProfessionActive,
    useSyncProfessionCourses,
    useUpdateProfession,
} from "../../api/professions/useProfession.ts";
import {useGetBusinessCourses} from "../../api/courses/useCourse.ts";
import type {ProfessionCreateRequest} from "../../api/professions/professionApi.ts";
import type {
    Profession,
    ProfessionDemandTone,
    ProfessionTranslation,
    SupportedLanguage,
} from "../../types/types.ts";
import ChipInput from "../../components/professions/ChipInput.tsx";
import {
    type CourseOption,
    type FieldOption,
    type ProfessionDraft,
    buildCourseOption,
    cloneDraft,
    createEmptyDraft,
    HOLLAND_LETTERS,
    STRENGTH_OPTIONS,
    SUBJECT_OPTIONS,
    VALUE_OPTIONS,
    getFieldMeta,
    getToneMeta,
    getTranslationStatusLabel,
    isTranslationEmpty,
    normalizeSlug,
    supportedLanguages,
    toFieldOption,
    toneOptions,
} from "../../components/professions/professionShared.ts";
import {Badge} from "../../components/ui/badge.tsx";
import {Checkbox} from "../../components/ui/checkbox.tsx";
import {Input} from "../../components/ui/input.tsx";
import {
    RadioGroup,
    RadioGroupItem,
} from "../../components/ui/radio-group.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../components/ui/select.tsx";
import {Switch} from "../../components/ui/switch.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs.tsx";
import {Textarea} from "../../components/ui/textarea.tsx";
import {cn} from "../../utils/utils.ts";

type EditorTab = "base" | SupportedLanguage | "courses";

const isEditorTab = (value: string | null): value is EditorTab =>
    value === "base"
    || value === "courses"
    || supportedLanguages.includes((value ?? "") as SupportedLanguage);

export default function ProfessionEditor() {
    const {id} = useParams<{id: string}>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const {data: user, isLoading: isUserLoading} = useUser();
    const canManageProfessions = hasPermission(user?.permissionsList, "PROFESSION_MANAGE");

    const {data: professionsData, isLoading: isProfessionsLoading} = useGetProfessions(canManageProfessions);
    const {data: fieldsData, isLoading: isFieldsLoading} = useGetProfessionFields(canManageProfessions);
    // Tahrirda to'liq ma'lumot (tarjimalar, moslik profili, tavsiya yoshi) faqat detail endpointda bor
    const {data: professionDetail, isLoading: isDetailLoading} = useGetProfession(canManageProfessions ? id : undefined);
    const {data: coursesData} = useGetBusinessCourses(canManageProfessions);

    const createProfessionMut = useCreateProfession();
    const updateProfessionMut = useUpdateProfession();
    const deleteProfessionMut = useDeleteProfession();
    const setActiveMut = useSetProfessionActive();
    const syncCoursesMut = useSyncProfessionCourses();

    const professions: Profession[] = useMemo(() => professionsData ?? [], [professionsData]);
    const fieldOptions: FieldOption[] = useMemo(
        () => (fieldsData ?? []).map(toFieldOption),
        [fieldsData],
    );
    const courseCatalog: CourseOption[] = useMemo(
        () => (coursesData ?? []).map(buildCourseOption),
        [coursesData],
    );

    const existingProfession = useMemo(
        () => (id ? professionDetail ?? null : null),
        [id, professionDetail],
    );

    const initialTabParam = searchParams.get("tab");
    const [tab, setTab] = useState<EditorTab>(isEditorTab(initialTabParam) ? initialTabParam : "base");
    const [formError, setFormError] = useState<string | null>(null);
    const [courseSearch, setCourseSearch] = useState("");
    const [draft, setDraft] = useState<ProfessionDraft>(() => createEmptyDraft([], 1));
    const [isDraftReady, setIsDraftReady] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isDataLoading =
        isUserLoading || (canManageProfessions && (isProfessionsLoading || isFieldsLoading || (isEditMode && isDetailLoading)));

    useEffect(() => {
        if (isDraftReady || isDataLoading || !canManageProfessions) {
            return;
        }

        if (isEditMode) {
            if (existingProfession) {
                setDraft(cloneDraft(existingProfession));
                setIsDraftReady(true);
            }
            return;
        }

        setDraft(createEmptyDraft(fieldOptions, professions.length + 1));
        setIsDraftReady(true);
    }, [canManageProfessions, existingProfession, fieldOptions, isDataLoading, isDraftReady, isEditMode, professions.length]);

    const updateTranslation = (languageCode: SupportedLanguage, patch: Partial<ProfessionTranslation>) => {
        setDraft((current) => ({
            ...current,
            translations: {
                ...current.translations,
                [languageCode]: {
                    ...current.translations[languageCode],
                    ...patch,
                },
            },
        }));
    };

    const toggleCourse = (courseId: string) => {
        setDraft((current) => ({
            ...current,
            courseIds: current.courseIds.includes(courseId)
                ? current.courseIds.filter((item) => item !== courseId)
                : [...current.courseIds, courseId],
        }));
    };

    const moveSelectedCourse = (courseId: string, direction: "up" | "down") => {
        setDraft((current) => {
            const index = current.courseIds.indexOf(courseId);
            if (index === -1) {
                return current;
            }

            const nextIndex = direction === "up" ? index - 1 : index + 1;
            if (nextIndex < 0 || nextIndex >= current.courseIds.length) {
                return current;
            }

            const nextCourseIds = [...current.courseIds];
            const [moved] = nextCourseIds.splice(index, 1);
            nextCourseIds.splice(nextIndex, 0, moved);
            return {
                ...current,
                courseIds: nextCourseIds,
            };
        });
    };

    const validateDraft = () => {
        if (!draft.slug.trim()) return "Slug majburiy.";
        if (!draft.emoji.trim()) return "Emoji majburiy.";
        if (!draft.fieldKey.trim()) return "Soha tanlang.";
        if (!draft.gradFrom.trim() || !draft.gradTo.trim()) return "Gradient ranglari majburiy.";
        if (!draft.displayOrder || draft.displayOrder < 1) return "Tartib 1 yoki undan katta bo'lishi kerak.";

        const uz = draft.translations.uz;
        if (!uz.title.trim()) return "UZ tarjimasida title majburiy.";
        if (!uz.tagline.trim()) return "UZ tarjimasida tagline majburiy.";
        if (!uz.description.trim()) return "UZ tarjimasida description majburiy.";
        if (!uz.demandLabel.trim()) return "UZ tarjimasida demandLabel majburiy.";
        if (!uz.durationLabel.trim()) return "UZ tarjimasida durationLabel majburiy.";
        if (!uz.levelLabel.trim()) return "UZ tarjimasida levelLabel majburiy.";
        if (!uz.skills.length) return "UZ tarjimasida kamida bitta skill qo'shing.";
        if (!uz.roles.length) return "UZ tarjimasida kamida bitta role qo'shing.";

        return null;
    };

    const handleSave = async () => {
        const validationError = validateDraft();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        const uz = draft.translations.uz;
        const translations = supportedLanguages
            .map((languageCode) => draft.translations[languageCode])
            .filter((translation) => translation.languageCode === "uz" || !isTranslationEmpty(translation));

        const payload: ProfessionCreateRequest = {
            slug: normalizeSlug(draft.slug),
            emoji: draft.emoji.trim() || "💼",
            fieldKey: draft.fieldKey,
            gradFrom: draft.gradFrom,
            gradTo: draft.gradTo,
            demand: uz.demandLabel,
            demandTone: draft.demandTone,
            duration: uz.durationLabel,
            level: uz.levelLabel,
            displayOrder: draft.displayOrder,
            recommendedFromAge: draft.recommendedFromAge,
            hollandCode: draft.hollandCode || null,
            subjectKeys: draft.subjectKeys,
            strengthKeys: draft.strengthKeys,
            valueKeys: draft.valueKeys,
            translations,
        };

        setIsSaving(true);
        try {
            let saved: Profession | null = null;

            if (draft.id) {
                saved = await updateProfessionMut.mutateAsync({id: draft.id, ...payload});
            } else {
                saved = await createProfessionMut.mutateAsync(payload);
            }

            const savedId = saved?.id ?? draft.id;
            if (savedId) {
                const currentCourseIds = existingProfession?.courses.map((course) => course.id)
                    ?? saved?.courses.map((course) => course.id)
                    ?? [];
                const desiredCourseIds = draft.courseIds;
                const coursesChanged =
                    currentCourseIds.length !== desiredCourseIds.length
                    || currentCourseIds.some((courseId, index) => courseId !== desiredCourseIds[index]);

                if (coursesChanged) {
                    await syncCoursesMut.mutateAsync({id: savedId, desiredCourseIds, currentCourseIds});
                }

                const currentActive = existingProfession?.active ?? saved?.active ?? false;
                if (currentActive !== draft.active) {
                    await setActiveMut.mutateAsync({id: savedId, active: draft.active});
                }
            }

            navigate("/professions");
        } catch (error) {
            console.error("Failed to save profession", error);
            setFormError("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDraft = () => {
        if (!draft.id) {
            return;
        }

        const confirmed = window.confirm("Bu kasbni yashirasizmi? Foydalanuvchilarga ko'rinmaydi, lekin saqlanadi.");
        if (!confirmed) {
            return;
        }

        deleteProfessionMut.mutate(draft.id);
        navigate("/professions");
    };

    const visibleCourseOptions = useMemo(() => {
        const query = courseSearch.trim().toLowerCase();
        return courseCatalog.filter((course) => !query || course.name.toLowerCase().includes(query) || course.emoji.includes(query));
    }, [courseSearch, courseCatalog]);

    const selectedCourseOptions = useMemo(
        () =>
            draft.courseIds
                .map((courseId) => courseCatalog.find((course) => course.id === courseId))
                .filter((course): course is CourseOption => Boolean(course)),
        [draft.courseIds, courseCatalog],
    );

    if (isDataLoading || (canManageProfessions && !isDraftReady && (!isEditMode || existingProfession))) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!canManageProfessions) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center pb-10">
                <PageMeta title="Kasblar" description="Kasblar katalogi boshqaruv sahifasi." />
                <section className="w-full rounded-[28px] border border-rose-200 bg-rose-50/80 p-6 shadow-[0_18px_40px_rgba(244,63,94,0.08)] backdrop-blur-xl dark:border-rose-500/20 dark:bg-rose-500/10">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm dark:bg-slate-950 dark:text-rose-300">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                        Sizda `PROFESSION_MANAGE` permission yo'q
                    </h1>
                    <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Bu sahifa kasb yaratish va tahrirlash uchun mo'ljallangan. Permission sizning rolingizga
                        qo'shilgach, sahifa avtomatik ochiladi.
                    </p>
                </section>
            </div>
        );
    }

    if (isEditMode && !existingProfession) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center pb-10">
                <PageMeta title="Kasb topilmadi" description="Kasb topilmadi." />
                <section className="w-full rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
                        Kasb topilmadi
                    </h1>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Bu kasb o'chirilgan yoki mavjud emas. Kasblar ro'yxatiga qaytib qayta urinib ko'ring.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/professions")}
                        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kasblar ro'yxati
                    </button>
                </section>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1180px] space-y-4 pb-10">
            <PageMeta
                title={isEditMode ? "Kasbni tahrirlash" : "Yangi kasb"}
                description="Kasb ma'lumotlari, tarjimalar va kurslarni boshqarish sahifasi."
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/professions")}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                            aria-label="Kasblar ro'yxatiga qaytish"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
                                {isEditMode ? "Kasbni tahrirlash" : "Yangi kasb"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Asosiy ma'lumotlar, tarjimalar va kurs biriktirishni shu sahifada boshqaring.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg shadow-sm"
                            style={{background: `linear-gradient(135deg, ${draft.gradFrom}, ${draft.gradTo})`}}
                        >
                            <span className="drop-shadow-sm">{draft.emoji || "💼"}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                                {draft.translations.uz.title || "Kasb nomi"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">/{draft.slug || "slug"}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
                {formError ? (
                    <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                        {formError}
                    </div>
                ) : null}

                <Tabs value={tab} onValueChange={(value) => setTab(value as EditorTab)}>
                    <TabsList className="h-auto w-full justify-start rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
                        <TabsTrigger value="base" className="flex-1 rounded-xl px-3 py-2.5">
                            Asosiy
                        </TabsTrigger>
                        {supportedLanguages.map((languageCode) => {
                            const translation = draft.translations[languageCode];
                            return (
                                <TabsTrigger key={languageCode} value={languageCode} className="flex-1 rounded-xl px-3 py-2.5">
                                    <span className="flex flex-col items-center gap-0.5">
                                        <span className="text-sm font-semibold uppercase tracking-[0.14em]">{languageCode}</span>
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                            {getTranslationStatusLabel(translation)}
                                        </span>
                                    </span>
                                </TabsTrigger>
                            );
                        })}
                        <TabsTrigger value="courses" className="flex-1 rounded-xl px-3 py-2.5">
                            Kurslar
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="base" className="mt-6">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Slug
                                        </label>
                                        <Input
                                            value={draft.slug}
                                            onChange={(event) => setDraft((current) => ({...current, slug: event.target.value}))}
                                            placeholder="frontend-dasturchi"
                                            className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Kebab-case va ASCII transliteratsiya tavsiya qilinadi.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Emoji
                                        </label>
                                        <Input
                                            value={draft.emoji}
                                            onChange={(event) => setDraft((current) => ({...current, emoji: event.target.value.slice(0, 8)}))}
                                            placeholder="💼"
                                            className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Soha
                                        </label>
                                        <Select
                                            value={draft.fieldKey}
                                            onValueChange={(value) => {
                                                const fieldMeta = getFieldMeta(fieldOptions, value);
                                                setDraft((current) => ({
                                                    ...current,
                                                    fieldKey: fieldMeta.key,
                                                    fieldLabel: fieldMeta.label,
                                                }));
                                            }}
                                        >
                                            <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70">
                                                <SelectValue placeholder="Soha tanlang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fieldOptions.map((field) => (
                                                    <SelectItem key={field.key} value={field.key}>
                                                        {field.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Gradient from
                                        </label>
                                        <Input
                                            type="color"
                                            value={draft.gradFrom}
                                            onChange={(event) => setDraft((current) => ({...current, gradFrom: event.target.value}))}
                                            className="h-11 rounded-2xl border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Gradient to
                                        </label>
                                        <Input
                                            type="color"
                                            value={draft.gradTo}
                                            onChange={(event) => setDraft((current) => ({...current, gradTo: event.target.value}))}
                                            className="h-11 rounded-2xl border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/70"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Demand tone
                                    </label>
                                    <RadioGroup
                                        value={draft.demandTone}
                                        onValueChange={(value) =>
                                            setDraft((current) => ({...current, demandTone: value as ProfessionDemandTone}))
                                        }
                                        className="grid gap-3 sm:grid-cols-3"
                                    >
                                        {toneOptions.map((tone) => (
                                            <label
                                                key={tone.value}
                                                className={cn(
                                                    "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition hover:shadow-sm",
                                                    tone.className,
                                                    draft.demandTone === tone.value && "ring-2 ring-slate-950/10 dark:ring-white/10",
                                                )}
                                            >
                                                <RadioGroupItem value={tone.value} className="mt-1" />
                                                <span className="space-y-1">
                                                    <span className="block text-sm font-semibold">{tone.label}</span>
                                                    <span className="block text-xs leading-5 opacity-80">{tone.helper}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Tartib va ko'rinish
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Tahrirlar catalogdagi joylashuv va ko'rinishni belgilaydi.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                        #{draft.displayOrder}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Display order
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={draft.displayOrder}
                                        onChange={(event) =>
                                            setDraft((current) => ({...current, displayOrder: Number(event.target.value) || 1}))
                                        }
                                        className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Tavsiya yoshi (nechchi yoshdan)
                                    </label>
                                    <Input
                                        type="number"
                                        min={5}
                                        max={17}
                                        placeholder="Masalan: 9"
                                        value={draft.recommendedFromAge ?? ""}
                                        onChange={(event) =>
                                            setDraft((current) => ({
                                                ...current,
                                                recommendedFromAge: event.target.value ? Number(event.target.value) : null,
                                            }))
                                        }
                                        className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Bo'sh qolsa — barcha yoshlarga tavsiya qilinadi.
                                    </p>
                                </div>

                                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Kasbga moslik profili</p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Qiziqish testi natijasi bilan solishtirib, bolaga "Senga N% mos" ko'rsatiladi.
                                        </p>
                                    </div>
                                    <ChipPicker
                                        label="Holland kodi — eng kuchlisidan boshlab, ko'pi bilan 3 ta"
                                        options={HOLLAND_LETTERS}
                                        selected={draft.hollandCode.split("").filter(Boolean)}
                                        max={3}
                                        ordered
                                        onChange={(next) => setDraft((current) => ({ ...current, hollandCode: next.join("") }))}
                                    />
                                    <ChipPicker
                                        label="Asosiy fan va sohalar — ko'pi bilan 4 ta (moslikda eng katta ulush)"
                                        options={SUBJECT_OPTIONS}
                                        selected={draft.subjectKeys}
                                        max={4}
                                        onChange={(next) => setDraft((current) => ({ ...current, subjectKeys: next }))}
                                    />
                                    <ChipPicker
                                        label="Kerakli kuchli tomonlar — ko'pi bilan 3 ta"
                                        options={STRENGTH_OPTIONS}
                                        selected={draft.strengthKeys}
                                        max={3}
                                        onChange={(next) => setDraft((current) => ({ ...current, strengthKeys: next }))}
                                    />
                                    <ChipPicker
                                        label="Mos qadriyatlar — ko'pi bilan 2 ta"
                                        options={VALUE_OPTIONS}
                                        selected={draft.valueKeys}
                                        max={2}
                                        onChange={(next) => setDraft((current) => ({ ...current, valueKeys: next }))}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            Active holat
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            O'chirmasdan yashirish uchun o'chirilgan holatga o'tadi.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={draft.active}
                                        onCheckedChange={(checked) =>
                                            setDraft((current) => ({...current, active: checked}))
                                        }
                                    />
                                </div>

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                        Preview
                                    </p>
                                    <div className="mt-3 flex items-start gap-3">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-sm"
                                            style={{background: `linear-gradient(135deg, ${draft.gradFrom}, ${draft.gradTo})`}}
                                        >
                                            <span className="drop-shadow-sm">{draft.emoji || "💼"}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-base font-semibold text-slate-950 dark:text-slate-100">
                                                {draft.translations.uz.title || "Kasb nomi"}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                /{draft.slug || "slug"}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                    {getFieldMeta(fieldOptions, draft.fieldKey).label}
                                                </Badge>
                                                <Badge variant="outline" className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getToneMeta(draft.demandTone).className)}>
                                                    {getToneMeta(draft.demandTone).label}
                                                </Badge>
                                                <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                    {draft.courseIds.length} kurs
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {supportedLanguages.map((languageCode) => (
                        <TabsContent key={languageCode} value={languageCode} className="mt-6">
                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
                                <div className="space-y-4">
                                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                                                    {languageCode.toUpperCase()} tarjima
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    Tab statusi: {getTranslationStatusLabel(draft.translations[languageCode])}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                                {languageCode}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                Title
                                            </label>
                                            <Input
                                                value={draft.translations[languageCode].title}
                                                onChange={(event) => updateTranslation(languageCode, {title: event.target.value})}
                                                placeholder={`${languageCode.toUpperCase()} title`}
                                                className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                Tagline
                                            </label>
                                            <Input
                                                value={draft.translations[languageCode].tagline}
                                                onChange={(event) => updateTranslation(languageCode, {tagline: event.target.value})}
                                                placeholder="Qisqa tagline"
                                                className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                Description
                                            </label>
                                            <Textarea
                                                value={draft.translations[languageCode].description}
                                                onChange={(event) => updateTranslation(languageCode, {description: event.target.value})}
                                                placeholder="Kasb haqida batafsil tavsif"
                                                className="min-h-32 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                Demand label
                                            </label>
                                            <Input
                                                value={draft.translations[languageCode].demandLabel}
                                                onChange={(event) => updateTranslation(languageCode, {demandLabel: event.target.value})}
                                                placeholder="Yuqori talab"
                                                className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                Duration label
                                            </label>
                                            <Input
                                                value={draft.translations[languageCode].durationLabel}
                                                onChange={(event) => updateTranslation(languageCode, {durationLabel: event.target.value})}
                                                placeholder="4-6 oy"
                                                className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                Level label
                                            </label>
                                            <Input
                                                value={draft.translations[languageCode].levelLabel}
                                                onChange={(event) => updateTranslation(languageCode, {levelLabel: event.target.value})}
                                                placeholder="Junior - Middle"
                                                className="h-11 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                        <ChipInput
                                            label="Skills"
                                            value={draft.translations[languageCode].skills}
                                            onChange={(next) => updateTranslation(languageCode, {skills: next})}
                                            placeholder="Enter bo'lib skill qo'shing"
                                            helper="Skills chip ko'rinishida saqlanadi."
                                        />
                                    </div>
                                    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                        <ChipInput
                                            label="Roles"
                                            value={draft.translations[languageCode].roles}
                                            onChange={(next) => updateTranslation(languageCode, {roles: next})}
                                            placeholder="Role nomi kiriting"
                                            helper="Kasb bo'yicha rollar va lavozimlar."
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    ))}

                    <TabsContent value="courses" className="mt-6">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                            <div className="space-y-4">
                                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                                                Kurs biriktirish
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                Kurslarni tanlang va kerak bo'lsa tartibini yuqoridan pastga o'zgartiring.
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                                            {draft.courseIds.length} tanlangan
                                        </Badge>
                                    </div>

                                    <div className="relative mt-4">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            value={courseSearch}
                                            onChange={(event) => setCourseSearch(event.target.value)}
                                            placeholder="Kurs qidirish..."
                                            className="h-11 rounded-2xl border-slate-200 bg-white pl-11 dark:border-slate-800 dark:bg-slate-950"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    {visibleCourseOptions.map((course) => {
                                        const isSelected = draft.courseIds.includes(course.id);
                                        return (
                                            <label
                                                key={course.id}
                                                className={cn(
                                                    "flex cursor-pointer items-start gap-3 rounded-[22px] border p-4 transition hover:shadow-sm",
                                                    isSelected
                                                        ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                                                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
                                                )}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleCourse(course.id)}
                                                    className="mt-1"
                                                />
                                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-lg shadow-sm dark:bg-slate-900">
                                                    {course.emoji}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-semibold text-slate-950 dark:text-slate-100">
                                                        {course.name}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                                                        {getFieldMeta(fieldOptions, course.fieldKey).label}
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                                        Tanlangan kurslar
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Kurslar ro'yxatini yuqoriga/pastga ko'chirish mumkin.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {selectedCourseOptions.length > 0 ? (
                                        selectedCourseOptions.map((course, index) => (
                                            <div
                                                key={course.id}
                                                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/60"
                                            >
                                                <span className="text-lg">{course.emoji}</span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-semibold text-slate-950 dark:text-slate-100">
                                                        {course.name}
                                                    </span>
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSelectedCourse(course.id, "up")}
                                                        disabled={index === 0}
                                                        className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-white"
                                                        aria-label="Kursni yuqoriga o'tkazish"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveSelectedCourse(course.id, "down")}
                                                        disabled={index === selectedCourseOptions.length - 1}
                                                        className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-white"
                                                        aria-label="Kursni pastga o'tkazish"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCourse(course.id)}
                                                        className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                                                        aria-label="Kursni olib tashlash"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                                            Hozircha kurs tanlanmagan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            <section className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/professions")}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        Bekor qilish
                    </button>
                    {isEditMode ? (
                        <button
                            type="button"
                            onClick={handleDeleteDraft}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15"
                        >
                            <Trash2 className="h-4 w-4" />
                            Yashirish
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                        <Check className="h-4 w-4" />
                        {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                </div>
            </section>
        </div>
    );
}

function ChipPicker({
    label,
    options,
    selected,
    max,
    ordered = false,
    onChange,
}: {
    label: string;
    options: Array<{ key: string; label: string }>;
    selected: string[];
    max: number;
    ordered?: boolean;
    onChange: (next: string[]) => void;
}) {
    const toggle = (key: string) => {
        if (selected.includes(key)) onChange(selected.filter((item) => item !== key));
        else if (selected.length < max) onChange([...selected, key]);
    };
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const index = selected.indexOf(option.key);
                    const active = index >= 0;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            aria-pressed={active}
                            disabled={!active && selected.length >= max}
                            onClick={() => toggle(option.key)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                                active
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                            }`}
                        >
                            {ordered && active ? `${index + 1}. ` : ""}
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
