import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    CreditCard,
    Zap,
    ClipboardCheck,
    Settings,
    LogOut,
    User,
    Landmark,
    FileText,
    ClipboardList
} from "lucide-react";
import { logout, getUser } from "../../services/authService";

const navItems = [
    { to: "/", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/cards", label: "Card Management", Icon: CreditCard },
    { to: "/activate", label: "Card Activation", Icon: Zap },
    { to: "/requests", label: "Request Approvals", Icon: ClipboardCheck },
];

const reportItems = [
    { to: "/reports/cards", label: "Card Report", Icon: FileText },
    { to: "/reports/requests", label: "Request Report", Icon: ClipboardList },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const user = getUser();
    
    const handleLogout = async () => {
        await logout();
        window.location.href = "/login";
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                onClick={onClose}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200 transition-transform lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
                        <Landmark className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">BankCMS</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
                            Enterprise
                        </span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
                    <div className="mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Main Navigation
                    </div>
                    {navItems.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            end={to === "/"}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                                    <span>{label}</span>
                                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white opacity-50" />}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="mt-8 mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Reports
                    </div>
                    {reportItems.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                                    <span>{label}</span>
                                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white opacity-50" />}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="mt-8 mb-4 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        System
                    </div>
                    <button
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
                    >
                        <Settings className="h-5 w-5 text-slate-400" />
                        <span>Settings</span>
                    </button>
                </nav>

                <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-inner">
                                <User className="h-5 w-5" />
                                <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 leading-none">{user?.username || "User"}</span>
                                <span className="text-[10px] font-medium text-slate-500 mt-1">{user?.userRole || "User"}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
