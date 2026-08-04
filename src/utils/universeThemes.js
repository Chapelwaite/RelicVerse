/**
 * სამყაროების ვიზუალური იდენტობა — ფერები, ემბლემები, ფონები,
 * ემოციური აღწერები და ჟანრის ფილტრის თეგები.
 */
import themesJson from '../assets/universes/themes.json';

/* ყველა ლოკალური asset ერთიანად (Vite bundle) */
const emblemFiles = import.meta.glob('../assets/universes/*/emblem.svg', { eager: true, import: 'default', query: '?url' });
const bgFiles = import.meta.glob('../assets/universes/*/bg.svg', { eager: true, import: 'default', query: '?url' });

const fileFor = (map, slug) => {
  const key = Object.keys(map).find((k) => k.includes(`/${slug}/`));
  return key ? map[key] : null;
};

/** ჟანრის სწრაფი ფილტრები */
export const UNIVERSE_FILTERS = [
  { id: 'all', label: 'ყველა' },
  { id: 'fantasy', label: 'ფენტეზი' },
  { id: 'anime', label: 'ანიმე' },
  { id: 'heroes', label: 'სუპერგმირები' },
  { id: 'horror', label: 'საშინელება' },
  { id: 'films', label: 'ფილმები' },
  { id: 'series', label: 'სერიალები' },
  { id: 'cartoon', label: 'მულტფილმები' },
];

