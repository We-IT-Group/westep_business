import {getItem, setItem} from "./utils.ts";

const DEVICE_ID_STORAGE_KEY = "businessDeviceId";

const createFallbackDeviceId = () =>
    `device-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

const resolvePlatform = (userAgent: string) => {
    const normalized = userAgent.toLowerCase();

    if (normalized.includes("iphone") || normalized.includes("ipad") || normalized.includes("ios")) {
        return "iOS";
    }
    if (normalized.includes("android")) {
        return "Android";
    }
    if (normalized.includes("mac")) {
        return "macOS";
    }
    if (normalized.includes("win")) {
        return "Windows";
    }
    if (normalized.includes("linux")) {
        return "Linux";
    }

    return "Unknown";
};

const resolveBrowser = (userAgent: string) => {
    const normalized = userAgent.toLowerCase();

    if (normalized.includes("edg/")) {
        return "Edge";
    }
    if (normalized.includes("opr/") || normalized.includes("opera")) {
        return "Opera";
    }
    if (normalized.includes("firefox/")) {
        return "Firefox";
    }
    if (normalized.includes("chrome/") && !normalized.includes("edg/")) {
        return "Chrome";
    }
    if (normalized.includes("safari/") && !normalized.includes("chrome/")) {
        return "Safari";
    }

    return "Browser";
};

export const getOrCreateDeviceId = () => {
    const existingDeviceId = getItem<string>(DEVICE_ID_STORAGE_KEY);
    if (existingDeviceId) {
        return existingDeviceId;
    }

    const nextDeviceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : createFallbackDeviceId();

    setItem(DEVICE_ID_STORAGE_KEY, nextDeviceId);
    return nextDeviceId;
};

export const getCurrentDeviceMeta = () => {
    if (typeof navigator === "undefined") {
        return {
            deviceId: getOrCreateDeviceId(),
            deviceName: "Unknown device",
            platform: "Unknown",
            browser: "Browser",
        };
    }

    const platform = resolvePlatform(navigator.userAgent);
    const browser = resolveBrowser(navigator.userAgent);
    const deviceName = `${platform} ${browser}`.trim();

    return {
        deviceId: getOrCreateDeviceId(),
        deviceName,
        platform,
        browser,
    };
};

export const isCurrentDeviceSession = (deviceId?: string) =>
    !!deviceId && deviceId === getOrCreateDeviceId();
