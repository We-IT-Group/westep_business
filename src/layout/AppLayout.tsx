import {SidebarProvider} from "../context/SidebarContext";
import {Outlet} from "react-router";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

const LayoutContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
            <AppSidebar/>
            <Backdrop/>

            <div className="min-h-screen lg:pl-64">
                <div className="mx-auto min-h-screen max-w-none">
                    <AppHeader/>
                    <main className="flex-1 overflow-y-auto">
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
