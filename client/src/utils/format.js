export function formatMoney(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDuration(minutes) {
  const hrs = Math.floor(Number(minutes) / 60);
  const mins = Number(minutes) % 60;
  return `${hrs}h ${mins}m`;
}

export function cabinLabel(value) {
  return (
    {
      economy: 'Economy',
      premiumEconomy: 'Premium Economy',
      business: 'Business',
      first: 'First',
    }[value] || value
  );
}

export function statusTone(status) {
  const map = {
    confirmed: 'bg-emerald-50 text-emerald-700',
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    unpaid: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-700',
    failed: 'bg-red-50 text-red-700',
    refunded: 'bg-slate-100 text-slate-700',
    completed: 'bg-sky-50 text-sky-700',
    scheduled: 'bg-sky-50 text-sky-700',
    delayed: 'bg-amber-50 text-amber-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysInput(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function getApiError(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback;
}
