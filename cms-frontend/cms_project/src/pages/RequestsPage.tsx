import { useEffect, useState, useCallback } from "react";
import type { Request, RequestStatus } from "../types/request";
import {
    getRequests,
    getRequestById,
    processRequest,
} from "../services/requestService";
import RequestTable from "../components/request/RequestTable";
import ConfirmModal from "../components/common/ConfirmModal";
import { formatDate } from "../utils/format";
import toast from "react-hot-toast";
import { List, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, X } from "lucide-react";

type TabKey = "ALL" | RequestStatus;

const TABS: { key: TabKey; label: string; icon: typeof List }[] = [
    { key: "ALL", label: "Registry", icon: List },
    { key: "PENDING", label: "Queue", icon: Clock },
    { key: "APPROVED", label: "Released", icon: CheckCircle },
    { key: "REJECTED", label: "Denied", icon: XCircle },
];

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [processingId, setProcessingId] = useState<string | number | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    const [viewModal, setViewModal] = useState<{
        isOpen: boolean;
        request: Request | null;
    }>({ isOpen: false, request: null });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        action: "approve" | "reject" | null;
        request: Request | null;
    }>({ isOpen: false, action: null, request: null });

    const loadRequests = useCallback(() => {
        setIsLoading(true);
        getRequests(currentPage - 1, 5)
            .then((data) => {
                setRequests(data.content || []);
                setTotalElements(data.totalElements || 0);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch requests", err);
                setIsLoading(false);
            });
    }, [currentPage]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const filtered =
        activeTab === "ALL"
            ? requests
            : requests.filter((r) => r.statusCode === activeTab);

    const handleConfirm = async () => {
        if (!confirmModal.request || !confirmModal.action) return;
        const { request, action } = confirmModal;
        setProcessingId(request.requestId);
        setModalError(null);

        try {
            await processRequest(request.requestId, action === "approve");
            if (action === "approve") {
                toast.success("Transaction authorized.");
            } else {
                toast.success("Transaction denied.");
            }

            loadRequests();
            setConfirmModal({ isOpen: false, action: null, request: null });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Security validation failed.";
            setModalError(message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleView = async (req: Request) => {
        try {
            const requestId = typeof req.requestId === 'string' ? parseInt(req.requestId, 10) : req.requestId;
            const detailed = await getRequestById(requestId);
            setViewModal({ isOpen: true, request: detailed });
        } catch (err) {
            console.error("View error:", err);
            toast.error("Failed to load request details");
        }
    };

    const pendingCount = requests.filter((r) => r.statusCode === "PENDING").length;

    return (
        <div className="page">
            <div className="page-header flex items-center gap-4">
                <div>
                    <p className="page-subtitle text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                        Authorization Engine — {pendingCount} PENDING ACTION{pendingCount !== 1 ? "S" : ""}
                    </p>
                </div>
            </div>

            <div>
                <div className="mb-8 flex overflow-x-auto overflow-y-hidden border-b border-slate-200">
                    {TABS.map(({ key, label, icon: Icon }) => {
                        const count = key === "ALL" ? requests.length : requests.filter((r) => r.statusCode === key).length;
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                className={`group flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all border-b-2 -mb-[1px] whitespace-nowrap ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
                                    }`}
                                onClick={() => setActiveTab(key)}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-300 group-hover:text-slate-400"}`} />
                                {label}
                                <span className={`flex h-5 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[10px] font-black tracking-tighter shadow-inner transition-colors ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                <RequestTable
                    requests={filtered}
                    isLoading={isLoading}
                    processingId={processingId}
                    onApprove={(req) => setConfirmModal({ isOpen: true, action: "approve", request: req })}
                    onReject={(req) => setConfirmModal({ isOpen: true, action: "reject", request: req })}
                    onView={handleView}
                />
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Registry Index: {totalElements} Transactions
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="btn btn-outline btn-sm px-4 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Prev
                    </button>
                    <button
                        className="btn btn-outline btn-sm px-4 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                        onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalElements / 5), p + 1))}
                        disabled={currentPage >= Math.ceil(totalElements / 5) || isLoading}
                    >
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.action === "approve" ? "Authorize Transaction" : "Deny Request"}
                message={
                    confirmModal.action === "approve"
                        ? "Are you sure you want to authorize this operation? The card status will be updated immediately in the core registry."
                        : "Are you sure you want to deny this request? This action is irreversible and will be logged for audit."
                }
                confirmLabel={confirmModal.action === "approve" ? "Confirm Authorization" : "Deny Request"}
                confirmClass={confirmModal.action === "approve" ? "btn btn-success" : "btn btn-danger"}
                isLoading={processingId !== null}
                error={modalError}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmModal({ isOpen: false, action: null, request: null })}
            />

            {viewModal.isOpen && viewModal.request && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Request Details</h3>
                            <button onClick={() => setViewModal({ isOpen: false, request: null })} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Request ID</p>
                                    <p className="font-semibold text-slate-900">{viewModal.request.requestId}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                                    <p className="font-semibold text-slate-900">{viewModal.request.statusCode}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Card Number</p>
                                    <p className="font-mono text-sm font-semibold text-slate-900">{viewModal.request.cardNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Mask ID</p>
                                    <p className="font-semibold text-slate-900">{viewModal.request.maskId}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Request Type</p>
                                    <p className="font-semibold text-slate-900">{viewModal.request.requestReasonCode}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Created</p>
                                    <p className="font-semibold text-slate-900">{viewModal.request.createTime ? formatDate(viewModal.request.createTime) : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Requested By</p>
                                    <p className="font-semibold text-slate-900">{viewModal.request.requestUser || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Processed By</p>
                                    <p className="font-semibold text-slate-900">{viewModal.request.approvedUser || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
