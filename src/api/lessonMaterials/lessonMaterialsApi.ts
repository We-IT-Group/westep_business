import {AxiosError} from "axios";
import apiClient from "../apiClient.ts";

export type LessonMaterialPayload = {
    lessonId: string;
    title?: string;
    description?: string;
    links?: string[];
    files?: File[];
};

export type LessonHomeworkPayload = LessonMaterialPayload & {
    maxScore?: number;
};

const appendOptionalText = (formData: FormData, key: string, value?: string | number) => {
    if (value === undefined || value === null) return;

    const normalizedValue = typeof value === "number" ? String(value) : value.trim();

    if (!normalizedValue) return;
    formData.append(key, normalizedValue);
};

const appendFiles = (formData: FormData, files?: File[]) => {
    files?.forEach((file) => {
        formData.append("file", file);
        formData.append("files", file);
    });
};

const appendLinks = (formData: FormData, links?: string[]) => {
    links?.forEach((link) => {
        const normalizedLink = link.trim();
        if (normalizedLink) {
            formData.append("link", normalizedLink);
            formData.append("links", normalizedLink);
        }
    });
};

export const createLessonHomework = async ({
    lessonId,
    title,
    description,
    maxScore,
    links,
    files,
}: LessonHomeworkPayload) => {
    try {
        const formData = new FormData();

        appendOptionalText(formData, "title", title);
        appendOptionalText(formData, "description", description);
        appendOptionalText(formData, "maxScore", maxScore);
        appendLinks(formData, links);
        appendFiles(formData, files);

        const {data} = await apiClient.post(
            `/lesson-homework/lesson/${lessonId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        const message = err.response?.data?.message || "Homework yaratishda xatolik yuz berdi.";
        throw new Error(message);
    }
};

export const createLessonResource = async ({
    lessonId,
    title,
    description,
    links,
    files,
}: LessonMaterialPayload) => {
    try {
        const formData = new FormData();

        appendOptionalText(formData, "title", title);
        appendOptionalText(formData, "description", description);
        appendLinks(formData, links);
        appendFiles(formData, files);

        const {data} = await apiClient.post(
            `/lesson-tasks/lesson/${lessonId}/resources`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return data;
    } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        const message = err.response?.data?.message || "Resource yaratishda xatolik yuz berdi.";
        throw new Error(message);
    }
};
