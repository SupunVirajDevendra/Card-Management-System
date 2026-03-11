export type RequestType = "ACTI" | "CDCL" | "CACT" | "DACT";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Request {
    requestId: number;
    maskId: string;
    cardNumber: string;
    cardIdentifier?: string;
    requestReasonCode: RequestType;
    statusCode: RequestStatus;
    createTime: string | [number, number, number, number, number, number, number];
    requestUser?: string;
    approvedUser?: string;
}