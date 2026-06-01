import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" }
});

export async function apiGet<T>(url: string, token?: string) {
  const res = await api.get<T>(url, authConfig(token));
  return res.data;
}

export async function apiPost<T>(url: string, data?: unknown, token?: string) {
  const res = await api.post<T>(url, data, authConfig(token));
  return res.data;
}

export async function apiPostCsv<T>(url: string, csv: string, token: string, fileName: string) {
  const res = await api.post<T>(url, csv, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-File-Name": encodeURIComponent(fileName)
    }
  });
  return res.data;
}

export async function apiPut<T>(url: string, data?: unknown, token?: string) {
  const res = await api.put<T>(url, data, authConfig(token));
  return res.data;
}

export async function apiPatch<T>(url: string, data?: unknown, token?: string) {
  const res = await api.patch<T>(url, data, authConfig(token));
  return res.data;
}

export async function apiDelete<T>(url: string, token?: string) {
  const res = await api.delete<T>(url, authConfig(token));
  return res.data;
}

function authConfig(token?: string) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return String(error.response?.data?.message || error.message);
  }
  return error instanceof Error ? error.message : "Có lỗi xảy ra";
}
