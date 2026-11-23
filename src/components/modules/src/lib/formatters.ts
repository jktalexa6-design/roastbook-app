export function formatRupiah(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'Rp 0';
  const rounded = Math.round(value);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded);
}

export function formatRupiahDetailed(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '0';
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatKg(value: number): string {
  return `${formatNumber(value, 2)} Kg`;
}

export function formatGram(value: number): string {
  return `${formatNumber(value, 0)} g`;
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

export function formatDateIndo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}
