import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CardFormData } from "../types/card";
import { createCard, getCardById, updateCard } from "../services/cardService";
import toast from "react-hot-toast";
import { CreditCard, Calendar, Wallet, Banknote, Save, X, ArrowLeft, ShieldCheck, Info } from "lucide-react";

interface FormErrors {
    cardNumber?: string;
    expiryDate?: string;
    creditLimit?: string;
    cashLimit?: string;
}

export default function CardFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<CardFormData>({
        cardNumber: "",
        expiryDate: "",
        creditLimit: 0,
        cashLimit: 0,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEdit);

    const isFormValid = useMemo(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getFullYear() * 12 + currentDate.getMonth();

        // Card Number (only for new cards)
        if (!isEdit) {
            if (!form.cardNumber.trim() || form.cardNumber.replace(/\D/g, "").length < 16) {
                return false;
            }
        }

        // Expiry Date
        if (!form.expiryDate) return false;
        const [year, month] = form.expiryDate.split('-').map(Number);
        const selectedMonth = year * 12 + (month - 1);
        if (selectedMonth < currentMonth) return false;

        // Limits
        if (!form.creditLimit || form.creditLimit <= 0) return false;
        if (!form.cashLimit || form.cashLimit <= 0) return false;
        if (form.cashLimit > form.creditLimit * 0.5) return false;

        return true;
    }, [form, isEdit]);

    useEffect(() => {
        if (isEdit && id) {
            setIsFetching(true);

            getCardById(id)
                .then((card) => {
                    if (card) {
                        const monthValue = Array.isArray(card.expiryDate)
                            ? `${card.expiryDate[0]}-${String(card.expiryDate[1]).padStart(2, '0')}`
                            : card.expiryDate.split("-").slice(0, 2).join("-");
                        setForm({
                            cardNumber: card.cardNumber,
                            expiryDate: monthValue,
                            creditLimit: card.creditLimit,
                            cashLimit: card.cashLimit,
                        });
                    }
                })
                .catch(() => {
                    toast.error("Failed to load card details.");
                })
                .finally(() => {
                    setIsFetching(false);
                });
        }
    }, [id, isEdit]);

    const validate = (): boolean => {
        const errs: FormErrors = {};
        const currentDate = new Date();
        const currentMonth = currentDate.getFullYear() * 12 + currentDate.getMonth();

        if (!isEdit) {
            if (!form.cardNumber.trim()) {
                errs.cardNumber = "Card number is required.";
            } else if (form.cardNumber.replace(/\D/g, "").length < 16) {
                errs.cardNumber = "Card number must be 16 digits.";
            }
        }
        if (!form.expiryDate) {
            errs.expiryDate = "Expiry date is required.";
        } else {
            const [year, month] = form.expiryDate.split('-').map(Number);
            const selectedMonth = year * 12 + (month - 1); // zero-indexed month

            if (selectedMonth < currentMonth) {
                errs.expiryDate = "Expiry date cannot be in the past.";
            }
        }
        if (!form.creditLimit || form.creditLimit <= 0) {
            errs.creditLimit = "Credit limit must be greater than 0.";
        }
        if (!form.cashLimit || form.cashLimit <= 0) {
            errs.cashLimit = "Cash limit must be greater than 0.";
        }
        if (form.cashLimit > form.creditLimit * 0.5) {
            errs.cashLimit = "Cash limit cannot exceed 50% of credit limit.";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const isCashLimitInvalid = form.creditLimit > 0 && form.cashLimit > form.creditLimit * 0.5;

    const handleChange = (field: keyof CardFormData, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        // Clear specific error when user types, but derived errors (like checks) will still show if condition persists
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        try {
            if (isEdit && id) {
                const { cardNumber, ...updateData } = form;
                await updateCard(id, updateData);
                toast.success("Global Ledger Updated", { icon: "🛡️" });
            } else {
                await createCard(form);
                toast.success("New Instrument Provisioned", { icon: "💳" });
            }
            navigate("/cards");
        } catch {
            toast.error("Endpoint Connection Fault: Save failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const FormSkeleton = () => (
        <div className="animate-pulse space-y-8">
            <div className="h-6 w-1/3 bg-slate-100 rounded" />
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-12 bg-slate-100 rounded-xl w-2/3" />
            </div>
            <div className="flex justify-end gap-3 pt-6">
                <div className="h-10 w-24 bg-slate-100 rounded-lg" />
                <div className="h-10 w-32 bg-slate-100 rounded-lg" />
            </div>
        </div>
    );

    if (isFetching) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Synchronizing Ledger...</p>
            </div>
        );
    }

    return (
        <div className="page max-w-6xl 2xl:max-w-7xl animate-[fade-in_0.4s_ease-out]">
            <div className="page-header mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate("/cards")}
                        className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                    >
                        <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {isEdit ? "Card Parameters" : "Provisioning Suite"}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isEdit ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                                {isEdit ? "Modification" : "Initial Issuance"}
                            </span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">
                            Ledger Authority: Global CMS-V4
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 2xl:gap-14">
                <div className="lg:col-span-12 xl:col-span-8 2xl:col-span-7">
                    <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/5">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                            <div className="flex items-center gap-3">
                                <Info className="h-4 w-4 text-blue-500" />
                                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Resource Attributes</h3>
                            </div>
                            {isEdit && <span className="text-[10px] font-mono font-bold text-slate-400">UID: {id}</span>}
                        </div>

                        <div className="p-10">
                            {isFetching ? <FormSkeleton /> : (
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                                        <div className="form-group col-span-1 md:col-span-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4" htmlFor="cardNumber">
                                                <CreditCard className="h-4 w-4 text-slate-300" />
                                                Primary Display Reference (PAN)
                                            </label>
                                            <div className="relative group">
                                                <input
                                                    id="cardNumber"
                                                    className={`form-input h-16 pl-6 text-xl font-mono tracking-[0.25em] shadow-sm transition-all duration-300 border-2 ${errors.cardNumber ? "border-red-500 bg-red-50/20 ring-red-500/5" : "border-slate-100 focus:border-blue-500 focus:ring-[12px] focus:ring-blue-500/5"}`}
                                                    type="text"
                                                    placeholder="0000000000000000"
                                                    value={form.cardNumber}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                        handleChange("cardNumber", val);
                                                    }}
                                                    disabled={isEdit}
                                                    maxLength={16}
                                                />
                                                {isEdit && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                                                    </div>
                                                )}
                                            </div>
                                            {errors.cardNumber && <p className="mt-3 text-[11px] font-bold text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> {errors.cardNumber}</p>}
                                        </div>

                                        <div className="form-group">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4" htmlFor="expiryDate">
                                                <Calendar className="h-4 w-4 text-slate-300" />
                                                Calendar Expiry
                                            </label>
                                            <input
                                                id="expiryDate"
                                                className={`form-input h-14 px-6 font-black shadow-sm transition-all duration-300 border-2 ${errors.expiryDate ? "border-red-500 bg-red-50/20" : "border-slate-100 focus:border-blue-500 focus:ring-[12px] focus:ring-blue-500/5"}`}
                                                type="month"
                                                min={new Date().toISOString().slice(0, 7)}
                                                value={form.expiryDate}
                                                onChange={(e) => handleChange("expiryDate", e.target.value)}
                                            />
                                            {errors.expiryDate && <p className="mt-3 text-[11px] font-bold text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> {errors.expiryDate}</p>}
                                        </div>

                                        <div className="form-group">
                                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4" htmlFor="creditLimit">
                                                <Wallet className="h-4 w-4 text-slate-300" />
                                                Credit Allocation
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xs">LKR</span>
                                                <input
                                                    id="creditLimit"
                                                    className={`form-input h-14 pl-16 font-black shadow-sm transition-all duration-300 border-2 ${errors.creditLimit ? "border-red-500 bg-red-50/20" : "border-slate-100 focus:border-blue-500 focus:ring-[12px] focus:ring-blue-500/5"}`}
                                                    type="number"
                                                    placeholder="0"
                                                    value={form.creditLimit || ""}
                                                    onChange={(e) => handleChange("creditLimit", Number(e.target.value))}
                                                />
                                            </div>
                                            {errors.creditLimit && <p className="mt-3 text-[11px] font-bold text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> {errors.creditLimit}</p>}
                                        </div>

                                        <div className="form-group md:col-span-2">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="cashLimit">
                                                    <Banknote className="h-4 w-4 text-slate-300" />
                                                    Cash Liquidity Threshold
                                                </label>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Max: 50% of Credit Allocation</span>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xs">LKR</span>
                                                <input
                                                    id="cashLimit"
                                                    className={`form-input h-14 pl-16 font-black shadow-sm transition-all duration-300 border-2 ${(errors.cashLimit || isCashLimitInvalid) ? "border-red-500 bg-red-50/20" : "border-slate-100 focus:border-blue-500 focus:ring-[12px] focus:ring-blue-500/5"}`}
                                                    type="number"
                                                    placeholder="0"
                                                    value={form.cashLimit || ""}
                                                    onChange={(e) => handleChange("cashLimit", Number(e.target.value))}
                                                />
                                            </div>
                                            {(errors.cashLimit || isCashLimitInvalid) && (
                                                <p className="mt-3 text-[11px] font-bold text-red-500 flex items-center gap-1">
                                                    <X className="h-3 w-3" />
                                                    {errors.cashLimit || "Cash limit cannot exceed 50% of credit allocation."}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-16 flex items-center justify-end gap-5 pt-10 border-t border-slate-100">
                                        <button
                                            type="button"
                                            className="h-14 px-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
                                            onClick={() => navigate("/cards")}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                            Abort Changes
                                        </button>
                                        <button
                                            type="submit"
                                            className="h-14 px-10 rounded-2xl bg-blue-600 text-white shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
                                            disabled={isLoading || !isFormValid}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    Syncing...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Commit to Registry
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 xl:col-span-4 2xl:col-span-5 space-y-8 animate-[fade-in-up_0.6s_ease-out]">
                    <div className="group aspect-[1.586/1] rounded-[3rem] bg-slate-900 p-6 md:p-10 2xl:p-14 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden transition-all duration-500 hover:shadow-blue-500/20">
                        {/* Dynamic Background Mesh */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px] group-hover:bg-blue-600/30 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-40 w-40 rounded-full bg-indigo-600/10 blur-[60px]" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Holographic Preview
                                </h4>
                                <div className="h-7 w-10 md:h-8 md:w-12 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                                    <div className="h-3 w-5 md:h-4 md:w-6 rounded bg-blue-500/10 border border-blue-500/20" />
                                </div>
                            </div>

                            <div className="space-y-4 md:space-y-8">
                                <div className="font-mono text-lg md:text-xl xl:text-2xl tracking-[0.2em] h-10 flex items-center drop-shadow-2xl whitespace-nowrap overflow-hidden">
                                    {form.cardNumber
                                        ? (form.cardNumber.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || form.cardNumber)
                                        : "•••• •••• •••• ••••"
                                    }
                                </div>

                                <div className="flex justify-between items-end gap-2">
                                    <div className="flex gap-6 md:gap-12">
                                        <div className="space-y-1 md:space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Auth Expiry</p>
                                            <p className="font-black text-sm md:text-[1.2rem] tabular-nums tracking-widest whitespace-nowrap">
                                                {form.expiryDate
                                                    ? `${form.expiryDate.split("-")[1] || "MM"} / ${form.expiryDate.split("-")[0].slice(-2) || "YY"}`
                                                    : "MM / YY"
                                                }
                                            </p>
                                        </div>
                                        <div className="space-y-1 md:space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Cardholder</p>
                                            <p className="font-black text-[10px] md:text-sm uppercase tracking-widest truncate max-w-[150px] whitespace-nowrap">Authorized User</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-12 md:h-12 md:w-16 rounded-xl bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-400 shadow-xl shadow-amber-900/40 relative overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[3rem] border border-slate-200 bg-white p-10 2xl:p-14 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 2xl:mb-10">
                            <div className="flex h-8 w-8 2xl:h-12 2xl:w-12 items-center justify-center rounded-lg 2xl:rounded-xl bg-green-50 text-green-500">
                                <ShieldCheck className="h-5 w-5 2xl:h-8 2xl:w-8" />
                            </div>
                            <h4 className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-400">Governance Policy</h4>
                        </div>
                        <div className="space-y-6 2xl:space-y-8">
                            {[
                                "PAN attributes are permanent after first sync",
                                "Liquidity thresholds verified via Core Engine",
                                "Multi-factor authorization required for commits",
                                "Real-time audit log streaming enabled"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-1.5 w-1.5 2xl:h-2 2xl:w-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    <p className="text-[11px] 2xl:text-base font-bold text-slate-500 leading-tight">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
