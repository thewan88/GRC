import useSWR from 'swr';
import api from '@/lib/api';
import type { DashboardSummary, HeatMapCell, RiskTrendPoint, Risk, UpcomingItem } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export function useDashboardSummary()     { return useSWR<DashboardSummary>('/dashboard/summary', fetcher); }
export function useHeatMap()              { return useSWR<HeatMapCell[]>('/dashboard/heat-map', fetcher); }
export function useRiskTrend()            { return useSWR<RiskTrendPoint[]>('/dashboard/risk-trend', fetcher); }
export function useTopRisks()             { return useSWR<Risk[]>('/dashboard/top-risks', fetcher); }
export function useUpcomingReviews()      { return useSWR<UpcomingItem[]>('/dashboard/upcoming', fetcher); }
export function useTreatmentStatus()      { return useSWR<{ overdue: number; dueSoon: number; onTrack: number }>('/dashboard/treatment-status', fetcher); }
