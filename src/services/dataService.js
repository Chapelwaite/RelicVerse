/** dataService — export / import / reset (admin „მონაცემების მართვა") */
import { exportAllData, importAllData, resetToSeeds } from './storageService';
import { validateImport } from '../utils/dataValidation';
import { ApiError } from './apiError';

/** ჩამოტვირთე backup JSON ფაილი */
export function downloadBackup() {
  const data = exportAllData();
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relicverse-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { message: 'მონაცემები წარმატებით ჩამოიტვირთა' };
}

/** წაიკითხე და გადაამოწმე ასატვირთი ფაილი (ჯერ მხოლოდ ვალიდაცია) */
export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new ApiError('ფაილი არ არის არჩეული', 400));
    if (file.type && file.type !== 'application/json' && !file.name.endsWith('.json')) {
      return reject(new ApiError('არჩეული ფაილი RelicVerse-ის სწორ მონაცემებს არ შეიცავს.', 400));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new ApiError('ფაილის წაკითხვა ვერ მოხერხდა', 400));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const { ok, errors, data } = validateImport(parsed);
        if (!ok) {
          return reject(new ApiError('არჩეული ფაილი RelicVerse-ის სწორ მონაცემებს არ შეიცავს.', 400, { details: errors }));
        }
        resolve(data);
      } catch {
        reject(new ApiError('არჩეული ფაილი RelicVerse-ის სწორ მონაცემებს არ შეიცავს.', 400));
      }
    };
    reader.readAsText(file);
  });
}

/** უკვე ვალიდირებული მონაცემების ჩაწერა */
export function applyImport(data) {
  importAllData(data);
  return { message: 'მონაცემები წარმატებით აღდგა ფაილიდან' };
}

/** საწყისი seed მონაცემების აღდგენა */
export function resetData() {
  resetToSeeds();
  return { message: 'საწყისი მონაცემები წარმატებით აღდგა.' };
}
