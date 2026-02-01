import {SidebarProvider} from "../context/SidebarContext";
import {Outlet, useLocation} from "react-router";
import AppHeader from "./AppHeader";
import MobileNavigation from "./MobileNavigation.tsx";

const LayoutContent: React.FC = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen overflow-hidden">
            <div
                className={`max-w-(--breakpoint-2xl) m-auto h-full`}
            >
                <AppHeader/>
                <div className="bg-white h-[calc(100vh-100px)] p-0 m-0">
                    <Outlet/>
                </div>
            </div>
            {
                location.pathname === "/" && <MobileNavigation/>
            }

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
