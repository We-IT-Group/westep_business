import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {getMyCourses, getBusinessCourses, getArchivedBusinessCourses, addCourses, updateCourse, deleteCourse, getCourseById, patchCourseActive} from "./courseApi.ts";
import {useNavigate} from "react-router-dom";
import {getItem} from "../../utils/utils.ts";
import {showErrorToast} from "../../utils/toast.tsx";
import {Course} from "../../types/types.ts";

type CourseQuerySnapshot = [readonly unknown[], Course[] | undefined];
const coursesKey = ["courses"] as const;
const myCoursesKey = [...coursesKey, "my"] as const;
const businessCoursesKey = [...coursesKey, "business"] as const;
const archivedCoursesKey = [...coursesKey, "archived"] as const;
const courseDetailKey = (id: string | undefined) => [...coursesKey, "detail", id] as const;
const courseListKeys = [myCoursesKey, businessCoursesKey, archivedCoursesKey] as const;

export const useGetMyCourses = () =>
    useQuery({
        queryKey: myCoursesKey,
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getMyCourses();
        },
        retry: false,
    });

export const useGetBusinessCourses = () =>
    useQuery({
        queryKey: businessCoursesKey,
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getBusinessCourses();
        },
        retry: false,
    });

export const useGetArchivedBusinessCourses = () =>
    useQuery({
        queryKey: archivedCoursesKey,
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getArchivedBusinessCourses();
        },
        retry: false,
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
    const navigate = useNavigate();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCourse,
        onSuccess: async (_data, variables) => {
            await qc.invalidateQueries({queryKey: coursesKey});
            await qc.invalidateQueries({queryKey: courseDetailKey(variables.id)});
            navigate(0);
        },
        onError: (error) => {
            showErrorToast(error, "Kursni yangilab bo'lmadi");
        },
    });
};

export const usePatchCourseActive = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, value}: { id: string, value: boolean, source?: "my" | "business" | "archived" }) => patchCourseActive(id, value),
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

                if (querySource === "archived") {
                    if (source === "archived" && value) {
                        nextCourses = nextCourses.filter((course) => course.id !== id);
                    } else if ((source === "business" || source === "my") && !value && !hasCourse && updatedCourse) {
                        nextCourses = [updatedCourse, ...nextCourses];
                    }
                }

                if (querySource === "business") {
                    if (source === "business" && !value) {
                        nextCourses = nextCourses.filter((course) => course.id !== id);
                    } else if (source === "archived" && value && !hasCourse && updatedCourse) {
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
        onError: (error, _variables, context) => {
            context?.previousQueries?.forEach(([queryKey, courses]) => {
                qc.setQueryData(queryKey, courses);
            });

            if (context?.previousDetail) {
                qc.setQueryData(courseDetailKey(context.previousDetail.id), context.previousDetail);
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
