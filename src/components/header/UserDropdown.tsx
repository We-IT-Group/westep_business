import {useState} from "react";
import {DropdownItem} from "../ui/dropdown/DropdownItem";
import {Dropdown} from "../ui/dropdown/Dropdown";
import {Link} from "react-router-dom";
import {useUser} from "../../api/auth/useAuth.ts";
import {User, Settings, Shield, LifeBuoy, LogOut, ChevronDown} from "lucide-react";

export default function UserDropdown() {
    const {data: user} = useUser();
    const [isOpen, setIsOpen] = useState(false);

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    return (
        <div className="relative">
            <button 
                onClick={toggleDropdown}
                className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-2xl transition-all duration-200 group"
            >
                <div className="relative">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 ring-2 ring-white transition-transform group-hover:scale-105">
                        <User className="w-5 h-5 text-white"/>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="text-left hidden lg:block">
                    <div className="text-sm font-black text-slate-900 leading-tight">
                        {user?.firstname || "Foydalanuvchi"} {user?.lastname || ""}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {user?.roleName || "Administrator"}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="absolute right-0 mt-3 flex w-[280px] flex-col rounded-[32px] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/50 z-50 overflow-hidden"
            >
                <div className="px-5 py-5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.14em] mb-1">Tizimga kirgan foydalanuvchi</p>
                    <p className="text-sm font-black text-slate-900 truncate">{user?.firstname} {user?.lastname}</p>
                    <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full w-fit shadow-sm">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{user?.roleName}</span>
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 font-bold text-slate-600 rounded-2xl group hover:bg-slate-50 hover:text-blue-600 transition-all text-sm"
                    >
                        <User className="w-4 h-4 stroke-[2.2] text-slate-400 group-hover:text-blue-600 transition-colors" />
                        Profil sozlamalari
                    </DropdownItem>

                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 font-bold text-slate-600 rounded-2xl group hover:bg-slate-50 hover:text-blue-600 transition-all text-sm"
                    >
                        <Settings className="w-4 h-4 stroke-[2.2] text-slate-400 group-hover:text-blue-600 transition-colors" />
                        Workspace boshqaruvi
                    </DropdownItem>

                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        to="/support"
                        className="flex items-center gap-3 px-4 py-3 font-bold text-slate-600 rounded-2xl group hover:bg-slate-50 hover:text-blue-600 transition-all text-sm"
                    >
                        <LifeBuoy className="w-4 h-4 stroke-[2.2] text-slate-400 group-hover:text-blue-600 transition-colors" />
                        Yordam va qo‘llab-quvvatlash
                    </DropdownItem>
                </div>

                <div className="p-2 mt-1 pt-3 border-t border-slate-100">
                    <Link
                        to="/logout"
                        onClick={closeDropdown}
                        className="flex items-center gap-3 px-4 py-4 font-black text-rose-500 rounded-2xl group hover:bg-rose-50 transition-all text-sm uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4 stroke-[2.5]" />
                        Chiqish
                    </Link>
                </div>
            </Dropdown>
        </div>
    );
}
