import { useEffect, useState } from "react";
import type { Card } from "../types/card";
import { getCards, getCardById } from "../services/cardService";
import { createRequest, getRequests } from "../services/requestService";
import { formatCurrency } from "../utils/format";
import StatusBadge from "../components/common/StatusBadge";
import ConfirmModal from "../components/common/ConfirmModal";
import toast from "react-hot-toast";
import { Search, ShieldAlert, XCircle, Zap, Ban, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

const PAGE_SIZE = 5;

export default function CreateRequestPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        action: "activate" | "deactivate" | null;
        card: Card | null;
    }>({ isOpen: false, action: null, card: null });

    const handleSearch = () => {
        setSearch(searchInput);
        setCurrentPage(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [cardsData, requestsData] = await Promise.all([
                    search.trim() 
                        ? getCardById(search.trim()).then(card => ({ content: [card], totalElements: 1 })).catch(() => ({ content: [], totalElements: 0 }))
                        : getCards(currentPage - 1, PAGE_SIZE),
                    getRequests(0, 100).catch(() => ({ content: [], totalElements: 0 }))
                ]);

                setCards(cardsData.content);
                setTotalElements(cardsData.totalElements);

                const pendingSet = new Set<string>();
                requestsData.content.forEach((req: any) => {
                    if (req.statusCode === "PENDING") {
                        if (req.maskId) pendingSet.add(req.maskId);
                        if (req.cardIdentifier) pendingSet.add(req.cardIdentifier);
                    }
                });
                setSubmittedIds(pendingSet);
            } catch (err) {
                console.error("Failed to load data:", err);
                toast.error("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchData, search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, search]);

    const totalPages = Math.ceil(totalElements / PAGE_SIZE);


    const hasOutstandingBalance = (card: Card) => {
        return card.availableCreditLimit < card.creditLimit;
    };

    const handleConfirm = async () => {
        if (!confirmModal.card || !confirmModal.action) return;

        const { card, action } = confirmModal;
        setProcessingId(card.maskId);

        try {
            const requestType = action === "activate" ? "ACTI" : "CDCL";
            await createRequest(card.maskId, requestType);

            toast.success(
                action === "activate"
                    ? `Activation request created for ${card.cardNumber}`
                    : `Deactivation request created for ${card.cardNumber}`
            );

            setSubmittedIds(prev => new Set(prev).add(card.maskId));
            setConfirmModal({ isOpen: false, action: null, card: null });
        } catch (err) {
            console.error("Failed to lodge request:", err);
            const errorMsg = err instanceof Error ? err.message : "Failed to create request";
            toast.error(errorMsg);
        } finally {
            setProcessingId(null);
        }
    };

    const getActionButton = (card: Card) => {
        const isPending = submittedIds.has(card.maskId);
        const isProcessing = processingId === card.maskId;

        if (card.statusCode === "IACT") {
            return (
                <button
                    className="btn btn-sm btn-success flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                    onClick={() => setConfirmModal({ isOpen: true, action: "activate", card })}
                    disabled={isProcessing || isPending}
                >
                    <Zap className="h-3.5 w-3.5" />
                    <span>
                        {isProcessing ? "..." : isPending ? "LODGED" : "Activate"}
                    </span>
                </button>
            );
        }

        if (card.statusCode === "CACT") {
            const hasBalance = hasOutstandingBalance(card);
            return (
                <button
                    className="btn btn-sm btn-danger flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                    onClick={() => setConfirmModal({ isOpen: true, action: "deactivate", card })}
                    disabled={isProcessing || hasBalance || isPending}
                    title={hasBalance ? "Cannot deactivate: Outstanding balance exists" : isPending ? "Request already submitted" : undefined}
                >
                    <Ban className="h-3.5 w-3.5" />
                    <span>
                        {isProcessing ? "..." : isPending ? "LODGED" : "Deactivate"}
                    </span>
                </button>
            );
        }

        return <span className="text-slate-400 font-bold opacity-30">—</span>;
    };

    return (
        <div className="page">
            <div className="page-header flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="page-subtitle text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Transition Workflow Queue</p>
                </div>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Identify card number"
                        className="form-input h-12 pl-12 pr-24 bg-white border-slate-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold text-slate-900"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="bg-slate-50/50">Primary Identifier</th>
                                <th className="bg-slate-50/50">Operational Status</th>
                                <th className="bg-slate-50/50">Credit Exposure</th>
                                <th className="bg-slate-50/50 text-right">Workflow Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="py-6 px-6"><div className="h-4 bg-slate-50 rounded-full w-3/4" /></td>
                                    </tr>
                                ))
                            ) : cards.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                                <XCircle className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No manageable cards found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                cards.map((card) => (
                                    <tr key={card.maskId} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-black text-slate-900 tracking-wider group-hover:text-blue-600 transition-colors">{card.cardNumber}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">ID Ref: {card.maskId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={card.statusCode} />
                                            </div>
                                        </td>
                                        <td className="px-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black text-slate-900">{formatCurrency(card.availableCreditLimit)}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Available</span>
                                                </div>
                                                {hasOutstandingBalance(card) && (
                                                    <div className="flex items-center gap-1 mt-1 text-red-500">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                                            Outstanding Balance Detected
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 text-right">{getActionButton(card)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shadow-inner">
                        <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Batch Index: {currentPage} of {totalPages || 1}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="btn btn-outline btn-sm px-4 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Previous
                    </button>
                    <button
                        className="btn btn-outline btn-sm px-4 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages || isLoading}
                    >
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.action === "activate" ? "Security Action: Activate" : "Security Action: Deactivate"}
                message={
                    confirmModal.action === "activate"
                        ? `Are you sure you want to authorize an activation request for card ending in ${confirmModal.card?.cardNumber.slice(-4)}?`
                        : `Are you sure you want to authorize a deactivation request for card ending in ${confirmModal.card?.cardNumber.slice(-4)}?`
                }
                confirmLabel={confirmModal.action === "activate" ? "Authorize Activation" : "Authorize Deactivation"}
                confirmClass={confirmModal.action === "activate" ? "btn btn-success" : "btn btn-danger"}
                isLoading={processingId !== null}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmModal({ isOpen: false, action: null, card: null })}
            />
        </div>
    );
}
