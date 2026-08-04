/**
 * Portal-style გვერდის გადასვლა universe card-იდან detail page-ზე.
 * Overlay იმპერატიულად ემატება body-ს, ამიტომ route-ის შეცვლას უძლებს
 * და უკან დაბრუნებისას არაფერი იჭედება.
 */
let active = false;

export function runPortalTransition({ originX, originY, color, surface, emblem, onNavigate }) {
  if (active) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { onNavigate(); return; }

  active = true;
  const el = document.createElement('div');
  el.className = 'rv-portal-transition';
  el.setAttribute('aria-hidden', 'true');
  el.style.setProperty('--ox', `${originX}px`);
  el.style.setProperty('--oy', `${originY}px`);
  el.style.setProperty('--pt-color', color);
  el.style.setProperty('--pt-surface', surface);
  if (emblem) {
    const img = document.createElement('img');
    img.src = emblem;
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);
  }
  document.body.appendChild(el);

  // ორი requestAnimationFrame — რომ საწყისი clip-path ნამდვილად დაიხატოს
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));

  const navTimer = setTimeout(onNavigate, 480);
  const outTimer = setTimeout(() => el.classList.add('is-out'), 760);
  const cleanTimer = setTimeout(() => { el.remove(); active = false; }, 1150);

  // უსაფრთხოების ბადე — თუ რამე მოხდა, overlay მაინც წაიშალოს
  setTimeout(() => {
    clearTimeout(navTimer); clearTimeout(outTimer); clearTimeout(cleanTimer);
    if (el.isConnected) el.remove();
    active = false;
  }, 2000);
}
