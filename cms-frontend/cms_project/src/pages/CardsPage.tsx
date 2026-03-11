import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Card } from "../types/card";
import { getCards, getCardById } from "../services/cardService";
import CardTable from "../components/card/CardTable";
import Pagination from "../components/common/Pagination";
import { Search, Plus } from "lucide-react";

import toast from "react-hot-toast";

const PAGE_SIZE = 5;

export default function CardsPage() {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

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
        const fetchCards = async () => {
            setIsLoading(true);
            try {
                if (search.trim()) {
                    try {
                        const card = await getCardById(search.trim());
                        setCards([card]);
                        setTotalElements(1);
                    } catch {
                        setCards([]);
                        setTotalElements(0);
                    }
                } else {
                    const data = await getCards(currentPage - 1, PAGE_SIZE);
                    setCards(data.content);
                    setTotalElements(data.totalElements);
                }
            } catch (err) {
                console.error("Failed to load cards:", err);
                toast.error("Failed to load cards. Please check backend connection.");
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchCards, search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [currentPage, search]);

    const totalPages = Math.ceil(totalElements / PAGE_SIZE);

    const handleEdit = (card: Card) => {
        navigate(`/cards/${card.maskId}`);
    };

    return (
        <div className="page">
            <div className="page-header flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">

                    <div>
                        <p className="page-subtitle text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Central Ledger System</p>
                    </div>
                </div>
                <button
                    className="btn btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full md:w-auto justify-center"
                    onClick={() => navigate("/cards/new")}
                >
                    <Plus className="h-5 w-5" />
                    <span>Issue New Card</span>
                </button>
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

            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                <CardTable cards={cards} isLoading={isLoading} onEdit={handleEdit} />
            </div>

            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Index Registry: {totalElements} Records Found
                    </p>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
