import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";
import {Module} from "../../types/types.ts";

type addModule = Pick<Module, "name" | "description" | "courseId" | "id" | "orderIndex" | "price" | "active">

export const addModules = async (body: Omit<addModule, "id">) => {
    try {
        await apiClient.post("/module", body);
        return body.courseId;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Modul qo'shib bo'lmadi";
        throw new Error(message);
    }
};

export const updateModules = async (body: addModule) => {
    try {
        await apiClient.put("/module/" + body.id, body);
        return body.courseId;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Modulni yangilab bo'lmadi";
        throw new Error(message);
    }
};

export const deleteModules = async (id: string) => {
    try {
        await apiClient.delete("/module/" + id);
        return id;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Modulni o'chirib bo'lmadi";
        throw new Error(message);
    }
};


export const getAllModules = async (courseId: string | undefined) => {
    try {
        const {data} = await apiClient.get("/module/course/" + courseId);
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message || "Modullar yuklanmadi";
        throw new Error(message);
    }
};

export const getModulesById = async (id: string | undefined) => {
    const {data} = await apiClient.get("/module/" + id);
    return data;
};
