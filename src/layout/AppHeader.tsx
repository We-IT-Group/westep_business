import {useEffect, useRef} from "react";
import UserDropdown from "../components/header/UserDropdown";
import {useSidebar} from "../context/SidebarContext";
import {Search, Bell, Command, PanelLeft} from "lucide-react";
import {useLocation, useNavigate} from "react-router-dom";
import {getDashboardPageMeta} from "./dashboardNav";
import {useUnreadNotificationsCount} from "../api/notifications/useNotifications.ts";
import {ThemeToggleButton} from "../components/common/ThemeToggleButton.tsx";

const AppHeader: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const {toggleMobileSidebar} = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();
    const pageMeta = getDashboardPageMeta(location.pathname);
    const {data: unreadNotifications = 0} = useUnreadNotificationsCount();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <header
            className="sticky top-0 z-40 mb-3 rounded-[22px] border border-white/60 bg-white/72 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/75 dark:shadow-[0_12px_32px_rgba(2,6,23,0.45)] md:px-5 xl:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={toggleMobileSidebar}
                        className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 lg:hidden"
                        aria-label="Yon panelni ochish"
                    >
                        <PanelLeft className="h-5 w-5 stroke-[2.2]" />
                    </button>

                    <div className="min-w-0">
                        <h1 className="text-[1.7rem] font-black tracking-[-0.04em] text-slate-950 dark:text-white md:text-[1.9rem]">
                            {pageMeta.title}
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                            {pageMeta.description}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={toggleMobileSidebar}
                    className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
                    aria-label="Yon panelni ochish"
                >
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-[2]">
                        <path
                            d="M4.75 7.25h14.5M4.75 12h14.5M4.75 16.75h9.5"
                            stroke="currentColor"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>

                <div className="flex flex-col gap-3 xl:min-w-[500px] xl:max-w-[680px] xl:flex-row xl:items-center xl:justify-end">
                    <div className="relative group w-full xl:max-w-[380px]">
                        <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 text-slate-400 transition-colors group-focus-within:text-blue-600 dark:text-slate-500 dark:group-focus-within:text-blue-400">
                            <Search className="w-4 h-4 stroke-[2.5]"/>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Kurslar, darslar, talabalarni qidiring..."
                            className="w-full rounded-[18px] border border-slate-200 bg-white/80 py-2.5 pl-11 pr-14 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all placeholder:text-slate-400 focus:border-blue-500/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-400/40 dark:focus:bg-slate-900 dark:focus:ring-blue-400/10"
                        />
                        <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:flex">
                            <Command className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">K</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 xl:justify-end">
                        <ThemeToggleButton/>

                        <button
                            onClick={() => navigate("/messages")}
                            className="relative group rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                            <Bell className="h-5 w-5 text-slate-500 transition-colors group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"/>
                            {unreadNotifications > 0 ? (
                                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black text-white">
                                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                                </span>
                            ) : (
                                <span className="absolute right-3 top-3 h-2 w-2 rounded-full border-2 border-white bg-emerald-500"></span>
                            )}
                        </button>

                        <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

                        <UserDropdown/>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
