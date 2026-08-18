export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '--%';
  }
  return `${Number(val).toFixed(1)}%`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '--';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timestamp: string | null | undefined): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
