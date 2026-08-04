/** promoService — პრომოკოდების admin მართვა */
import { getData, setData, updateData } from './storageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { validate, sanitize } from '../utils/dataValidation';
import { ApiError } from './apiError';

export const adminListPromos = () => getData(STORAGE_KEYS.PROMO_CODES);

export function adminCreatePromo(body) {
  const { valid, errors } = validate(body, {
    code: { required: true, minLength: 3, maxLength: 20, label: 'კოდი' },
    value: { required: true, type: 'number', min: 1, max: 90, label: 'ფასდაკლება' },
  });
  if (!valid) throw new ApiError('შეავსეთ ველები', 400, errors);

  const list = getData(STORAGE_KEYS.PROMO_CODES);
  const code = String(body.code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (list.some((p) => p.code === code)) throw new ApiError('ასეთი კოდი უკვე არსებობს', 409);

  const item = {
    code,
    type: body.type === 'fixed' ? 'fixed' : 'percent',
    value: Number(body.value),
    minTotal: Math.max(0, Number(body.minTotal) || 0),
    maxUses: Math.max(0, parseInt(body.maxUses, 10) || 0),
    used: 0,
    expiresAt: body.expiresAt || null,
    active: body.active !== false,
    description: sanitize(body.description, 120),
  };
  setData(STORAGE_KEYS.PROMO_CODES, [...list, item]);
  return { item, message: 'პრომოკოდი დაემატა' };
}

export function adminUpdatePromo(code, body) {
  let updated = null;
  updateData(STORAGE_KEYS.PROMO_CODES, (list) =>
    list.map((p) => (p.code === code
      ? (updated = {
          ...p,
          type: body.type === 'fixed' ? 'fixed' : 'percent',
          value: Number(body.value) || p.value,
          minTotal: Math.max(0, Number(body.minTotal) || 0),
          maxUses: Math.max(0, parseInt(body.maxUses, 10) || 0),
          expiresAt: body.expiresAt || null,
          active: body.active !== false,
          description: sanitize(body.description, 120),
        })
      : p)));
  if (!updated) throw new ApiError('პრომოკოდი ვერ მოიძებნა', 404);
  return { item: updated, message: 'პრომოკოდი განახლდა' };
}

export function adminDeletePromo(code) {
  const list = getData(STORAGE_KEYS.PROMO_CODES);
  if (!list.some((p) => p.code === code)) throw new ApiError('პრომოკოდი ვერ მოიძებნა', 404);
  setData(STORAGE_KEYS.PROMO_CODES, list.filter((p) => p.code !== code));
  return { message: 'პრომოკოდი წაიშალა' };
}
