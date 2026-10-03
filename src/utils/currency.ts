export function parseAmount(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = val.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'MXN',
  includeCurrencyCode: boolean = false
): string {
  const num = parseAmount(amount);
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency && currency.length === 3 ? currency : 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  if (includeCurrencyCode && currency) {
    return `${formatted} ${currency}`;
  }
  return formatted;
}

export function formatNumber(
  amount: number | undefined | null,
  decimals: number = 2
): string {
  const num = parseAmount(amount);
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatRate(rate: number | undefined | null): string {
  if (rate === undefined || rate === null || isNaN(rate)) return '—';
  const percentage = (rate * 100).toFixed(2);
  return `${percentage}% (${rate.toFixed(4)})`;
}
