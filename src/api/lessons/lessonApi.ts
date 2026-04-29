import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";
import {Lesson} from "../../types/types.ts";
import {getVideoByLessonId} from "../vedio/vedioApi.ts";

type addLesson = Pick<Lesson,
    | "name"
    | "description"
    | "moduleId"
    | "id"
    | "type"
    | "orderIndex"
    | "estimatedDuration"
    | "watchCompletionPercent"
    | "videoUrl"
    | "active"
>

type UpdateLessonBody = addLesson & {
    removeVideo?: boolean;
};

type CreateLessonBody = Omit<addLesson, "id">;
export const addLessons = async (payload: { body: CreateLessonBody, courseId?: string }) => {
    try {
        const data = await apiClient.post("/lesson/create", payload.body);
        return {...payload.body, id: data.data.id}
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Lesson yaratib bo'lmadi";
        throw new Error(message);
    }
};

export const updateLessons = async (payload: { body: UpdateLessonBody, courseId?: string }) => {
    try {
        await apiClient.put("/lesson/update/" + payload.body.id, {
            ...payload.body,
            removeVideo: payload.body.removeVideo ?? false,
        });
        return {moduleId: payload.body.moduleId, courseId: payload.courseId};
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Lessonni yangilab bo'lmadi";
        throw new Error(message);
    }
};

export const deleteLessons = async (id: string) => {
    try {
        await apiClient.delete("/lesson/" + id);
        return
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Lessonni o'chirib bo'lmadi";
        throw new Error(message);
    }
};


export const getAllLessons = async (courseId: string | undefined) => {
    try {
        const {data} = await apiClient.get("/lesson/module/" + courseId);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Lessonlar yuklanmadi";
        throw new Error(message);
    }
};

export const getLessonsById = async (id: string | undefined) => {
    try {
        const {data} = await apiClient.get("/lesson/" + id);
        const video = await getVideoByLessonId(id).catch(() => []);
        const newData = {
            ...data,
            videoUrl: data.videoUrl ?? data.vedioUrl ?? video[0]?.storagePath ?? "",
            vedioUrl: data.videoUrl ?? data.vedioUrl ?? video[0]?.storagePath ?? "",
        }

        return newData;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Lesson ma'lumotlari yuklanmadi";
        throw new Error(message);
    }
};
