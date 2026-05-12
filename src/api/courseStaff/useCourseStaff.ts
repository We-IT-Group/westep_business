import {useQuery} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getCourseStaff} from "./courseStaffApi.ts";

export const useCourseStaff = (courseId?: string, enabled = true) =>
    useQuery({
        queryKey: ["course-staff", courseId],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            if (!courseId) throw new Error("No courseId");
            return await getCourseStaff(courseId);
        },
        enabled: enabled && !!courseId,
        retry: false,
    });
