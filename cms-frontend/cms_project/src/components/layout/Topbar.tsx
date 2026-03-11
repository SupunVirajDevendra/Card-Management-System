import { useLocation } from "react-router-dom";
import { Menu, Bell, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const pageTitles: Record<string, string> = {
    "/": "System Dashboard",
    "/cards": "Card Inventory",
    "/cards/new": "New Component Issue",
    "/requests": "Approval Workflows",
};

interface TopbarProps {
    onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
    const { pathname } = useLocation();

    const title =
        pageTitles[pathname] ??
        (pathname.startsWith("/cards/") ? "Edit Card Instance" : "Status Management");

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md md:px-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 lg:hidden shadow-sm"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-extrabold text-slate-900 md:text-xl tracking-tight leading-none">{title}</h1>
                    <div className="mt-1.5 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:flex">
                        <Calendar className="h-3 w-3" />
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                        })}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                {/* <div className="hidden relative md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Quick Search..."
                        className="h-10 w-56 rounded-xl border-none bg-slate-50 pl-10 pr-4 text-xs font-semibold text-slate-900 ring-0 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 shadow-inner"
                    />
                </div> */}

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => toast("Coming soon!")}
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
                    >
                        <Bell className="h-5 w-5 text-slate-500" />
                        <span className="absolute right-3.5 top-3.5 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    </button>
                </div>
            </div>
        </header>
    );
}
