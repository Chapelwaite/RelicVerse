import { useCallback, useEffect, useState } from 'react';

/**
 * localStorage-თან სინქრონიზებული state.
 * უსაფრთხოა: თუ storage მიუწვდომელია (privacy რეჟიმი), მუშაობს მეხსიერებაში.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota / privacy — ვაგრძელებთ მეხსიერებაში */ }
  }, [key, value]);

  // სხვა ჩანართში ცვლილების აღქმა
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue === null) return;
      try { setValue(JSON.parse(e.newValue)); } catch { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset];
}
