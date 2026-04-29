import apiClient from "../apiClient.ts";
import {parseApiError} from "../../utils/apiError.ts";


export const addFile = async (body: FormData) => {
    try {
        const {data} = await apiClient.post("/attachments/upload", body, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return data;
    } catch (error) {
        throw parseApiError(error, "Fayl yuklab bo'lmadi.");
    }
};


export const deleteFile = async (id: string) => {
    try {
        await apiClient.delete("/attachments/" + id);
    } catch (error) {
        throw parseApiError(error, "Faylni o'chirib bo'lmadi.");
    }
};

export const getFileById = async (id: string | undefined) => {
    try {
        const {data} = await apiClient.get("/attachments/download/" + id, {
            responseType: "blob",
        });
        return data;
    } catch (error) {
        throw parseApiError(error, "Fayl yuklanmadi.");
    }
};
