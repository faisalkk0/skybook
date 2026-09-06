import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'skybook_booking_draft';

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [draft, setDraftState] = useState(() => loadDraft());

  const setDraft = (next) => {
    const value = typeof next === 'function' ? next(draft) : next;
    setDraftState(value);
    if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(STORAGE_KEY);
  };

  const clearDraft = () => setDraft(null);

  const value = useMemo(() => ({ draft, setDraft, clearDraft }), [draft]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
