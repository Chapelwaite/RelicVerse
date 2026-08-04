/**
 * userService — demo ავტორიზაცია browser-ში.
 *
 * ⚠️ ეს არის სასწავლო DEMO და არა რეალური უსაფრთხოება:
 * backend აღარ არსებობს, ამიტომ პაროლები ინახება მხოლოდ მსუბუქი
 * არაკრიპტოგრაფიული hash-ით ამავე ბრაუზერში. ეს ცნობილი და
 * მისაღები შეზღუდვაა demo პროექტისთვის.
 */
import { getData, setData, updateData, simpleStore } from './storageService';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { nextUserId } from '../utils/idGenerator';
import { validate, sanitize } from '../utils/dataValidation';
import { ApiError } from './apiError';
import { DEMO_ADMIN } from '../config/demoAdmin';

/* მსუბუქი hash (djb2-ვარიანტი) — მხოლოდ demo-სთვის */
export function demoHash(text) {
  let h1 = 5381;
  let h2 = 52711;
  const s = `relicverse::${text}`;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = (h1 * 33) ^ c;
    h2 = (h2 * 33) ^ c;
  }
  return `${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}

/* ─── Token (demo) ─── */
function makeToken(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return `demo.${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`;
}

function parseToken(token) {
  try {
    if (!token || !token.startsWith('demo.')) return null;
    return JSON.parse(decodeURIComponent(escape(atob(token.slice(5)))));
  } catch {
    return null;
  }
}

export const tokenStore = {
  get: () => simpleStore.get(STORAGE_KEYS.CURRENT_USER),
  set: (t) => simpleStore.set(STORAGE_KEYS.CURRENT_USER, t ?? null),
};

/* ─── Admin-ის seed პირველივე გამოყენებაზე ─── */
function ensureAdminSeeded() {
  const users = getData(STORAGE_KEYS.USERS);
  if (users.some((u) => u.email === DEMO_ADMIN.email)) return users;
  const admin = {
    id: 'usr-admin',
    firstName: 'RelicVerse',
    lastName: 'Admin',
    email: DEMO_ADMIN.email,
    passwordHash: demoHash(DEMO_ADMIN.password),
    phone: '', city: '', address: '',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  const next = [admin, ...users];
  setData(STORAGE_KEYS.USERS, next);
  return next;
}

const publicUser = (u) => ({
  id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email,
  phone: u.phone || '', city: u.city || '', address: u.address || '',
  role: u.role, createdAt: u.createdAt,
});

/* ─── საჯარო ოპერაციები ─── */

export function register(body) {
  const { valid, errors } = validate(body, {
    firstName: { required: true, minLength: 2, maxLength: 40, label: 'სახელი' },
    lastName: { required: true, minLength: 2, maxLength: 40, label: 'გვარი' },
    email: { required: true, type: 'email', label: 'ელფოსტა' },
    password: { required: true, minLength: 6, maxLength: 72, label: 'პაროლი' },
  });
  if (!valid) throw new ApiError('შეავსეთ ველები სწორად', 400, errors);

  const email = String(body.email).trim().toLowerCase();
  const users = ensureAdminSeeded();
  if (users.some((u) => u.email === email)) {
    throw new ApiError('ამ ელფოსტით მომხმარებელი უკვე არსებობს', 409, { email: 'ეს ელფოსტა დაკავებულია' });
  }

  const user = {
    id: nextUserId(),
    firstName: sanitize(body.firstName, 40),
    lastName: sanitize(body.lastName, 40),
    email,
    passwordHash: demoHash(String(body.password)),
    phone: sanitize(body.phone, 20),
    city: '', address: '',
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  setData(STORAGE_KEYS.USERS, [...users, user]);
  return { user: publicUser(user), token: makeToken(user), message: 'რეგისტრაცია წარმატებით დასრულდა' };
}

export function login(body) {
  const { valid, errors } = validate(body, {
    email: { required: true, type: 'email', label: 'ელფოსტა' },
    password: { required: true, label: 'პაროლი' },
  });
  if (!valid) throw new ApiError('შეავსეთ ველები', 400, errors);

  const email = String(body.email).trim().toLowerCase();
  const users = ensureAdminSeeded();
  const user = users.find((u) => u.email === email);
  const ok = user && user.passwordHash === demoHash(String(body.password));
  if (!ok) throw new ApiError('ელფოსტა ან პაროლი არასწორია', 401);

  return { user: publicUser(user), token: makeToken(user), message: `მოგესალმებით, ${user.firstName}!` };
}

export function me() {
  const payload = parseToken(tokenStore.get());
  if (!payload) throw new ApiError('ავტორიზაცია საჭიროა', 401);
  const users = ensureAdminSeeded();
  const user = users.find((u) => u.id === payload.id);
  if (!user) throw new ApiError('მომხმარებელი ვერ მოიძებნა', 404);
  return { user: publicUser(user) };
}

export function currentUserOrNull() {
  try { return me().user; } catch { return null; }
}

export function requireAdmin() {
  const user = currentUserOrNull();
  if (!user) throw new ApiError('ავტორიზაცია საჭიროა', 401);
  if (user.role !== 'admin') throw new ApiError('წვდომა აკრძალულია — საჭიროა ადმინისტრატორის უფლებები', 403);
  return user;
}

export function updateMe(body) {
  const payload = parseToken(tokenStore.get());
  if (!payload) throw new ApiError('ავტორიზაცია საჭიროა', 401);

  const { valid, errors } = validate(body, {
    firstName: { required: true, minLength: 2, maxLength: 40, label: 'სახელი' },
    lastName: { required: true, minLength: 2, maxLength: 40, label: 'გვარი' },
    phone: { type: 'phone', label: 'ტელეფონი' },
  });
  if (!valid) throw new ApiError('შეავსეთ ველები სწორად', 400, errors);

  let updated = null;
  updateData(STORAGE_KEYS.USERS, (users) =>
    users.map((u) => {
      if (u.id !== payload.id) return u;
      updated = {
        ...u,
        firstName: sanitize(body.firstName, 40),
        lastName: sanitize(body.lastName, 40),
        phone: sanitize(body.phone, 20),
        city: sanitize(body.city, 60),
        address: sanitize(body.address, 160),
      };
      return updated;
    }));

  if (!updated) throw new ApiError('მომხმარებელი ვერ მოიძებნა', 404);
  return { user: publicUser(updated), message: 'მონაცემები წარმატებით განახლდა' };
}

export function adminListUsers() {
  return ensureAdminSeeded()
    .map(({ passwordHash, ...u }) => u)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
