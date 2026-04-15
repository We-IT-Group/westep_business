import apiClient from "../apiClient.ts";
import {AxiosError} from "axios";

export type TeamRole = "TEACHER" | "ASSISTANT";

export interface BusinessMember {
    id: string;
    fullName: string;
    phone: string;
    role: string;
}

type BusinessMembersResponse =
    | BusinessMember[]
    | {
    data?: BusinessMember[];
    members?: BusinessMember[];
    content?: BusinessMember[];
    items?: BusinessMember[];
    assistants?: Record<string, string>;
    teachers?: Record<string, string>;
};

const mapRoleRecord = (record: Record<string, string>, role: TeamRole): BusinessMember[] =>
    Object.entries(record).map(([id, fullName]) => ({
        id,
        fullName,
        phone: "",
        role,
    }));

interface TeacherPayload {
    businessId: string;
    ownerId: string;
    teacherPhone: string;
}

interface AssistantPayload {
    businessId: string;
    ownerId: string;
    assistantPhone: string;
}

export const addBusinessTeacher = async (body: TeacherPayload) => {
    try {
        const {data} = await apiClient.post("/business/teacher/add/" + body.businessId, {}, {
            params: {
                ownerId: body.ownerId,
                teacherPhone: body.teacherPhone,
            }
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};

export const addBusinessAssistant = async (body: AssistantPayload) => {
    try {
        const {data} = await apiClient.post("/business/assistant/add/" + body.businessId, {}, {
            params: {
                ownerId: body.ownerId,
                assistantPhone: body.assistantPhone
            }
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};


export const deleteBusinessAssistant = async (body: AssistantPayload) => {
    try {
        const {data} = await apiClient.delete("/business/assistant/remove/" + body.businessId, {
            params: {
                ownerId: body.ownerId,
                assistantPhone: body.assistantPhone,
            }
        });
        return data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        const message = err.response?.data?.message;
        throw new Error(message);
    }
};


export const getUsersById = async (id: string) => {
    const {data} = await apiClient.get<BusinessMembersResponse>("/business/members/" + id);

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.members)) {
        return data.members;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    const teachers = data?.teachers ? mapRoleRecord(data.teachers, "TEACHER") : [];
    const assistants = data?.assistants ? mapRoleRecord(data.assistants, "ASSISTANT") : [];

    if (teachers.length || assistants.length) {
        return [...teachers, ...assistants];
    }

    return [];
};
