import toast from "react-hot-toast";
import Alert from "../components/ui/alert/Alert.tsx";

export const getErrorMessage = (error: unknown, fallback = "Xatolik yuz berdi.") => {
    if (error instanceof Error) {
        return error.message || fallback;
    }

    if (typeof error === "string") {
        return error || fallback;
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message) {
            return message;
        }
    }

    return fallback;
};

export const showErrorToast = (error: unknown, title = "Xatolik yuz berdi") => {
    const message = getErrorMessage(error);

    return toast.custom(() => (
        <Alert
            variant="error"
            title={title}
            message={message}
        />
    ));
};

export const showSuccessToast = (message: string, title = "Muvaffaqiyatli bajarildi") =>
    toast.custom(() => (
        <Alert
            variant="success"
            title={title}
            message={message}
        />
    ));
