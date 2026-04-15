import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const setItem = <T>(name: string, data: T): void => {
    localStorage.setItem(name, JSON.stringify(data));
};

export const getItem = <T>(name: string): T | null => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) as T : null;
};


export const removeItem = (name: string): void => {
    localStorage.removeItem(name);
};

export function getSelectOptions<T extends Record<string, any>>(
    data: T[] | undefined | null,
    valueKey: keyof T = "id",
    labelKey: keyof T = "name"
): { value: string; label: string }[] {
    if (!data) return [];
    return data.map((item) => ({
        value: String(item[valueKey]),
        label: String(item[labelKey]),
    }));
}

export function formatUzPhone(number: string) {
    // Faqat raqamlarni qoldiramiz
    const digits = number.replace(/\D/g, "");

    // 13 ta raqam bo'lishi kerak: 998 XX XXX XX XX
    if (digits.length !== 12 && digits.length !== 9) {
        return "+998 " + digits;
    }

    // Agar user faqat 20 008 08 08 kiritgan bo'lsa
    let d = digits;
    if (digits.length === 9) {
        d = "998" + digits;
    }

    const country = d.slice(0, 3);
    const code = d.slice(3, 5);
    const part1 = d.slice(5, 8);
    const part2 = d.slice(8, 10);
    const part3 = d.slice(10, 12);

    return `+${country} ${code} ${part1} ${part2} ${part3}`;
}