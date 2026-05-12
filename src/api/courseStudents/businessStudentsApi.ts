import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";
import type {BusinessStudentOverview} from "../../types/types.ts";

export type BusinessStudentCreatePayload = {
    phone: string;
    firstName: string;
    lastName: string;
};

export type BusinessStudentCreateResponse = {
    id: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: string;
    businessId: string;
    temporaryPassword: string;
};

export const createBusinessStudent = async (body: BusinessStudentCreatePayload) => {
    try {
        const {data} = await apiClient.post<BusinessStudentCreateResponse>("/business/students", body);
        return data;
    } catch (error) {
        throw parseApiError(error, "Student qo‘shib bo‘lmadi.");
    }
};

export const getBusinessStudents = async () => {
    try {
        const {data} = await apiClient.get<BusinessStudentOverview[]>("/business/students");
        return data;
    } catch (error) {
        throw parseApiError(error, "Studentlar ro‘yxati yuklanmadi.");
    }
};
