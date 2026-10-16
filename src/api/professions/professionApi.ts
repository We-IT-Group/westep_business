import apiClient from "../apiClient.ts";
import type {
    Profession,
    ProfessionCourseLink,
    ProfessionDemandTone,
    ProfessionField,
    ProfessionTranslation,
    SupportedLanguage,
} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

export type ProfessionTranslationPayload = ProfessionTranslation;

export type ProfessionCreateRequest = {
    slug: string;
    emoji: string;
    fieldKey: string;
    gradFrom: string;
    gradTo: string;
    demand: string;
    demandTone: ProfessionDemandTone;
    duration: string;
    level: string;
    displayOrder?: number;
    recommendedFromAge?: number | null;
    hollandCode?: string | null;
    strengthKeys?: string[];
    valueKeys?: string[];
    translations: ProfessionTranslationPayload[];
};

export type ProfessionUpdateRequest = ProfessionCreateRequest & {
    id: string;
};

export type ProfessionCourseLinkPayload = {
    courseId: string;
    displayOrder?: number;
};

export type ProfessionCoursesSyncRequest = {
    id: string;
    desiredCourseIds: string[];
    currentCourseIds: string[];
};

export type ProfessionCourseReorderRequest = {
    courseIds: string[];
};

const supportedLanguages: SupportedLanguage[] = ["uz", "ru", "en"];

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? value as Record<string, unknown> : null;

const asString = (value: unknown, fallback = "") =>
    typeof value === "string" && value.trim() ? value : fallback;

const asNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const asStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => asString(item))
        .filter(Boolean);
};

const extractList = (response: unknown): unknown[] => {
    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    const record = asRecord(response);
    if (!record) {
        return [];
    }

    if (Array.isArray(record.content)) {
        return record.content;
    }

    if (Array.isArray(record.items)) {
        return record.items;
    }

    if (Array.isArray(record.professions)) {
        return record.professions;
    }

    if (record.data && record.data !== response) {
        return extractList(record.data);
    }

    return [];
};

const normalizeTranslation = (value: unknown): ProfessionTranslation | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const languageCode = asString(record.languageCode).toLowerCase() as SupportedLanguage;
    if (!supportedLanguages.includes(languageCode)) {
        return null;
    }

    return {
        languageCode,
        title: asString(record.title),
        tagline: asString(record.tagline),
        description: asString(record.description),
        demandLabel: asString(record.demandLabel),
        durationLabel: asString(record.durationLabel),
        levelLabel: asString(record.levelLabel),
        skills: asStringArray(record.skills),
        roles: asStringArray(record.roles),
    };
};

const normalizeCourse = (value: unknown): ProfessionCourseLink | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const id = asString(record.id || record.courseId);
    if (!id) {
        return null;
    }

    return {
        id,
        name: asString(record.name || record.courseName || record.title || "Kurs"),
    };
};

const normalizeGrad = (record: Record<string, unknown>): {from: string; to: string} => {
    const grad = asRecord(record.grad);
    if (grad) {
        return {
            from: asString(grad.from),
            to: asString(grad.to),
        };
    }
    return {
        from: asString(record.gradFrom),
        to: asString(record.gradTo),
    };
};

const normalizeProfession = (value: unknown): Profession | null => {
    const record = asRecord(value);
    if (!record || typeof record.id !== "string") {
        return null;
    }

    const translationsSource = (
        Array.isArray(record.translations)
            ? record.translations
            : Array.isArray((record as {translationList?: unknown}).translationList)
                ? (record as {translationList?: unknown}).translationList
                : Array.isArray((record as {localizedTranslations?: unknown}).localizedTranslations)
                    ? (record as {localizedTranslations?: unknown}).localizedTranslations
                    : []
    ) as unknown[];

    const coursesSource = (
        Array.isArray(record.courses)
            ? record.courses
            : Array.isArray((record as {courseList?: unknown}).courseList)
                ? (record as {courseList?: unknown}).courseList
                : []
    ) as unknown[];

    const grad = normalizeGrad(record);

    return {
        id: record.id,
        slug: asString(record.slug),
        emoji: asString(record.emoji, "💼"),
        fieldKey: asString(record.fieldKey),
        fieldLabel: asString((record as {fieldLabel?: unknown}).fieldLabel || record.fieldKey),
        gradFrom: grad.from,
        gradTo: grad.to,
        demand: asString(record.demand),
        demandTone: (asString(record.demandTone, "MEDIUM").toUpperCase() as ProfessionDemandTone),
        duration: asString(record.duration),
        level: asString(record.level),
        displayOrder: asNumber(record.displayOrder),
        recommendedFromAge: typeof record.recommendedFromAge === "number" ? record.recommendedFromAge : null,
        hollandCode: typeof record.hollandCode === "string" ? record.hollandCode : null,
        strengthKeys: Array.isArray(record.strengthKeys) ? (record.strengthKeys as string[]) : [],
        valueKeys: Array.isArray(record.valueKeys) ? (record.valueKeys as string[]) : [],
        active: Boolean(record.active ?? true),
        deleted: Boolean(record.deleted),
        translations: translationsSource.map(normalizeTranslation).filter((item): item is ProfessionTranslation => Boolean(item)),
        courses: coursesSource.map(normalizeCourse).filter((item): item is ProfessionCourseLink => Boolean(item)),
        createdAt: asString(record.createdAt),
        updatedAt: asString(record.updatedAt),
    };
};

