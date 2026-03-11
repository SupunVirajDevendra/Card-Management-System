interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center gap-1">
            <button
                className="btn btn-outline btn-sm px-2 sm:px-3"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center gap-1 mx-2">
                {pages.map((page) => (
                    <button
                        key={page}
                        className={`h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                className="btn btn-outline btn-sm px-2 sm:px-3"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">→</span>
            </button>
        </div>
    );
}
