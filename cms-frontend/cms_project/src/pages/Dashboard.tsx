import { useEffect, useState, useCallback } from "react";
import { formatDate } from "../utils/format";
import { useNavigate } from "react-router-dom";
import { getCardStats } from "../services/cardService";
import { getRequests, processRequest, getPendingCount } from "../services/requestService";
import type { Request, RequestStatus, RequestType } from "../types/request";
import {
    LayoutDashboard,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    PlusCircle,
    ArrowRightCircle,
    Activity,
    FileText,
    CheckSquare
} from "lucide-react";

interface KpiStat {
    label: string;
    value: number;
    colorClass: string;
    link: string;
    Icon: typeof CreditCard;
}

type TabType = "overview" | "search" | "approvals";

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [stats, setStats] = useState<KpiStat[]>([]);

    const loadStats = useCallback(async () => {
        const cardStats = await getCardStats();
        const pending = await getPendingCount();
        setStats([
            {
                label: "Total Cards",
                value: cardStats.total,
                colorClass: "text-slate-900 bg-slate-50",
                link: "/cards",
                Icon: CreditCard
            },
            {
                label: "Active Cards",
                value: cardStats.active,
                colorClass: "text-green-600 bg-green-50",
                link: "/cards",
                Icon: CheckCircle2
            },
            {
                label: "Inactive",
                value: cardStats.inactive,
                colorClass: "text-blue-600 bg-blue-50",
                link: "/cards",
                Icon: XCircle
            },
            {
                label: "Pending Approvals",
                value: pending,
                colorClass: "text-amber-600 bg-amber-50",
                link: "/requests",
                Icon: Clock
            },
        ]);
    }, []);

    useEffect(() => { 
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadStats(); 
    }, [loadStats, activeTab]);

    return (
        <div className="page">

            <div className="mb-8 flex overflow-x-auto overflow-y-hidden border-b border-slate-200">
                {[
                    { id: "overview", label: "Overview", icon: LayoutDashboard },
                    { id: "search", label: "Request History", icon: FileText },
                    { id: "approvals", label: "Pending Approvals", icon: CheckSquare },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold transition-all border-b-2 -mb-[2px] whitespace-nowrap ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            onClick={() => setActiveTab(tab.id as TabType)}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "overview" && <OverviewTab stats={stats} navigate={navigate} />}
                {activeTab === "search" && <SearchTab />}
                {activeTab === "approvals" && <ApprovalsTab onAction={loadStats} />}
            </div>
        </div>
    );
}

function OverviewTab({ stats, navigate }: { stats: KpiStat[]; navigate: (path: string) => void }) {
    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <button
                        key={stat.label}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
                        onClick={() => navigate(stat.link)}
                    >
                        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.colorClass} shadow-inner transition-transform group-hover:scale-110`}>
                            <stat.Icon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{stat.label}</span>
                        </div>
                        <ArrowRightCircle className="absolute bottom-6 right-6 h-5 w-5 text-slate-100 transition-colors group-hover:text-blue-100" />
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/60">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            className="flex items-center justify-between rounded-xl bg-blue-600 px-6 py-5 font-bold text-white transition-all hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-500/30"
                            onClick={() => navigate("/cards/new")}
                        >
                            <div className="flex items-center gap-4">
                                <PlusCircle className="h-6 w-6 opacity-80" />
                                <span className="text-lg">Issue New Card</span>
                            </div>
                            <ArrowRightCircle className="h-5 w-5 opacity-50" />
                        </button>
                        <button
                            className="flex items-center justify-between rounded-xl bg-slate-800 px-6 py-5 font-bold text-slate-200 transition-all hover:bg-slate-700 active:scale-95 border border-slate-700/50"
                            onClick={() => navigate("/requests")}
                        >
                            <div className="flex items-center gap-4">
                                <Activity className="h-6 w-6 opacity-80 shadow-inner" />
                                <span className="text-lg">Queue Manager</span>
                            </div>
                            <ArrowRightCircle className="h-5 w-5 opacity-30" />
                        </button>
                    </div>
                    <p className="mt-8 text-xs font-medium text-slate-500 leading-relaxed italic opacity-80 text-center">
                        Operational actions are audited and require level-2 privilege clearance.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SearchTab() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [searchType, setSearchType] = useState<RequestType | "">("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getRequests(0, 50);
            let filtered = data.content;
            if (searchType) filtered = filtered.filter((r) => r.requestReasonCode === searchType);
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (r) =>
                        r.maskId.toLowerCase().includes(q) ||
                        String(r.requestId).toLowerCase().includes(q)
                );
            }
            setRequests(filtered);
        } finally {
            setLoading(false);
        }
    }, [searchType, searchQuery]);

    useEffect(() => { handleSearch(); }, [handleSearch]);

    const getStatusStyles = (status: RequestStatus) => {
        switch (status) {
            case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
            case "APPROVED": return "bg-green-50 text-green-700 border-green-200";
            case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
            default: return "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as RequestType | "")}
                    className="form-input md:w-44"
                >
                    <option value="">All Types</option>
                    <option value="ACTI">Activation</option>
                    <option value="CDCL">Cancellation</option>
                </select>
                <input
                    type="text"
                    placeholder="Search card ID or number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input md:flex-1 md:max-w-md"
                />
                <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Card ID</th>
                            <th>Number</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="py-10 text-center text-slate-400 italic">Searching...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan={6} className="py-10 text-center text-slate-400">No matching requests found</td></tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.requestId} className="table-row">
                                    <td className="font-mono text-xs">{req.requestId}</td>
                                    <td className="font-medium">{req.maskId}</td>
                                    <td className="font-mono">{req.cardNumber}</td>
                                    <td>{req.requestReasonCode}</td>
                                    <td>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(req.statusCode)}`}>
                                            {req.statusCode}
                                        </span>
                                    </td>
                                    <td className="text-slate-500">{formatDate(req.createTime)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ApprovalsTab({ onAction }: { onAction?: () => void }) {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | number | null>(null);

    const loadPending = async () => {
        setLoading(true);
        try {
            const data = await getRequests(0, 50);
            setRequests(data.content.filter((r) => r.statusCode === "PENDING"));
        } finally { setLoading(false); }
    };

    useEffect(() => { loadPending(); }, []);

    const process = async (id: number | string, action: "approve" | "reject") => {
        setActionLoading(id);
        try {
            await processRequest(id, action === "approve");
            await loadPending();
            if (onAction) onAction();
        } finally { setActionLoading(null); }
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Request</th>
                            <th>Card Details</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="py-10 text-center">Loading...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan={4} className="py-10 text-center text-slate-400 italic">No pending approvals</td></tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.requestId} className="table-row">
                                    <td>
                                        <div className="font-bold text-slate-900">{req.requestId}</div>
                                        <div className="text-xs text-slate-400">{formatDate(req.createTime)}</div>
                                    </td>
                                    <td>
                                        <div className="font-medium">{req.maskId}</div>
                                        <div className="font-mono text-xs text-slate-500">{req.cardNumber}</div>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                            {req.requestReasonCode}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => process(req.requestId, "approve")}
                                                disabled={actionLoading === req.requestId}
                                            >
                                                {actionLoading === req.requestId ? "Wait..." : "Approve"}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => process(req.requestId, "reject")}
                                                disabled={actionLoading === req.requestId}
                                            >
                                                {actionLoading === req.requestId ? "Wait..." : "Reject"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
