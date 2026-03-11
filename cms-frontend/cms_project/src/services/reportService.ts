import type { Card } from "../types/card";
import type { Request } from "../types/request";
import { getToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const REPORTS_ENDPOINT = import.meta.env.VITE_API_REPORTS || "/api/reports";

export interface ReportFilters {
    startDate: string;
    endDate: string;
    status?: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

export async function getCardReportData(filters: ReportFilters): Promise<Card[]> {
    const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
    });
    if (filters.status) {
        params.append("status", filters.status);
    }
    const response = await fetchWithAuth(`${API_BASE_URL}${REPORTS_ENDPOINT}/data/cards?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch card report data");
    }
    return response.json();
}

export async function getRequestReportData(filters: ReportFilters): Promise<Request[]> {
    const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
    });
    if (filters.status) {
        params.append("status", filters.status);
    }
    const response = await fetchWithAuth(`${API_BASE_URL}${REPORTS_ENDPOINT}/data/requests?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch request report data");
    }
    return response.json();
}

export async function downloadCardReportCsv(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: "csv",
    });
    if (filters.status) {
        params.append("status", filters.status);
    }
    const response = await fetchWithAuth(`${API_BASE_URL}${REPORTS_ENDPOINT}/cards?${params}`);
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to download CSV");
    }
    
    const blob = await response.blob();
    
    if (!contentType?.includes("csv") || blob.size < 10) {
        const text = await blob.text();
        throw new Error(text || "Backend did not return valid CSV data");
    }
    
    return blob;
}

export async function downloadCardReportPdf(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: "pdf",
    });
    if (filters.status) {
        params.append("status", filters.status);
    }
    const response = await fetchWithAuth(`${API_BASE_URL}${REPORTS_ENDPOINT}/cards?${params}`);
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to download PDF");
    }
    
    const blob = await response.blob();
    
    if (!contentType?.includes("pdf") || blob.size < 1000) {
        const text = await blob.text();
        throw new Error(text || "Backend did not return a valid PDF");
    }
    
    return blob;
}

export async function downloadRequestReportCsv(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: "csv",
    });
    if (filters.status) {
        params.append("status", filters.status);
    }
    const response = await fetchWithAuth(`${API_BASE_URL}${REPORTS_ENDPOINT}/requests?${params}`);
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to download CSV");
    }
    
    const blob = await response.blob();
    
    if (!contentType?.includes("csv") || blob.size < 10) {
        const text = await blob.text();
        throw new Error(text || "Backend did not return valid CSV data");
    }
    
    return blob;
}

export async function downloadRequestReportPdf(filters: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: "pdf",
    });
    if (filters.status) {
        params.append("status", filters.status);
    }
    const response = await fetchWithAuth(`${API_BASE_URL}${REPORTS_ENDPOINT}/requests?${params}`);
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to download PDF");
    }
    
    const blob = await response.blob();
    
    if (!contentType?.includes("pdf") || blob.size < 1000) {
        const text = await blob.text();
        throw new Error(text || "Backend did not return a valid PDF");
    }
    
    return blob;
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export function saveCardReportCsv(data: Blob, filename?: string): void {
    const defaultName = `card-report-${new Date().toISOString().split("T")[0]}.csv`;
    downloadBlob(data, filename || defaultName);
}

export function saveCardReportPdf(data: Blob, filename?: string): void {
    const defaultName = `card-report-${new Date().toISOString().split("T")[0]}.pdf`;
    downloadBlob(data, filename || defaultName);
}

export function saveRequestReportCsv(data: Blob, filename?: string): void {
    const defaultName = `request-report-${new Date().toISOString().split("T")[0]}.csv`;
    downloadBlob(data, filename || defaultName);
}

export function saveRequestReportPdf(data: Blob, filename?: string): void {
    const defaultName = `request-report-${new Date().toISOString().split("T")[0]}.pdf`;
    downloadBlob(data, filename || defaultName);
}
