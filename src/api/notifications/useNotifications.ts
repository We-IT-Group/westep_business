import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    getNotifications,
    getUnreadNotificationsCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "./notificationsApi.ts";
import {getItem} from "../../utils/utils.ts";
import {showErrorToast, showSuccessToast} from "../../utils/toast.tsx";

const notificationsKey = ["notifications"] as const;
const unreadNotificationsKey = ["notifications", "unread-count"] as const;

export const useNotifications = () =>
    useQuery({
        queryKey: notificationsKey,
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getNotifications();
        },
        retry: false,
    });

export const useUnreadNotificationsCount = () =>
    useQuery({
        queryKey: unreadNotificationsKey,
        queryFn: async () => {
            const token = getItem<string>("accessToken");
            if (!token) throw new Error("No token");
            return await getUnreadNotificationsCount();
        },
        retry: false,
    });

export const useReadNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: notificationsKey});
            await queryClient.invalidateQueries({queryKey: unreadNotificationsKey});
            showSuccessToast("Notification read holatiga o'tdi.");
        },
        onError: (error) => {
            showErrorToast(error, "Notificationni yangilab bo'lmadi");
        },
    });
};

export const useReadAllNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: notificationsKey});
            await queryClient.invalidateQueries({queryKey: unreadNotificationsKey});
            showSuccessToast("Barcha notificationlar read qilindi.");
        },
        onError: (error) => {
            showErrorToast(error, "Notificationlarni yangilab bo'lmadi");
        },
    });
};
