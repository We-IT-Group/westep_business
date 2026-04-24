import type {ReactNode} from "react";
import {LayoutDashboard, BookOpen, Users, BarChart3, Settings, MessageCircle} from "lucide-react";

type DashboardNavIcon =
    | "overview"
    | "courses"
    | "students"
    | "team"
    | "teachers"
    | "schedule"
    | "messages"
    | "analytics"
    | "settings";

export type DashboardNavItem = {
    label: string;
    path: string;
    icon: DashboardNavIcon;
    badge?: string;
    description: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
    {
        label: "Boshqaruv",
        path: "/",
        icon: "overview",
        description: "Platformangizning umumiy holati.",
    },
    {
        label: "Kurslar",
        path: "/courses",
        icon: "courses",
        description: "Chop etilgan va tayyorlanayotgan ta'lim dasturlarini boshqaring.",
    },
    {
        label: "Jamoa",
        path: "/users",
        icon: "team",
        description: "Biznesingizdagi o‘qituvchi va assistentlarni boshqaring.",
    },
    {
        label: "Talabalar",
        path: "/students",
        icon: "students",
        description: "Talabalar o‘sishi, faolligi va natijalarini kuzating.",
    },
    {
        label: "Tahlillar",
        path: "/analytics",
        icon: "analytics",
        description: "Natijalar va platforma bo‘yicha tahlillar.",
    },
    {
        label: "Sozlamalar",
        path: "/settings",
        icon: "settings",
        description: "Workspace va platforma sozlamalari.",
    },
];

type DashboardPageMeta = {
    title: string;
    description: string;
};

export const getDashboardPageMeta = (pathname: string): DashboardPageMeta => {
    const directMatch = dashboardNavItems.find((item) => item.path === pathname);

    if (directMatch) {
        return {
            title: directMatch.label,
            description: directMatch.description,
        };
    }

    if (pathname.startsWith("/courses")) {
        return {
            title: "Kurslar",
            description: "Chop etilgan va tayyorlanayotgan ta'lim dasturlarini boshqaring.",
        };
    }

    if (pathname.startsWith("/users")) {
        return {
            title: "Jamoa",
            description: "Biznesingizdagi o‘qituvchi va assistentlarni boshqaring.",
        };
    }

    if (pathname.startsWith("/students")) {
        return {
            title: "Talabalar",
            description: "Talabalar o‘sishi, faolligi va natijalarini kuzating.",
        };
    }

    if (pathname.startsWith("/teachers")) {
        return {
            title: "O‘qituvchilar",
            description: "Mentorlar yuki, qo‘llab-quvvatlash salohiyati va jamoa ishini kuzating.",
        };
    }

    if (pathname.startsWith("/schedule")) {
        return {
            title: "Jadval",
            description: "Workspace bo‘ylab reja, jarayon va arxiv oqimini ko‘ring.",
        };
    }

    if (pathname.startsWith("/messages")) {
        return {
            title: "Xabarlar",
            description: "Bildirishnomalar, o‘qilmagan xabarlar va javob amallarini boshqaring.",
        };
    }

    if (pathname.startsWith("/profile")) {
        return {
            title: "Profil",
            description: "Workspace identifikatsiyasi, biznes konteksti va kirish profili.",
        };
    }

    return {
        title: "Boshqaruv",
        description: "Platformangizning umumiy holati.",
    };
};

const iconClassName =
    "h-5 w-5 shrink-0 stroke-[1.8] transition-colors duration-200";

export const renderDashboardIcon = (
    icon: DashboardNavIcon,
    className = iconClassName,
): ReactNode => {
    switch (icon) {
        case "overview":
            return (
                <LayoutDashboard className={className}/>
            );
        case "courses":
            return (
                <BookOpen className={className}/>
            );
        case "students":
            return (
                <Users className={className}/>
            );
        case "team":
            return (
                <Users className={className}/>
            );
        case "teachers":
            return (
                <BarChart3 className={className}/>
            );
        case "schedule":
            return (
                <Settings className={className}/>
            );
        case "messages":
            return (
                <MessageCircle className={className}/>
            );
        case "analytics":
            return (
                <BarChart3 className={className}/>
            );
        case "settings":
            return (
                <Settings className={className}/>
            );
        default:
            return null;
    }
};
