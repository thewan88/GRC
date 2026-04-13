import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, fmt) : '—';
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  return formatDate(dateStr, 'dd MMM yyyy, HH:mm');
}

/** Risk/residual score → colour classes */
export function riskLevelColor(level: string | null | undefined): string {
  switch (level) {
    case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'High':     return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium':   return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Low':      return 'bg-green-100 text-green-800 border-green-200';
    default:         return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function riskLevelDot(level: string | null | undefined): string {
  switch (level) {
    case 'Critical': return 'bg-red-500';
    case 'High':     return 'bg-orange-500';
    case 'Medium':   return 'bg-amber-400';
    case 'Low':      return 'bg-green-500';
    default:         return 'bg-gray-300';
  }
}

export function scoreToLevel(score: number): string {
  if (score >= 15) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5)  return 'Medium';
  return 'Low';
}

export function heatMapCellColor(score: number): string {
  if (score >= 15) return 'bg-red-500 hover:bg-red-600';
  if (score >= 10) return 'bg-orange-400 hover:bg-orange-500';
  if (score >= 5)  return 'bg-amber-300 hover:bg-amber-400';
  return 'bg-green-200 hover:bg-green-300';
}

export function controlStatusColor(status: string): string {
  switch (status) {
    case 'Tested':                return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Implemented':           return 'bg-green-100 text-green-800 border-green-200';
    case 'Partially Implemented': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Planned':               return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'Not Implemented':       return 'bg-red-100 text-red-800 border-red-200';
    case 'Not Applicable':        return 'bg-gray-100 text-gray-500 border-gray-200';
    default:                      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function classificationColor(cls: string): string {
  switch (cls) {
    case 'Restricted':   return 'bg-red-100 text-red-800 border-red-200';
    case 'Confidential': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Internal':     return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Public':       return 'bg-green-100 text-green-800 border-green-200';
    default:             return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function fileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
