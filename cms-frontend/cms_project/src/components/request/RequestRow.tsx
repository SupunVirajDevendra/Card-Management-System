import type { Request } from "../../types/request";
import StatusBadge from "../common/StatusBadge";
import { formatDate, requestTypeLabel } from "../../utils/format";
import { Eye } from "lucide-react";

interface RequestRowProps {
    request: Request;
    isProcessing: boolean;
    onApprove: (req: Request) => void;
    onReject: (req: Request) => void;
    onView: (req: Request) => void;
}

export default function RequestRow({
    request,
    isProcessing,
    onApprove,
    onReject,
    onView,
}: RequestRowProps) {
    const isPending = request.statusCode === "PENDING";

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-4">
                <div className="flex flex-col">
                    <span className="font-mono text-sm font-semibold tracking-wider text-slate-900">
                        {request.maskId || "Unknown Instrument"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                        REF: {request.requestId || "N/A"}
                    </span>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {requestTypeLabel(request.requestReasonCode || "")}
                </span>
            </td>
            <td className="px-4 py-4">
                <StatusBadge status={request.statusCode} />
            </td>
            <td className="px-4 py-4">
                <span className="text-xs font-medium text-slate-500">
                    {request.createTime ? formatDate(request.createTime) : "Pending Sync"}
                </span>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm font-semibold text-slate-600">
                    {request.requestUser || "-"}
                </span>
            </td>
            <td className="px-4 py-4">
                <span className="text-sm font-semibold text-slate-600">
                    {request.approvedUser || "-"}
                </span>
            </td>
            <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onView(request)}
                        title="View Details"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </button>
                    {isPending ? (
                        <>
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => onApprove(request)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "..." : "Approve"}
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => onReject(request)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "..." : "Reject"}
                            </button>
                        </>
                    ) : (
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                            Archived
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
}
