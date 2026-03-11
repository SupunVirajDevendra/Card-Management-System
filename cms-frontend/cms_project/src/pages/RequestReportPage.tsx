import { useState, useEffect } from "react";
import type { Request, RequestStatus } from "../types/request";
import { 
    getRequestReportData, 
    downloadRequestReportCsv, 
    downloadRequestReportPdf,
    saveRequestReportCsv,
    saveRequestReportPdf
} from "../services/reportService";
import { FileText, Download, Filter, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "../utils/format";

const statusOptions = [
    { value: "", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
];

function getDefaultDates() {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
    };
}

export default function RequestReportPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [filters, setFilters] = useState(getDefaultDates());
    const [status, setStatus] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getRequestReportData({ ...filters, status });
            setRequests(data);
        } catch (err) {
            console.error("Failed to load request report:", err);
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (key: "startDate" | "endDate", value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        fetchData();
    };

    const handleDownloadCsv = async () => {
        setDownloading(true);
        try {
            const blob = await downloadRequestReportCsv({ ...filters, status });
            saveRequestReportCsv(blob);
            toast.success("CSV downloaded successfully");
        } catch {
            toast.error("Failed to download CSV");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            const blob = await downloadRequestReportPdf({ ...filters, status });
            if (blob.size === 0) {
                throw new Error("Empty PDF response");
            }
            saveRequestReportPdf(blob);
            toast.success("PDF downloaded successfully");
        } catch (err) {
            console.error("PDF download error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to download PDF");
        } finally {
            setDownloading(false);
        }
    };

    const getStatusBadge = (status: RequestStatus) => {
        const styles: Record<RequestStatus, string> = {
            PENDING: "badge-pending",
            APPROVED: "badge-approved",
            REJECTED: "badge-rejected",
        };
        return <span className={`badge ${styles[status]}`}>{status}</span>;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            ACTI: "Activation",
            CDCL: "Card Close",
            CACT: "Activate",
            DACT: "Deactivate",
        };
        return labels[type] || type;
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title text-2xl">Request Report</h1>
                    <p className="page-subtitle">View and export request data</p>
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                className="form-input pl-9 w-40"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                className="form-input pl-9 w-40"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-600">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="form-input w-40"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        <Filter className="h-4 w-4" />
                        {loading ? "Loading..." : "Apply Filters"}
                    </button>
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={handleDownloadCsv}
                            disabled={downloading || requests.length === 0}
                            className="btn btn-outline"
                        >
                            <Download className="h-4 w-4" />
                            CSV
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloading || requests.length === 0}
                            className="btn btn-outline"
                        >
                            <FileText className="h-4 w-4" />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Card Number</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Requested By</th>
                                <th>Processed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-slate-400">Loading...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-slate-400">No data found</td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.requestId} className="table-row">
                                        <td className="font-mono text-xs">{req.requestId}</td>
                                        <td className="font-mono">{req.cardNumber}</td>
                                        <td>{getTypeLabel(req.requestReasonCode)}</td>
                                        <td>{getStatusBadge(req.statusCode)}</td>
                                        <td>{formatDate(req.createTime)}</td>
                                        <td>{req.requestUser || "-"}</td>
                                        <td>{req.approvedUser || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {requests.length > 0 && (
                <p className="text-sm text-slate-500 mt-4 text-center">
                    Showing {requests.length} record(s)
                </p>
            )}
        </div>
    );
}
