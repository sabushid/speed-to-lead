"use client";

import useSWR from "swr";
import type { Lead } from "@/lib/types/lead";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLeads() {
  const { data, error, isLoading, mutate } = useSWR<{ leads: Lead[]; total: number }>(
    "/api/leads",
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    leads: data?.leads ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useLead(leadId: string) {
  const { data, error, isLoading, mutate } = useSWR<Lead>(
    leadId ? `/api/leads/${leadId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  return {
    lead: data ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}
