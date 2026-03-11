import type { Card } from "../../types/card";
import CardRow from "./CardRow";

interface CardTableProps {
    cards: Card[];
    isLoading: boolean;
    onEdit?: (card: Card) => void;
}

export default function CardTable({ cards = [], isLoading, onEdit }: CardTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="data-table">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Card Instrument</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operational Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Liquidity & Limits</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expire Date</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Updated By</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Edit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={6} className="px-4 py-4">
                                    <div className="h-4 w-full rounded bg-slate-100" />
                                </td>
                            </tr>
                        ))
                    ) : cards.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-4xl">📇</span>
                                    <p className="text-base font-semibold text-slate-900">No cards found</p>
                                    <p className="text-sm text-slate-500">Try adjusting your search or issue a new card.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        cards.map((card) => (
                            <CardRow key={card.maskId} card={card} onEdit={onEdit} />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
