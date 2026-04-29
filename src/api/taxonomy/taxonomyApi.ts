import apiClient from "../apiClient.ts";
import {TaxonomyOption} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

type TaxonomyRecord = {
    id?: unknown;
    uuid?: unknown;
    name?: unknown;
    title?: unknown;
    code?: unknown;
    parentId?: unknown;
    categoryId?: unknown;
    primaryCategoryId?: unknown;
};

type TaxonomyResponse =
    | unknown[]
    | {
        content?: unknown;
        data?: unknown;
        items?: unknown;
        categories?: unknown;
        subcategories?: unknown;
        skillTags?: unknown;
        languages?: unknown;
    };

const asRecord = (value: unknown): TaxonomyRecord | null => (
    value && typeof value === "object" ? value as TaxonomyRecord : null
);

const asString = (value: unknown): string => (
    typeof value === "string" ? value : ""
);

const normalizeOption = (value: unknown): TaxonomyOption | null => {
    const record = asRecord(value);
    if (!record) return null;

    const id = asString(record.id) || asString(record.uuid);
    const name = asString(record.name) || asString(record.title);

    if (!id || !name) return null;

    return {
        id,
        name,
        code: asString(record.code) || undefined,
        parentId: asString(record.parentId) || undefined,
        categoryId: asString(record.categoryId) || asString(record.primaryCategoryId) || undefined,
    };
};

const extractList = (response: TaxonomyResponse | undefined): unknown[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;

    const candidates = [
        response.content,
        response.data,
        response.items,
        response.categories,
        response.subcategories,
        response.skillTags,
        response.languages,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
        if (candidate && candidate !== response && typeof candidate === "object") {
            const nested = extractList(candidate as TaxonomyResponse);
            if (nested.length) return nested;
        }
    }

    return [];
};

const normalizeList = (response: TaxonomyResponse | undefined): TaxonomyOption[] => (
    extractList(response)
        .map((item) => normalizeOption(item))
        .filter((item): item is TaxonomyOption => Boolean(item))
);

export const getTaxonomyCategories = async () => {
    try {
        const {data} = await apiClient.get("/taxonomy/categories");
        return normalizeList(data);
    } catch (error) {
        throw parseApiError(error, "Kategoriyalar yuklanmadi.");
    }
};

export const getTaxonomySubcategories = async () => {
    try {
        const {data} = await apiClient.get("/taxonomy/subcategories");
        return normalizeList(data);
    } catch (error) {
        throw parseApiError(error, "Subkategoriyalar yuklanmadi.");
    }
};

export const getTaxonomySkillTags = async () => {
    try {
        const {data} = await apiClient.get("/taxonomy/skill-tags");
        return normalizeList(data);
    } catch (error) {
        throw parseApiError(error, "Skill taglar yuklanmadi.");
    }
};

export const getCourseLanguages = async () => {
    try {
        const {data} = await apiClient.get("/taxonomy/course-languages");
        return normalizeList(data);
    } catch (error) {
        throw parseApiError(error, "Kurs tillari yuklanmadi.");
    }
};
