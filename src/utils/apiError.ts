import {AxiosError} from "axios";
import type {ApiErrorResponse} from "../types/types.ts";

export interface ApiErrorPayload {
    message?: string;
    error?: string;
    details?: unknown;
}

export class ApiRequestError extends Error {
    status?: number;
    details?: unknown;

    constructor(message: string, status?: number, details?: unknown) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
        this.details = details;
    }
}

export const parseApiError = (error: unknown, fallback = "Xatolik yuz berdi.") => {
    if (error instanceof ApiRequestError) {
        return error;
    }

    if (error instanceof AxiosError) {
        const payload = error.response?.data as ApiErrorResponse<unknown> | ApiErrorPayload | undefined;
        const message =
            payload?.message ||
            payload?.error ||
            error.message ||
            fallback;

        return new ApiRequestError(message, error.response?.status, payload?.details);
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
