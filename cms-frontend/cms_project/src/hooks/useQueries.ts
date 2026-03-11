import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCards, getCardById, createCard, updateCard, updateCardStatus, submitCardRequest, getCardStats } from "../services/cardService";
import type { Card, CardFormData } from "../types/card";
import { getRequests, getRequestById, processRequest, createRequest, getPendingCount, getPendingRequestForCard } from "../services/requestService";

export function useCards(page: number = 0, size: number = 5) {
    return useQuery({
        queryKey: ["cards", page, size],
        queryFn: () => getCards(page, size),
    });
}

export function useCardById(maskId: string) {
    return useQuery({
        queryKey: ["card", maskId],
        queryFn: () => getCardById(maskId),
        enabled: !!maskId,
    });
}

export function useCreateCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CardFormData) => createCard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cards"] });
        },
    });
}

export function useUpdateCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ maskId, data }: { maskId: string; data: Partial<CardFormData> }) => updateCard(maskId, data),
        onSuccess: (_, { maskId }) => {
            queryClient.invalidateQueries({ queryKey: ["cards"] });
            queryClient.invalidateQueries({ queryKey: ["card", maskId] });
        },
    });
}

export function useUpdateCardStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ maskId, status }: { maskId: string; status: Card["statusCode"] }) => updateCardStatus(maskId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cards"] });
        },
    });
}

export function useSubmitCardRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ maskId, reasonCode }: { maskId: string; reasonCode: "ACTI" | "CDCL" }) => submitCardRequest(maskId, reasonCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
        },
    });
}

export function useCardStats() {
    return useQuery({
        queryKey: ["cardStats"],
        queryFn: getCardStats,
    });
}

export function useRequests(page: number = 0, size: number = 10) {
    return useQuery({
        queryKey: ["requests", page, size],
        queryFn: () => getRequests(page, size),
    });
}

export function useRequestById(id: number | string) {
    return useQuery({
        queryKey: ["request", id],
        queryFn: () => getRequestById(id),
        enabled: !!id,
    });
}

export function useProcessRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, approve }: { id: number | string; approve: boolean }) => processRequest(id, approve),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            queryClient.invalidateQueries({ queryKey: ["cardStats"] });
        },
    });
}

export function useCreateRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ maskId, type }: { maskId: string; type: "ACTI" | "CDCL" | "CACT" | "DACT" }) => createRequest(maskId, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
        },
    });
}

export function usePendingCount() {
    return useQuery({
        queryKey: ["pendingCount"],
        queryFn: getPendingCount,
    });
}

export function usePendingRequestForCard(maskId: string) {
    return useQuery({
        queryKey: ["pendingRequest", maskId],
        queryFn: () => getPendingRequestForCard(maskId),
        enabled: !!maskId,
    });
}