/** ემოციური აღწერები + თეგები + ისტორიები (spoiler-free) */
const META = {
  'harry-potter': {
    tags: ['fantasy', 'films'],
    blurb: 'ჯადოსნური ნივთები, არტეფაქტები და ჰოგვორტსის მოგონებები.',
    story: 'სამყარო, სადაც ჩვეულებრივი ნივთები ჯადოსნურ ისტორიებს ინახავს — ჯოხი ირჩევს პატრონს, რუკა კი მხოლოდ მას ემორჩილება, ვინც ცელქობას ფიცავს.',
  },
  'fight-club': {
    tags: ['films'],
    blurb: 'საკულტო დეტალები სამყაროდან, რომელზეც არავინ ლაპარაკობს.',
    story: 'ისტორია იმაზე, თუ როგორ იშლება მოწესრიგებული ცხოვრება და როგორ რჩება მისგან მხოლოდ რამდენიმე ნივთი — ქურთუკი, სათვალე და ვარდისფერი საპონი.',
  },
  pirates: {
    tags: ['fantasy', 'films'],
    blurb: 'კომპასი, მონეტები და ოკეანის ლეგენდები ერთ თაროზე.',
    story: 'ზღვა ყველაფერს იმახსოვრებს — განსაკუთრებით იმ კომპასს, რომელიც ჩრდილოეთს კი არა, გულის სურვილს აჩვენებს.',
  },
  'death-note': {
    tags: ['anime'],
    blurb: 'რვეული, ვაშლი და თამაში, რომელიც ჭადრაკზე რთულია.',
    story: 'ერთი რვეული, ერთი ვაშლი და ორი გენიოსის დაპირისპირება — სამყარო, სადაც ყველა დეტალს მნიშვნელობა აქვს.',
  },
  alice: {
    tags: ['fantasy', 'films', 'cartoon'],
    blurb: 'ჩაის წვეულება, საათები და ლოგიკის მიღმა დარჩენილი კარები.',
    story: 'აქ დრო ჩაის სმისთვის ჩერდება, კატა ღიმილად იქცევა, კარები კი მხოლოდ სწორი ზომის სტუმრებს უღებენ.',
  },
  'kill-bill': {
    tags: ['films'],
    blurb: 'ყვითელი კოსტიუმი და კატანა — შურისძიების ესთეტიკა.',
    story: 'ისტორია, სადაც ერთი ფერი და ერთი მახვილი მთელ ჟანრად იქცა.',
  },
  'the-mentalist': {
    tags: ['series'],
    blurb: 'ჩაის რიტუალი, დაკვირვება და წითელი კვალი წარსულიდან.',
    story: 'ყველაზე მშვიდი ადამიანი ოთახში ის არის, ვინც ყველაფერს ამჩნევს — მისი ერთადერთი იარაღი ჩაის ჭიქა და უზადო დაკვირვებაა.',
  },
  ghibli: {
    tags: ['anime', 'cartoon'],
    blurb: 'ტყის სულები, მფრინავი ღრუბლები და ბავშვობის სითბო.',
    story: 'სამყაროები, სადაც ქარი ცოცხალია, ტყე სუნთქავს და ყველა პატარა სულს თავისი ადგილი აქვს.',
  },
  marvel: {
    tags: ['heroes', 'films'],
    blurb: 'გმირების არტეფაქტები და უსასრულო სამყაროების ენერგია.',
    story: 'სამყარო, სადაც ერთი ქვა გალაქტიკებს ცვლის, ერთი ფარი კი — ისტორიას.',
  },
  dc: {
    tags: ['heroes', 'films'],
    blurb: 'გოთემის ღამე, პროჟექტორის შუქი და ბნელი რაინდის კვალი.',
    story: 'წვიმიანი ქალაქი, რომელიც არასდროს იძინებს — და სიმბოლო, რომელიც ცაზე აინთება, როცა იმედი სჭირდებათ.',
  },
  disney: {
    tags: ['cartoon', 'fantasy'],
    blurb: 'ზღაპრები, ჯადოსნური ლამპები და ბავშვობის ვარსკვლავები.',
    story: 'აქ ყოველი ვარსკვლავი სურვილს ისმენს, ყოველი ლამპა კი ისტორიას ინახავს.',
  },
  'horror-classics': {
    tags: ['horror', 'films'],
    blurb: 'ნიღბები და ლეგენდები — მაგარი ნერვების მქონეთათვის.',
    story: 'კლასიკა, რომელმაც თაობებს ასწავლა: ყველაზე საშიში ის არის, რასაც ვერ ხედავ. 18+',
  },
  smurfs: {
    tags: ['cartoon'],
    blurb: 'ლურჯი სოფელი, სოკოს სახლები და თეთრი ქუდები.',
    story: 'პატარა სოფელი ტყის სიღრმეში, სადაც ყველა პრობლემა ერთად სიმღერით გვარდება.',
  },
  'miss-peregrine': {
    tags: ['fantasy', 'films'],
    blurb: 'მარყუჟები, ძველი ფოტოები და უჩვეულო ბავშვების საათები.',
    story: 'სახლი, სადაც ერთი და იგივე დღე უსასრულოდ მეორდება — და ეს მისი ბინადრების ერთადერთი თავშესაფარია.',
  },
  lotr: {
    tags: ['fantasy', 'films'],
    blurb: 'ერთი ბეჭედი, ელფური ასოები და შუახმელეთის რუკები.',
    story: 'ყველაზე პატარა ნივთს ყველაზე დიდი ძალა აღმოაჩნდა — და ყველაზე პატარა არსებამ შეძლო მისი ტარება.',
  },
  anime: {
    tags: ['anime'],
    blurb: 'შონენის კლასიკა — შუბლსაკრავებიდან მეკობრის ნიშნებამდე.',
    story: 'სამყაროები, სადაც მეგობრობა ძალაზე ძლიერია, ოცნება კი — ნებისმიერ ზღვაზე დიდი.',
  },
  other: {
    tags: ['series', 'films'],
    blurb: 'სერიალები და ფილმები, რომლებმაც თაობა აღზარდეს.',
    story: 'ისტორიები, რომლებიც ჟანრებს არ ჯდება — მაგრამ თაროზე ადგილს ყოველთვის იმსახურებს.',
  },
};

/** სრული თემა slug-ით */
export function universeTheme(slug) {
  const palette = themesJson[slug] || themesJson.other;
  const meta = META[slug] || META.other;
  return {
    slug,
    ...palette,
    ...meta,
    emblem: fileFor(emblemFiles, slug) || fileFor(emblemFiles, 'other'),
    bg: fileFor(bgFiles, slug) || fileFor(bgFiles, 'other'),
  };
}

/** CSS ცვლადები universe-ის მიხედვით */
export function universeCssVars(slug) {
  const t = universeTheme(slug);
  return {
    '--universe-primary': t.primary,
    '--universe-secondary': t.secondary,
    '--universe-accent': t.accent,
    '--universe-glow': t.glow,
    '--universe-surface': t.surface,
  };
}

export const FEATURED_SLUGS = ['harry-potter', 'fight-club', 'pirates'];

/** კოლექციის პროგრესი — რჩეულები + კალათა (demo gamification) */
export function collectionProgress(universeName, favorites, cartItems, totalCount) {
  const ids = new Set();
  favorites.forEach((f) => { if (f.universe === universeName) ids.add(f.id); });
  cartItems.forEach((c) => { if (c.universe === universeName) ids.add(c.id); });
  const found = ids.size;
  if (!found || !totalCount) return null;
  return { found: Math.min(found, totalCount), total: totalCount };
}
