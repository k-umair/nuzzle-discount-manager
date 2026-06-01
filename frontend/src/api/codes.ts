import { DiscountCode, SummaryResponse, CreateCodePayload } from '../types';

const BASE = 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getCodes(): Promise<DiscountCode[]> {
  const res = await fetch(`${BASE}/codes`);
  return handleResponse<DiscountCode[]>(res);
}

export async function createCode(payload: CreateCodePayload): Promise<DiscountCode> {
  const res = await fetch(`${BASE}/codes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<DiscountCode>(res);
}

export async function redeemCode(id: string): Promise<DiscountCode> {
  const res = await fetch(`${BASE}/codes/${id}/redeem`, { method: 'POST' });
  return handleResponse<DiscountCode>(res);
}

export async function getSummary(): Promise<SummaryResponse> {
  const res = await fetch(`${BASE}/codes/summary`);
  return handleResponse<SummaryResponse>(res);
}
