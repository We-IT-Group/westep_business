import {Link, useLocation} from "react-router";
import logo from "../assets/westep_dark_logo.png";
import {useSidebar} from "../context/SidebarContext";
import {dashboardNavItems, renderDashboardIcon} from "./dashboardNav";

const AppSidebar: React.FC = () => {
    const {isMobileOpen, toggleMobileSidebar} = useSidebar();
    const location = useLocation();

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-64 bg-[#0B1F3A] text-white  flex-col border-r border-[#213653] transition-transform duration-300 lg:translate-x-0 ${
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <Link to="/" className="border-b border-[#213653] px-4 py-3">
                <img
                    src={logo}
                    alt="Westep"
                    className="h-10 w-auto object-contain brightness-0 invert"
                />
            </Link>

            <div className="flex-1 px-3 py-6 space-y-1">
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                active
                                    ? "bg-white/10 text-white"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                <span className="w-5 h-5">
                  {renderDashboardIcon(item.icon, "h-5 w-5 stroke-[1.8]")}
                </span>
                            <span className="font-medium">
                  {item.label}
                </span>
                        </Link>
                    );
                })}
            </div>
            <div className="p-6 border-t border-white/10">
                <div className="text-xs text-white/50">
                    © 2026 Westep
                </div>
            </div>
        </aside>
    );
};

export default AppSidebar;
