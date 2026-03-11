import { useEffect } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmClass?: string;
    isLoading?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    confirmClass = "btn btn-primary",
    isLoading = false,
    error = null,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isLoading) onCancel();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={!isLoading ? onCancel : undefined}>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />

            <div
                className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                </div>

                <div className="mb-6">
                    <p className="text-sm leading-relaxed text-slate-500">{message}</p>
                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 italic">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        className="btn btn-ghost order-2 sm:order-1"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Go Back
                    </button>
                    <button
                        className={`${confirmClass} order-1 sm:order-2 min-w-[120px]`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Working...
                            </span>
                        ) : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
