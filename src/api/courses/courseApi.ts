import apiClient from "../apiClient.ts";
import {Course} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";

type addCourse = Pick<Course, "name" | "description" | "businessId" | "id" | "attachmentId">

export const addCourses = async (body: Omit<addCourse, "id">) => {
    try {
        await apiClient.post("/course", body);
    } catch (error) {
        throw parseApiError(error, "Kurs qo'shib bo'lmadi.");
    }
};

export const updateCourse = async (body: addCourse) => {
    try {
        await apiClient.put("/course/" + body.id, body);
    } catch (error) {
        throw parseApiError(error, "Kursni yangilab bo'lmadi.");
    }
};

export const deleteCourse = async (id: string) => {
    try {
        await apiClient.delete("/course/" + id);
    } catch (error) {
        throw parseApiError(error, "Kursni o'chirib bo'lmadi.");
    }
};


export const getAllCourses = async () => {
    try {
        const {data} = await apiClient.get("/course/get");
        return data;
    } catch (error) {
        throw parseApiError(error, "Kurslar yuklanmadi.");
    }
};

export const getCourseById = async (id: string | undefined) => {
    try {
        const {data} = await apiClient.get("/course/get/" + id);
        return data;
    } catch (error) {
        throw parseApiError(error, "Kurs ma'lumotlari yuklanmadi.");
    }
};
