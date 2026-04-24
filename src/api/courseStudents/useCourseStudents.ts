import {useQuery} from "@tanstack/react-query";
import {getItem} from "../../utils/utils.ts";
import {getCourseStudents} from "./courseStudentsApi.ts";

export const useCourseStudents = (courseId?: string) =>
    useQuery({
        queryKey: ["course-students", courseId],
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            if (!courseId) throw new Error("No courseId");
            return await getCourseStudents(courseId);
        },
        enabled: !!courseId,
        retry: false,
    });
