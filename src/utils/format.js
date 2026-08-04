/** ფორმატირების დამხმარეები (ლარი, თარიღი, რიცხვები) */

export const CURRENCY = '₾';

/** 39.9 → „39.90 ₾" */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return `${n.toFixed(2)} ${CURRENCY}`;
}

/** მოკლე ვარიანტი ვალუტის ნიშნის გარეშე */
export const formatNumber = (value) => (Number(value) || 0).toLocaleString('ka-GE');

const MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

/** 2026-08-03 → „3 აგვისტო, 2026" */
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${formatDate(iso)} · ${time}`;
}

/** „3 დღის წინ" */
export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ახლახან';
  if (mins < 60) return `${mins} წუთის წინ`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} საათის წინ`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} დღის წინ`;
  return formatDate(iso);
}

/** მარაგის სტატუსი ბარათისთვის */
export function stockInfo(stock) {
  if (stock <= 0) return { level: 'out', label: 'არ არის მარაგში' };
  if (stock <= 5) return { level: 'low', label: `დარჩა ${stock} ცალი` };
  return { level: 'ok', label: 'მარაგშია' };
}

/** სახელის ინიციალები ავატარისთვის */
export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?';
