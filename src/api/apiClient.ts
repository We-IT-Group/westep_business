import axios from "axios";
import { getItem, removeItem, setItem } from "../utils/utils.ts";


export const baseUrl = "http://192.168.1.237:8080/api"
export const baseUrlImage = "http://192.168.1.237:8080/api"
export const apiBaseOrigin = baseUrl.replace(/\/api$/, "");

// export const baseUrl = "https://westep.uz/api"
// export const baseUrlImage = "https://westep.uz"

const apiClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

// Access tokenni headerga qo‘shish
apiClient.interceptors.request.use((config) => {
    const token = getItem<string>("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Token refresh logikasi
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getItem<string>("refreshToken");
            if (!refreshToken) return Promise.reject(error);

            try {
                const { data } = await axios.post(`${baseUrl}/auth/refresh`, {}, {
                    params: { refreshToken: refreshToken },
                    withCredentials: true,
                });

                setItem<string>("accessToken", data.accessToken);
                setItem<string>("refreshToken", data.refreshToken);
                apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);
            } catch (err) {
                removeItem("accessToken");
                removeItem("refreshToken");
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
