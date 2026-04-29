import {useQuery} from "@tanstack/react-query";
import {
    getCourseLanguages,
    getTaxonomyCategories,
    getTaxonomySkillTags,
    getTaxonomySubcategories,
} from "./taxonomyApi.ts";

const taxonomyKey = ["taxonomy"] as const;

export const useTaxonomyCategories = () =>
    useQuery({
        queryKey: [...taxonomyKey, "categories"],
        queryFn: getTaxonomyCategories,
        retry: false,
    });

export const useTaxonomySubcategories = () =>
    useQuery({
        queryKey: [...taxonomyKey, "subcategories"],
        queryFn: getTaxonomySubcategories,
        retry: false,
    });

export const useTaxonomySkillTags = () =>
    useQuery({
        queryKey: [...taxonomyKey, "skill-tags"],
        queryFn: getTaxonomySkillTags,
        retry: false,
    });

export const useCourseLanguages = () =>
    useQuery({
        queryKey: [...taxonomyKey, "course-languages"],
        queryFn: getCourseLanguages,
        retry: false,
    });
