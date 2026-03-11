export type CardStatus = "IACT" | "CACT" | "DACT";

export interface Card {
    maskId: string;
    cardNumber: string;
    statusCode: CardStatus;
    creditLimit: number;
    cashLimit: number;
    availableCreditLimit: number;
    availableCashLimit: number;
    expiryDate: string | [number, number, number];
    lastUpdateTime: string | [number, number, number, number, number, number, number];
    lastUpdateUser?: string;
}

export interface CardFormData {
    cardNumber: string;
    expiryDate: string;
    creditLimit: number;
    cashLimit: number;
}
