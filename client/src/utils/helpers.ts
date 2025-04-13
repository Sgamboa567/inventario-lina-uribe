import { CONFIG, CURRENCY_FORMAT, DATE_FORMAT } from '../config';

export const formatCurrency = (amount: number): string => {
  return CURRENCY_FORMAT.format(amount);
};

export const formatDate = (date: string | Date): string => {
  return DATE_FORMAT.format(new Date(date));
};

export const getStockStatus = (current: number, threshold: number) => {
  if (current === 0) return 'out';
  if (current <= threshold) return 'low';
  return 'normal';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};