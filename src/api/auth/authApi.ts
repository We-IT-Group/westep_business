// src/api/filesApi.ts
import apiClient from "../apiClient";
import {getItem, setItem} from "../../utils/utils.ts";
import {BusinessType} from "../../types/types.ts";
import {parseApiError} from "../../utils/apiError.ts";


export const login = async (body: { phone: string; password: string }) => {
    try {
        const {data} = await apiClient.post("/auth/login", {}, {
            params: {
                phone: body.phone,
                password: body.password,
            }
        });
        setItem<string>("accessToken", data?.accessToken)
        setItem<string>("refreshToken", data?.refreshToken)
        return data
    } catch (error) {
        throw parseApiError(error, "Login amalga oshmadi.");
    }
};

export const register = async (body: BusinessType) => {
    try {
        const response = await apiClient.post("/business/register", body);
        return response;
    } catch (error) {
        throw parseApiError(error, "Ro'yxatdan o'tib bo'lmadi.");
    }
};

export const getCurrentUser = async () => {
    const {data} = await apiClient.get("/user/me");
    return data;
};

export const checkPhoneNumber = async ({phone}: { phone: string }) => {
    const {data} = await apiClient.post("/auth/check-phone", {phone});
    if (data.status === "NOT_FOUND") {
        throw new Error(data.message);
    }
};

export const logout = async () => {
    const refreshToken: string | null = getItem<string>("refreshToken");
    await apiClient.post("/auth/logout", refreshToken, {
        headers: {
            "Content-Type": "text/plain"
        }
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};


export const sendOtpCode = async (body: { phoneNumber: string, type: string }) => {
    try {
        await apiClient.post("/sms/send", {
            phone: body.phoneNumber,
            type: body.type,
        });
    } catch (error) {
        throw parseApiError(error, "SMS kod yuborilmadi.");
    }
};
export const verifyCode = async (body: { phoneNumber: string, code: string, type: string }) => {
    try {
        await apiClient.post("/sms/verify", {
            phone: body.phoneNumber,
            code: body.code,
            type: body.type,
        });
    } catch (error) {
        throw parseApiError(error, "Kod tasdiqlanmadi.");
    }
};
export const resetPassword = async (body: { phoneNumber: string, password: string }) => {
    try {
        await apiClient.post("/auth/reset-password",{},{
            params:{
                phone: body.phoneNumber,
                newPassword: body.password,
            }
        });
    } catch (error) {
        throw parseApiError(error, "Parol yangilanmadi.");
    }
};
