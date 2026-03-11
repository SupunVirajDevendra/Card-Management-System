import type { Card } from "../../types/card";
import StatusBadge from "../common/StatusBadge";
import { formatCurrency } from "../../utils/format";
import { Edit2, CreditCard } from "lucide-react";

interface CardRowProps {
    card: Card;
    onEdit?: (card: Card) => void;
}

export default function CardRow({ card, onEdit }: CardRowProps) {
    return (
        <tr className="group hover:bg-slate-50 transition-colors">
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-mono text-sm font-black tracking-wider text-slate-900 group-hover:text-blue-600 transition-colors">
                            {card.cardNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            REF: {card.maskId}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6">
                <StatusBadge status={card.statusCode} />
            </td>
            <td className="px-6">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ledger Exposure</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 leading-tight">
                            {formatCurrency(card.availableCreditLimit)}
                            <span className="ml-1.5 text-[10px] text-slate-400 font-normal">/ {formatCurrency(card.creditLimit)}</span>
                        </span>
                        <div className="h-1 w-32 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${card.creditLimit > 0 ? Math.min(100, ((card.creditLimit - card.availableCreditLimit) / card.creditLimit) * 100) : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col opacity-60">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cash Liquidity</span>
                        <span className="text-[10px] font-bold text-slate-700">
                            {formatCurrency(card.availableCashLimit)}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6">
                <span className="text-sm text-slate-600 font-bold tabular-nums">
                    {Array.isArray(card.expiryDate) 
                        ? `${card.expiryDate[0]}-${String(card.expiryDate[1]).padStart(2, '0')}` 
                        : card.expiryDate}
                </span>
            </td>
            <td className="px-6">
                <span className="text-sm font-semibold text-slate-600">
                    {card.lastUpdateUser || "-"}
                </span>
            </td>
            <td className="px-6 text-right">
                <button
                    className="btn btn-sm btn-outline h-9 px-4 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                    onClick={() => onEdit?.(card)}
                >
                    <Edit2 className="h-3 w-3" />
                    Configure
                </button>
            </td>
        </tr>
    );
}
