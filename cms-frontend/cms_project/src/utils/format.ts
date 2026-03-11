export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateValue: string | [number, number, number, number, number, number, number]): string {
    let date: Date;
    
    if (Array.isArray(dateValue)) {
        date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], dateValue[3], dateValue[4], dateValue[5]);
    } else {
        date = new Date(dateValue);
    }
    
    if (isNaN(date.getTime())) {
        return "-";
    }
    
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function maskCardNumber(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 4) return raw;
    const last4 = digits.slice(-4);
    return `****-****-****-${last4}`;
}

export function requestTypeLabel(type: string): string {
    const map: Record<string, string> = {
        ACTI: "Activate Card",
        CDCL: "Cancel Card",
        CACT: "Activate Card",
        DACT: "Deactivate Card",
    };
    return map[type] ?? type;
}
