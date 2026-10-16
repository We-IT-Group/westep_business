import type {
    Course,
    Profession,
    ProfessionDemandTone,
    ProfessionField,
    ProfessionTranslation,
    SupportedLanguage,
} from "../../types/types.ts";

export const supportedLanguages = ["uz", "ru", "en"] as const satisfies readonly SupportedLanguage[];
export const defaultTone: ProfessionDemandTone = "MEDIUM";

export type FieldOption = ProfessionField & {
    helper: string;
    toneHint: string;
};

export type CourseOption = {
    id: string;
    name: string;
    emoji: string;
    fieldKey: string;
};

export type ProfessionDraft = {
    id?: string;
    slug: string;
    emoji: string;
    fieldKey: string;
    fieldLabel: string;
    gradFrom: string;
    gradTo: string;
    demandTone: ProfessionDemandTone;
    displayOrder: number;
    recommendedFromAge: number | null;
    hollandCode: string;
    subjectKeys: string[];
    strengthKeys: string[];
    valueKeys: string[];
    active: boolean;
    translations: Record<SupportedLanguage, ProfessionTranslation>;
    courseIds: string[];
};

export const fallbackFieldMeta: Record<string, {helper: string; toneHint: string}> = {
    EDUCATION: {helper: "O'qituvchi, mentor va metodist yo'nalishlari.", toneHint: "O'qitish va mentorlik"},
    BUSINESS: {helper: "Savdo, menejment va tadbirkorlik rollari.", toneHint: "O'sish va boshqaruv"},
    MEDIA: {helper: "Jurnalistika, kontent va kommunikatsiya.", toneHint: "Yozish va auditoriya"},
    CREATIVE: {helper: "Dizayn, foto, video va vizual kasblar.", toneHint: "Vizual ijod"},
    HOSPITALITY: {helper: "Oshpazlik, servis va mijoz bilan ishlash.", toneHint: "Mehmondo'stlik"},
    LOGISTICS: {helper: "Yetkazib berish, reja va operatsion rollar.", toneHint: "Jarayon va yetkazish"},
};

export const toFieldOption = (field: ProfessionField): FieldOption => ({
    key: field.key,
    label: field.label,
    helper: fallbackFieldMeta[field.key]?.helper ?? "Yangi soha.",
    toneHint: fallbackFieldMeta[field.key]?.toneHint ?? field.label,
});

export const buildCourseOption = (course: Course): CourseOption => ({
    id: course.id,
    name: course.name,
    emoji: (course as {emoji?: string}).emoji || "📚",
    fieldKey: (course as {primaryCategoryCode?: string}).primaryCategoryCode
        || (course as {primaryCategoryId?: string}).primaryCategoryId
        || "",
});

export const toneOptions: Array<{
    value: ProfessionDemandTone;
    label: string;
    helper: string;
    className: string;
}> = [
    {
        value: "HIGH",
        label: "Yuqori",
        helper: "Bozor talabi juda kuchli",
        className: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
    },
    {
        value: "MEDIUM",
        label: "O'rtacha",
        helper: "Barqaror va o'sib borayotgan",
        className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    },
    {
        value: "LOW",
        label: "Past",
        helper: "Hozircha nish bozor",
        className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    },
];

export const createTranslationDraft = (languageCode: SupportedLanguage): ProfessionTranslation => ({
    languageCode,
    title: "",
    tagline: "",
    description: "",
    demandLabel: "",
    durationLabel: "",
    levelLabel: "",
    skills: [],
    roles: [],
});

export const createEmptyDraft = (fields: FieldOption[], nextOrder: number): ProfessionDraft => ({
    slug: "",
    emoji: "💼",
    fieldKey: fields[0]?.key || "",
    fieldLabel: fields[0]?.label || "",
    gradFrom: "#2563EB",
    gradTo: "#14B8A6",
    demandTone: defaultTone,
    displayOrder: nextOrder,
    recommendedFromAge: null,
    hollandCode: "",
    subjectKeys: [],
    strengthKeys: [],
    valueKeys: [],
    active: true,
    translations: {
        uz: createTranslationDraft("uz"),
        ru: createTranslationDraft("ru"),
        en: createTranslationDraft("en"),
    },
    courseIds: [],
});

export const cloneDraft = (profession: Profession): ProfessionDraft => ({
    id: profession.id,
    slug: profession.slug,
    emoji: profession.emoji,
    fieldKey: profession.fieldKey,
    fieldLabel: profession.fieldLabel,
    gradFrom: profession.gradFrom,
    gradTo: profession.gradTo,
    demandTone: profession.demandTone,
    displayOrder: profession.displayOrder,
    recommendedFromAge: profession.recommendedFromAge ?? null,
    hollandCode: profession.hollandCode ?? "",
    subjectKeys: profession.subjectKeys ?? [],
    strengthKeys: profession.strengthKeys ?? [],
    valueKeys: profession.valueKeys ?? [],
    active: profession.active,
    translations: {
        uz: profession.translations.find((item) => item.languageCode === "uz") || createTranslationDraft("uz"),
        ru: profession.translations.find((item) => item.languageCode === "ru") || createTranslationDraft("ru"),
        en: profession.translations.find((item) => item.languageCode === "en") || createTranslationDraft("en"),
    },
    courseIds: profession.courses.map((course) => course.id),
});

