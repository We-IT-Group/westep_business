import {useQuery} from "@tanstack/react-query";
import {
    getModuleTestManagerResultsByCourse,
    getModuleTestManagerSessionDetail,
    getMyModuleTestResults,
    getMyModuleTestResultsByCourse,
    getMyModuleTestSessionDetail,
} from "./moduleTestsApi.ts";

export const myModuleTestResultsKey = ["my-module-test-results"] as const;

export const myModuleTestResultsByCourseKey = (courseId: string) =>
    ["my-module-test-results", "course", courseId] as const;

export const myModuleTestSessionDetailKey = (sessionId: string) =>
    ["my-module-test-session", sessionId] as const;

export const moduleTestManagerResultsByCourseKey = (courseId: string) =>
    ["module-test-manager-results", "course", courseId] as const;

export const moduleTestManagerSessionDetailKey = (sessionId: string) =>
    ["module-test-manager-session", sessionId] as const;

export const useMyModuleTestResults = (enabled = true) =>
    useQuery({
        queryKey: myModuleTestResultsKey,
        queryFn: getMyModuleTestResults,
        enabled,
    });

export const useMyModuleTestResultsByCourse = (courseId?: string, enabled = true) =>
    useQuery({
        queryKey: ["my-module-test-results", "course", courseId],
        queryFn: () => getMyModuleTestResultsByCourse(courseId || ""),
        enabled: !!courseId && enabled,
    });

export const useMyModuleTestSessionDetail = (sessionId?: string, enabled = true) =>
    useQuery({
        queryKey: ["my-module-test-session", sessionId],
        queryFn: () => getMyModuleTestSessionDetail(sessionId || ""),
        enabled: !!sessionId && enabled,
    });

export const useModuleTestManagerResultsByCourse = (courseId?: string, enabled = true) =>
    useQuery({
        queryKey: ["module-test-manager-results", "course", courseId],
        queryFn: () => getModuleTestManagerResultsByCourse(courseId || ""),
        enabled: !!courseId && enabled,
    });

export const useModuleTestManagerSessionDetail = (sessionId?: string, enabled = true) =>
    useQuery({
        queryKey: ["module-test-manager-session", sessionId],
        queryFn: () => getModuleTestManagerSessionDetail(sessionId || ""),
        enabled: !!sessionId && enabled,
    });
