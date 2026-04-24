import {useQuery} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getTeacherProfileMe} from "./teacherProfileApi.ts";

export const useTeacherProfileMe = (enabled = true) =>
    useQuery({
        queryKey: ["teacher-profile", "me"],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getTeacherProfileMe();
        },
        enabled,
        retry: false,
    });