export const sortByOrder = (items: Profession[]) =>
    [...items].sort((left, right) => {
        if (left.displayOrder !== right.displayOrder) {
            return left.displayOrder - right.displayOrder;
        }
        return left.slug.localeCompare(right.slug);
    });

export const isTranslationComplete = (translation: ProfessionTranslation) =>
    Boolean(
        translation.title.trim()
        && translation.tagline.trim()
        && translation.description.trim()
        && translation.demandLabel.trim()
        && translation.durationLabel.trim()
        && translation.levelLabel.trim()
        && translation.skills.length > 0
        && translation.roles.length > 0,
    );

export const isTranslationEmpty = (translation: ProfessionTranslation) =>
    !translation.title.trim()
    && !translation.tagline.trim()
    && !translation.description.trim()
    && !translation.demandLabel.trim()
    && !translation.durationLabel.trim()
    && !translation.levelLabel.trim()
    && translation.skills.length === 0
    && translation.roles.length === 0;

export const getFieldMeta = (fields: FieldOption[], fieldKey: string): FieldOption =>
    fields.find((field) => field.key === fieldKey)
        || fields[0]
        || {key: fieldKey, label: fieldKey, helper: "", toneHint: ""};

export const getToneMeta = (tone: ProfessionDemandTone) =>
    toneOptions.find((option) => option.value === tone) || toneOptions[1];

export const getTranslation = (profession: Profession, languageCode: SupportedLanguage) =>
    profession.translations.find((item) => item.languageCode === languageCode) || createTranslationDraft(languageCode);

export const getTranslationStatusLabel = (translation: ProfessionTranslation) =>
    isTranslationComplete(translation) ? "✓ to'liq" : isTranslationEmpty(translation) ? "bo'sh" : "qisman";

export const normalizeSlug = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

/** Kasbga moslik profili uchun tanlovlar (backend ProfessionFit bilan bir xil kalitlar). */
export const HOLLAND_LETTERS: Array<{ key: string; label: string }> = [
    { key: "R", label: "R — Qo'l mehnati" },
    { key: "I", label: "I — Tadqiqot" },
    { key: "A", label: "A — Ijod" },
    { key: "S", label: "S — Odamlarga yordam" },
    { key: "E", label: "E — Yetakchilik" },
    { key: "C", label: "C — Tartib" },
];

export const SUBJECT_OPTIONS: Array<{ key: string; label: string }> = [
    { key: "subject.biology", label: "🧬 Biologiya" },
    { key: "subject.chemistry", label: "⚗️ Kimyo" },
    { key: "subject.physics", label: "🧲 Fizika" },
    { key: "subject.math", label: "➗ Matematika" },
    { key: "subject.languages", label: "🗣️ Chet tillari" },
    { key: "subject.history", label: "📜 Tarix" },
    { key: "subject.informatics", label: "💻 Informatika" },
    { key: "subject.economics", label: "📈 Iqtisod" },
    { key: "subject.geography", label: "🌍 Geografiya" },
    { key: "subject.literature", label: "📖 Ona tili va adabiyot" },
    { key: "field.medicine", label: "🩺 Tibbiyot" },
    { key: "field.engineering", label: "🏗️ Muhandislik" },
    { key: "field.it", label: "👩‍💻 IT" },
    { key: "field.law", label: "⚖️ Huquq" },
    { key: "field.business", label: "💼 Biznes" },
    { key: "field.education", label: "👩‍🏫 Ta'lim" },
    { key: "field.arts", label: "🎨 San'at va dizayn" },
    { key: "field.science", label: "🔬 Ilm-fan" },
];

export const STRENGTH_OPTIONS: Array<{ key: string; label: string }> = [
    { key: "strength.logic", label: "Mantiqiy fikrlash" },
    { key: "strength.creativity", label: "Ijodkorlik" },
    { key: "strength.communication", label: "Muloqot" },
    { key: "strength.teamwork", label: "Jamoada ishlash" },
    { key: "strength.independence", label: "Mustaqillik" },
    { key: "strength.focus", label: "Diqqat va sabr" },
];

export const VALUE_OPTIONS: Array<{ key: string; label: string }> = [
    { key: "value.help", label: "Odamlarga foyda" },
    { key: "value.creativity", label: "Yangi narsa yaratish" },
    { key: "value.money", label: "Moddiy farovonlik" },
    { key: "value.independence", label: "Erkinlik" },
    { key: "value.recognition", label: "Tan olinish" },
    { key: "value.stability", label: "Barqarorlik" },
];
