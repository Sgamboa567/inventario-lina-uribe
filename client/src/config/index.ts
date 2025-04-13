export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TOAST_DURATION: 3000,
  DEFAULT_CURRENCY: 'COP',
  DEFAULT_LOCALE: 'es-CO',
};

export const CURRENCY_FORMAT = new Intl.NumberFormat(CONFIG.DEFAULT_LOCALE, {
  style: 'currency',
  currency: CONFIG.DEFAULT_CURRENCY,
  minimumFractionDigits: 0
});

export const DATE_FORMAT = new Intl.DateTimeFormat(CONFIG.DEFAULT_LOCALE, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});