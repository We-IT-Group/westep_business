import {SidebarProvider, useSidebar} from "../context/SidebarContext";
import {Outlet} from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

const LayoutContent: React.FC = () => {
    const {isExpanded} = useSidebar();

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top_left,_rgba(10,132,255,0.16),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(13,148,136,0.14),_transparent_34%),linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(244,247,251,0.96))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.24),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))]" />
                <div className="absolute left-[-120px] top-[120px] h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/15" />
                <div className="absolute right-[-60px] top-[220px] h-80 w-80 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/15" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(180deg,rgba(15,23,42,0.18),transparent_60%)] dark:bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] dark:[mask-image:linear-gradient(180deg,rgba(255,255,255,0.14),transparent_60%)]" />
            </div>

            <AppSidebar/>
            <Backdrop/>

            <div className={`relative min-h-screen transition-[padding] duration-300 ${isExpanded ? "lg:pl-[276px]" : "lg:pl-[88px]"}`}>
                <div className="mx-auto min-h-screen max-w-none">
                    <AppHeader/>
                    <main className="compact-workspace relative flex-1 overflow-y-auto px-3 pb-5 pt-3 md:px-5 xl:px-6">
                        <Outlet/>
                    </main>
                </div>
            </div>
        </div>
    );
};

const AppLayout: React.FC = () => {
    return (
        <SidebarProvider>
            <LayoutContent/>
        </SidebarProvider>
    );
};

export default AppLayout;
