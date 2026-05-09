import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getMyCourses, getBusinessCourses, getInactiveBusinessCourses, addCourses, updateCourse, deleteCourse, getCourseById, patchCourseActive} from "./courseApi.ts";
import {useNavigate} from "react-router-dom";
import {getItem} from "../../utils/utils.ts";
import {showErrorToast} from "../../utils/toast.tsx";
import {Course} from "../../types/types.ts";
import {ApiRequestError} from "../../utils/apiError.ts";

type CourseQuerySnapshot = [readonly unknown[], Course[] | undefined];
const coursesKey = ["courses"] as const;
const myCoursesKey = [...coursesKey, "my"] as const;
const businessCoursesKey = [...coursesKey, "business"] as const;
const inactiveCoursesKey = [...coursesKey, "inactive"] as const;
const courseDetailKey = (id: string | undefined) => [...coursesKey, "detail", id] as const;
const courseListKeys = [myCoursesKey, businessCoursesKey, inactiveCoursesKey] as const;

export const useGetMyCourses = (enabled = true) =>
    useQuery({
        queryKey: myCoursesKey,
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getMyCourses();
        },
        retry: false,
        enabled,
    });

export const useGetBusinessCourses = (enabled = true) =>
    useQuery({
        queryKey: businessCoursesKey,
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getBusinessCourses();
        },
        retry: false,
        enabled,
    });

export const useGetInactiveBusinessCourses = (enabled = true) =>
    useQuery({
        queryKey: inactiveCoursesKey,
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getInactiveBusinessCourses();
        },
        retry: false,
        enabled,
    });

export const useGetCourseById = (id: string | undefined) =>
    useQuery({
        queryKey: courseDetailKey(id),
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getCourseById(id);
        },
        enabled: !!id,
        retry: false,
    });

export const useAddCourse = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addCourses,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: coursesKey});
        },
        onError: (error) => {
            showErrorToast(error, "Kurs qo'shib bo'lmadi");
        },
    });
};

export const useUpdateCourse = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCourse,
        onSuccess: async (_data, variables) => {
            await qc.invalidateQueries({queryKey: coursesKey});
            await qc.invalidateQueries({queryKey: courseDetailKey(variables.id)});
        },
        onError: (error) => {
            showErrorToast(error, "Kursni yangilab bo'lmadi");
        },
    });
};

export const usePatchCourseActive = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, value}: { id: string, value: boolean, source?: "my" | "business" | "inactive" }) => patchCourseActive(id, value),
        onMutate: async ({id, value, source}) => {
            await qc.cancelQueries({queryKey: coursesKey});
            await qc.cancelQueries({queryKey: courseDetailKey(id)});

            const previousQueries = courseListKeys.map((queryKey) => (
                [queryKey, qc.getQueryData<Course[]>(queryKey)] as CourseQuerySnapshot
            ));
            const previousDetail = qc.getQueryData<Course>(courseDetailKey(id));
            const targetCourse = previousQueries
                .flatMap(([, courses]) => courses || [])
                .find((course) => course.id === id);
            const detailCourse = previousDetail || targetCourse;

            if (detailCourse) {
                qc.setQueryData(courseDetailKey(id), {...detailCourse, active: value});
            }

            previousQueries.forEach(([queryKey, courses]) => {
                if (!Array.isArray(courses)) {
                    return;
                }

                const updatedCourse = targetCourse ? {...targetCourse, active: value} : undefined;
                const hasCourse = courses.some((course) => course.id === id);

                let nextCourses = courses.map((course) =>
                    course.id === id ? {...course, active: value} : course
                );

                const querySource = queryKey[1];

                if (querySource === "inactive") {
                    if (source === "inactive" && value) {
                        nextCourses = nextCourses.filter((course) => course.id !== id);
                    } else if ((source === "business" || source === "my") && !value && !hasCourse && updatedCourse) {
                        nextCourses = [updatedCourse, ...nextCourses];
                    }
                }

                if (querySource === "business") {
                    if (source === "inactive" && value && !hasCourse && updatedCourse) {
                        nextCourses = [updatedCourse, ...nextCourses];
                    }
                }

                qc.setQueryData(queryKey, nextCourses);
            });

            return {previousQueries, previousDetail};
        },
        onSuccess: async (_data, variables) => {
            const detailCourse = qc.getQueryData<Course>(courseDetailKey(variables.id));

            if (detailCourse) {
                qc.setQueryData(courseDetailKey(variables.id), {
                    ...detailCourse,
                    active: variables.value,
                });
            }
        },
        onError: (error, variables, context) => {
            context?.previousQueries?.forEach(([queryKey, courses]) => {
                qc.setQueryData(queryKey, courses);
            });

            if (context?.previousDetail) {
                qc.setQueryData(courseDetailKey(context.previousDetail.id), context.previousDetail);
            }

            if (variables.value) {
                showErrorToast(
                    new ApiRequestError("Kurs active qilish uchun kamida bitta active darsi bo'lishi kerak."),
                    "Kursni active qilib bo'lmadi",
                );
                return;
            }

            showErrorToast(error, "Kurs holatini o'zgartirib bo'lmadi");
        },
    });
};

export const useDeleteCourse = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCourse,
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: coursesKey});
            navigate("/");
        },
        onError: (error) => {
            showErrorToast(error, "Kursni o'chirib bo'lmadi");
        },
    });
};