const unwrapProfession = (data: unknown): Profession | null =>
    normalizeProfession(data) || normalizeProfession(asRecord(data)?.data) || null;

const normalizeProfessionList = (response: unknown) =>
    extractList(response)
        .map((item) => normalizeProfession(item))
        .filter((item): item is Profession => Boolean(item));

const normalizeField = (value: unknown): ProfessionField | null => {
    const record = asRecord(value);
    if (!record) {
        return null;
    }

    const key = asString(record.fieldKey || record.key);
    if (!key) {
        return null;
    }

    const translations = Array.isArray(record.translations) ? record.translations : [];
    const uzTranslation = translations
        .map(asRecord)
        .find((item) => item && asString(item.languageCode).toLowerCase() === "uz");
    const anyTranslation = translations
        .map(asRecord)
        .find((item) => item && asString(item.label));

    const label = asString(
        (uzTranslation && uzTranslation.label)
        || (anyTranslation && anyTranslation.label)
        || (record as {label?: unknown}).label,
        key,
    );

    return {
        key,
        label,
    };
};

const normalizeFieldList = (response: unknown): ProfessionField[] =>
    extractList(response)
        .map((item) => normalizeField(item))
        .filter((item): item is ProfessionField => Boolean(item));

export const getProfessions = async () => {
    try {
        const {data} = await apiClient.get("/manage/professions");
        return normalizeProfessionList(data);
    } catch (error) {
        throw parseApiError(error, "Kasblar yuklanmadi.");
    }
};

export const getProfessionById = async (id: string) => {
    try {
        const {data} = await apiClient.get(`/manage/professions/${id}`);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Kasb ma'lumotlari yuklanmadi.");
    }
};

export const createProfession = async (body: ProfessionCreateRequest) => {
    try {
        const {data} = await apiClient.post("/manage/professions", body);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Kasb qo'shib bo'lmadi.");
    }
};

export const updateProfession = async (body: ProfessionUpdateRequest) => {
    try {
        const {id, ...payload} = body;
        const {data} = await apiClient.put(`/manage/professions/${id}`, payload);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Kasbni yangilab bo'lmadi.");
    }
};

export const deleteProfession = async (id: string) => {
    try {
        await apiClient.delete(`/manage/professions/${id}`);
    } catch (error) {
        throw parseApiError(error, "Kasbni yashirib bo'lmadi.");
    }
};

export const setProfessionActive = async (id: string, active: boolean) => {
    try {
        const {data} = await apiClient.put(`/manage/professions/${id}/active`, {active});
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Holatni o'zgartirib bo'lmadi.");
    }
};

export const saveProfessionTranslation = async (id: string, body: ProfessionTranslationPayload) => {
    try {
        const {data} = await apiClient.post(`/manage/professions/${id}/translations`, body);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Tarjimani saqlab bo'lmadi.");
    }
};

export const deleteProfessionTranslation = async (id: string, languageCode: SupportedLanguage) => {
    try {
        const {data} = await apiClient.delete(`/manage/professions/${id}/translations/${languageCode}`);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Tarjimani o'chirib bo'lmadi.");
    }
};

export const bindProfessionCourse = async (id: string, body: ProfessionCourseLinkPayload) => {
    try {
        const {data} = await apiClient.post(`/manage/professions/${id}/courses`, body);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Kursni biriktirib bo'lmadi.");
    }
};

export const unbindProfessionCourse = async (id: string, courseId: string) => {
    try {
        const {data} = await apiClient.delete(`/manage/professions/${id}/courses/${courseId}`);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Kursni uzib bo'lmadi.");
    }
};

export const reorderProfessionCourses = async (id: string, body: ProfessionCourseReorderRequest) => {
    try {
        const {data} = await apiClient.put(`/manage/professions/${id}/courses/reorder`, body);
        return unwrapProfession(data);
    } catch (error) {
        throw parseApiError(error, "Kurslar tartibini yangilab bo'lmadi.");
    }
};

export const syncProfessionCourses = async ({id, desiredCourseIds, currentCourseIds}: ProfessionCoursesSyncRequest) => {
    const desired = Array.from(new Set(desiredCourseIds.filter(Boolean)));
    const current = new Set(currentCourseIds.filter(Boolean));
    const desiredSet = new Set(desired);

    const toAdd = desired.filter((courseId) => !current.has(courseId));
    const toRemove = Array.from(current).filter((courseId) => !desiredSet.has(courseId));

    let last: Profession | null = null;

    for (const courseId of toRemove) {
        last = await unbindProfessionCourse(id, courseId);
    }

    for (let index = 0; index < toAdd.length; index++) {
        last = await bindProfessionCourse(id, {
            courseId: toAdd[index],
            displayOrder: current.size + index + 1,
        });
    }

    const shouldReorder = desired.length > 0 && (
        toAdd.length > 0
        || toRemove.length > 0
        || desired.some((courseId, index) => currentCourseIds[index] !== courseId)
    );

    if (shouldReorder) {
        last = await reorderProfessionCourses(id, {courseIds: desired});
    }

    return last;
};

export const getProfessionFields = async () => {
    try {
        const {data} = await apiClient.get("/manage/profession-fields");
        return normalizeFieldList(data);
    } catch (error) {
        throw parseApiError(error, "Sohalar yuklanmadi.");
    }
};
