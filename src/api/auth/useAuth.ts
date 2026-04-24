import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
    checkPhoneNumber,
    getCurrentUser,
    login,
    logout,
    register,
    resetPassword,
    sendOtpCode,
    verifyCode
} from "./authApi.ts";
import {useNavigate} from "react-router-dom";
import {getItem, removeItem} from "../../utils/utils.ts";
import {useToast} from "../../hooks/useToast.tsx";
import {showErrorToast} from "../../utils/toast.tsx";

export const isTeacherSideRole = (roleName?: string) => {
    const normalized = (roleName || "").toUpperCase();
    return normalized.includes("BUSINESS_ADMIN") || normalized.includes("TEACHER");
};

export const useUser = () =>
    useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const token = getItem<string>('accessToken');
            if (!token) throw new Error("No token");
            return await getCurrentUser();
        },
        retry: false,
        staleTime: 1000 * 60 * 10,          // 10 daqiqa davomida so‘rov yubormaydi
        refetchOnWindowFocus: false,        // sahifa qayta focus bo‘lsa so‘rov yubormaydi
        refetchOnMount: false,              // component qayta mount bo‘lsa so‘rov yubormaydi
        refetchOnReconnect: false,
    });

export const useLogin = () => {
    const navigate = useNavigate();
    const toast = useToast();
    return useMutation({
        mutationFn: login,
        onSuccess: async () => {
            try {
                const user = await getCurrentUser();

                if (!isTeacherSideRole(user?.roleName)) {
                    removeItem("accessToken");
                    removeItem("refreshToken");
                    toast.error("Bu panelga faqat Business Admin yoki Teacher kira oladi.");
                    navigate("/login", {replace: true});
                    return;
                }

                navigate("/", {replace: true});
            } catch (error) {
                removeItem("accessToken");
                removeItem("refreshToken");
                toast.error(error instanceof Error ? error.message : "Login amalga oshmadi.");
                navigate("/login", {replace: true});
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useRegister = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: register,
        onSuccess: () => {
            navigate("/success");
            sessionStorage.removeItem("form");
        },
        onError: (error) => {
            showErrorToast(error, "Ro'yxatdan o'tib bo'lmadi");
        }
    });
};


export const useCheckPhoneNumber = () => {
        const navigate = useNavigate();
        const toast = useToast();
        return useMutation({
            mutationFn: checkPhoneNumber,
            onSuccess: (_, body: { phone: string }) => {
                navigate("/password", {state: {phone: body.phone}});
            },
            onError: (_, body: { phone: string }) => {
                navigate("/register", {state: {phone: body.phone}});
                toast.warning("Ro'yxatdan o'ting!", "Siz saytda yo'qsiz");
            },
        });
    }
;


export const useLogout = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            qc.removeQueries({queryKey: ["currentUser"]});
        },
    });
};


export const useOtpPhoneNumber = (type: string) => {
    sessionStorage.setItem("otpType", JSON.stringify(type));
    const navigate = useNavigate();
    return useMutation({
        mutationFn: sendOtpCode,
        onSuccess: () => {
            navigate("/verify-code");
        },
        onError: (error) => {
            return error
        },
    });
};


export const useVerifyCode = () => {
    const {mutate} = useRegister();
    const {mutate: resetPassword} = useResetPassword();
    const otpType = JSON.parse(sessionStorage.getItem('otpType') as string);
    return useMutation({
        mutationFn: verifyCode,
        onSuccess: () => {
            const form = JSON.parse(sessionStorage.getItem("form") as string);
            if (otpType === "REGISTER") {
                mutate({
                    ...form,
                    phone: form.phoneNumber,
                })
            } else {
                resetPassword({
                    password: form.password,
                    phoneNumber: form.phoneNumber,
                });
            }
        },
        onError: (error) => {
            showErrorToast(error, "Kod tasdiqlanmadi");
        },
    });
};

export const useResetPassword = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            navigate("/login");
        },
        onError: (error) => {
            return error
        },
    });
};
