import {Link, useLocation} from "react-router-dom";
import logo from "../assets/westep_dark_logo.png";
import {useSidebar} from "../context/SidebarContext";
import {dashboardNavItems, renderDashboardIcon} from "./dashboardNav";
import {ChevronLeft, ChevronRight, LogOut} from "lucide-react";

const AppSidebar: React.FC = () => {
    const {isExpanded, isMobileOpen, toggleMobileSidebar, toggleSidebar} = useSidebar();
    const location = useLocation();

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-gray-100 bg-white/96 text-slate-500 shadow-[18px_0_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950/96 dark:text-slate-400 dark:shadow-[18px_0_60px_rgba(2,6,23,0.5)] lg:translate-x-0 ${
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            } ${isExpanded ? "lg:w-[276px]" : "lg:w-[88px]"}`}
        >
            <div className={`border-b border-gray-100 pb-5 pt-5 dark:border-slate-800 ${isExpanded ? "px-5" : "px-3"}`}>
                <div className={`flex items-center ${isExpanded ? "justify-between gap-3" : "justify-center"}`}>
                    <Link to="/" className={`flex items-center ${isExpanded ? "gap-3" : "justify-center"}`}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shadow-sm ring-1 ring-blue-100 dark:bg-slate-900 dark:ring-slate-700">
                            <img
                                src={logo}
                                alt="Westep"
                                className="h-5 w-5 object-contain"
                            />
                        </div>
                        {isExpanded ? (
                            <div>
                                <div className="text-base font-black uppercase tracking-[0.08em] text-slate-900 dark:text-white">Westep</div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-500/80 dark:text-blue-400/80">
                                    Business Studio
                                </div>
                            </div>
                        ) : null}
                    </Link>

                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className={`hidden h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-500/40 dark:hover:bg-slate-800 dark:hover:text-blue-400 lg:flex ${isExpanded ? "" : "absolute -right-3 top-5 shadow-sm"}`}
                        aria-label={isExpanded ? "Yon panelni yig‘ish" : "Yon panelni ochish"}
                    >
                        <ChevronLeft className={`h-4.5 w-4.5 transition-transform ${isExpanded ? "" : "rotate-180"}`}/>
                    </button>
                </div>
            </div>

            <div className={`flex-1 space-y-6 overflow-y-auto py-6 custom-scrollbar ${isExpanded ? "px-3" : "px-2"}`}>
                <div>
                    {isExpanded ? (
                        <div className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 dark:text-slate-500">
                            Navigation
                        </div>
                    ) : null}
                    <nav className="space-y-1.5">
                        {dashboardNavItems.map((item) => {
                            const active =
                                location.pathname === item.path ||
                                (item.path !== "/" && location.pathname.startsWith(item.path));

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => {
                                        if (isMobileOpen) {
                                            toggleMobileSidebar();
                                        }
                                    }}
                                    className={`group flex items-center rounded-[18px] border py-3 transition-all duration-200 ${
                                        active
                                            ? "border-blue-200 bg-blue-50 text-blue-900 shadow-[0_12px_30px_rgba(59,130,246,0.10)]"
                                            : "border-transparent bg-white hover:border-gray-200 hover:bg-gray-50 hover:text-slate-900 dark:bg-transparent dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
                                    } ${isExpanded ? "gap-3 px-3.5" : "justify-center px-2"}`}
                                >
                                    <div className={`rounded-xl p-2 transition-colors ${active ? "bg-white text-blue-600 dark:bg-slate-900" : "bg-gray-50 text-slate-500 group-hover:text-blue-600 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:text-blue-400"}`}>
                                        {renderDashboardIcon(item.icon, "h-4.5 w-4.5 stroke-[2.2]")}
                                    </div>
                                    {isExpanded ? (
                                        <>
                                            <div className="min-w-0 flex-1">
                                                <div className={`text-sm font-bold tracking-tight ${active ? "text-blue-900 dark:text-blue-300" : "text-slate-900 dark:text-slate-100"}`}>
                                                    {item.label}
                                                </div>
                                            </div>
                                            <ChevronRight className={`h-4 w-4 transition-all ${active ? "translate-x-0 text-blue-500/70 dark:text-blue-300/70" : "-translate-x-1 text-slate-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-500"}`} />
                                        </>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-6 dark:border-slate-800">
                    {isExpanded ? (
                        <div className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 dark:text-slate-500">
                            Account
                        </div>
                    ) : null}
                    <Link
                        to="/logout"
                        className={`group flex items-center rounded-[18px] border border-transparent py-3 text-slate-500 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 ${isExpanded ? "gap-3 px-3.5" : "justify-center px-2"}`}
                    >
                        <div className="rounded-xl bg-gray-50 p-2 text-slate-500 group-hover:text-rose-500 dark:bg-slate-900 dark:text-slate-400">
                            <LogOut className="h-4.5 w-4.5 stroke-[2.2]" />
                        </div>
                        {isExpanded ? (
                            <div>
                                <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Logout</div>
                            </div>
                        ) : null}
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default AppSidebar;
