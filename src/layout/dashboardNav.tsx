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
        label: "Dashboard",
        path: "/",
        icon: "overview",
        description: "Overview of your platform.",
    },
    {
        label: "Courses",
        path: "/courses",
        icon: "courses",
        description: "Manage published and upcoming learning programs.",
    },
    {
        label: "Team",
        path: "/users",
        icon: "team",
        description: "Add and manage teachers and assistants in your business.",
    },
    {
        label: "Students",
        path: "/students",
        icon: "students",
        description: "Track learner growth, progress, and engagement.",
    },
    {
        label: "Analytics",
        path: "/analytics",
        icon: "analytics",
        description: "Performance and platform insights.",
    },
    {
        label: "Settings",
        path: "/settings",
        icon: "settings",
        description: "Workspace and platform settings.",
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
            title: "Courses",
            description: "Manage published and upcoming learning programs.",
        };
    }

    if (pathname.startsWith("/users")) {
        return {
            title: "Team",
            description: "Add and manage teachers and assistants in your business.",
        };
    }

    if (pathname.startsWith("/students")) {
        return {
            title: "Students",
            description: "Track learner growth, progress, and engagement.",
        };
    }

    return {
        title: "Dashboard",
        description: "Overview of your platform.",
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
