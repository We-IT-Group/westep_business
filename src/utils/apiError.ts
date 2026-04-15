import { AxiosError } from "axios";

export interface ApiErrorPayload {
    message?: string;
    error?: string;
    details?: string;
}

export class ApiRequestError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
    }
}

export const parseApiError = (error: unknown, fallback = "Xatolik yuz berdi.") => {
    if (error instanceof ApiRequestError) {
        return error;
    }

    if (error instanceof AxiosError) {
        const payload = error.response?.data as ApiErrorPayload | undefined;
        const message =
            payload?.message ||
            payload?.error ||
            payload?.details ||
            error.message ||
            fallback;

        return new ApiRequestError(message, error.response?.status);
    }

    if (error instanceof Error) {
        return new ApiRequestError(error.message || fallback);
    }

    return new ApiRequestError(fallback);
};

export const isUnauthorizedError = (error: unknown) =>
    parseApiError(error).status === 401;

export const isBadRequestError = (error: unknown) =>
    parseApiError(error).status === 400;
