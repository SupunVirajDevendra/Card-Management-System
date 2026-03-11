import type { Request } from "../../types/request";
import RequestRow from "./RequestRow";

interface RequestTableProps {
    requests: Request[];
    isLoading: boolean;
    processingId: string | number | null;
    onApprove: (req: Request) => void;
    onReject: (req: Request) => void;
    onView: (req: Request) => void;
}

export default function RequestTable({
    requests,
    isLoading,
    processingId,
    onApprove,
    onReject,
    onView,
}: RequestTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Workflow</th>
                        <th>Timestamp</th>
                        <th>Requested By</th>
                        <th>Processed By</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={7} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded" /></td>
                            </tr>
                        ))
                    ) : requests.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-4xl">📂</span>
                                    <p className="text-base font-semibold text-slate-900">Queue is clear</p>
                                    <p className="text-sm text-slate-500">No requests were found for this criteria.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        requests.map((req) => (
                            <RequestRow
                                key={req.requestId}
                                request={req}
                                isProcessing={processingId === req.requestId}
                                onApprove={onApprove}
                                onReject={onReject}
                                onView={onView}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
