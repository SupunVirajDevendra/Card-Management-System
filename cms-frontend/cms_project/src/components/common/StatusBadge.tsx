import type { CardStatus } from "../../types/card";
import type { RequestStatus } from "../../types/request";

type BadgeStatus = CardStatus | RequestStatus;

interface StatusBadgeProps {
    status: BadgeStatus;
}

const config: Record<BadgeStatus, { label: string; className: string }> = {
    CACT: { label: "Active", className: "badge badge-active" },
    IACT: { label: "Inactive", className: "badge badge-inactive" },
    DACT: { label: "Deactivated", className: "badge badge-deactivated" },
    PENDING: { label: "Pending", className: "badge badge-pending" },
    APPROVED: { label: "Approved", className: "badge badge-approved" },
    REJECTED: { label: "Rejected", className: "badge badge-rejected" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { label, className } = config[status] ?? {
        label: typeof status === 'string' ? status : 'Unknown',
        className: "badge",
    };
    return <span className={className}>{label}</span>;
}
