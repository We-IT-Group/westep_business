import {useEffect, useRef} from "react";
import UserDropdown from "../components/header/UserDropdown";
import {useSidebar} from "../context/SidebarContext";
import {Search, Bell} from "lucide-react";

const AppHeader: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const {toggleMobileSidebar} = useSidebar();

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
            className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={toggleMobileSidebar}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 lg:hidden"
                    aria-label="Open sidebar"
                >
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-[1.8]">
                        <path
                            d="M4.75 7.25h14.5M4.75 12h14.5M4.75 16.75h9.5"
                            stroke="currentColor"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>

                <div className="flex-1 max-w-80">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Search courses, students, modules..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 ml-8">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5 text-gray-600"/>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                </button>
                <UserDropdown/>
            </div>
        </header>
    );
};

export default AppHeader;
