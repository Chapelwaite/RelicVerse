<div align="center">

# ✦ RelicVerse ✦

**შეინახე შენი საყვარელი სამყაროს ნაწილი**

ქართული dark-fantasy ონლაინ-მაღაზია — ნივთები ფილმების, სერიალების, ანიმესა და მულტფილმების სამყაროებიდან.

**Frontend-only · React + Vite · Vercel-ready · database და backend არ სჭირდება**

</div>

---

## 🚀 ლოკალური გაშვება

```bash
npm install
npm run dev
```

| | |
|---|---|
| საიტი (dev) | http://localhost:5173 |
| Admin panel | http://localhost:5173/admin |
| Production preview | `npm run build && npm run preview` → http://localhost:4173 |

### 🔑 Demo ადმინისტრატორი

```text
admin@relicverse.ge
RelicAdmin2026!
```

ეს **ღია სასწავლო demo-ა** — credentials განზრახ ჩანს კოდში (`src/config/demoAdmin.js`). რეალური production მაღაზიისთვის საჭირო იქნება ნამდვილი backend, database და უსაფრთხო authentication.

---

## ▲ Vercel-ზე ატვირთვა (GitHub-ით)

1. ატვირთე პროექტი GitHub repository-ში;
2. Vercel-ში → **Add New Project**;
3. აირჩიე repository;
4. **Framework preset:** `Vite`;
5. **Build command:** `npm run build`;
6. **Output directory:** `dist`;
7. **Install command:** `npm install`;
8. დააჭირე **Deploy**.

პროექტს **არ სჭირდება** database, backend, environment variables ან გარე სერვისი.
`vercel.json`-ში rewrites უკვე კონფიგურირებულია — ყველა deep route (`/catalog`, `/product/...`, `/universes/...`, `/admin/...`) refresh-ისას სწორად იხსნება.

---

## 🗄️ როგორ ინახება მონაცემები (მნიშვნელოვანი)

ეს არის **სრულად ფუნქციური სასწავლო demo ecommerce** — backend-ის გარეშე:

- **საწყისი მონაცემები** (58 პროდუქტი, კატეგორიები, სამყაროები, პრომოკოდები, პარამეტრები) ყველა ვიზიტორისთვის ერთნაირია — ჩაშენებულია static JSON-ებში (`src/data/`);
- პირველი გახსნისას ეს მონაცემები deep copy-თ გადადის ბრაუზერის **localStorage**-ში;
- **Admin panel-იდან შეტანილი ცვლილებები** (პროდუქტები, შეკვეთები, პარამეტრები…) ინახება მხოლოდ **იმ კონკრეტულ ბრაუზერში**;
- სხვადასხვა მოწყობილობას/ბრაუზერს შორის ცვლილებები **არ სინქრონდება**;
- ბრაუზერის მონაცემების წაშლისას ცვლილებები იკარგება;
- **Backup:** Admin → პარამეტრები → „მონაცემების ექსპორტი" (JSON ფაილი);
- **აღდგენა:** „მონაცემების იმპორტი" ან „საწყისი მონაცემების აღდგენა".

localStorage გასაღებები: `relicverse_products`, `relicverse_orders`, `relicverse_users`, `relicverse_cart`, `relicverse_favorites` და ა.შ. (`src/utils/storageKeys.js`).

---

## 📦 პროექტის სტრუქტურა

```text
RelicVerse/
├── index.html
├── vite.config.js
├── vercel.json               # SPA rewrites — deep route refresh მუშაობს
├── public/
│   ├── products/             # 174 გენერირებული პროდუქტის SVG
│   └── universes/            # სამყაროების ბანერები
├── src/
│   ├── data/                 # 🌱 static seed JSON-ები (products, orders, settings…)
│   ├── services/             # 🗄️ client-side data layer (localStorage)
│   │   ├── storageService.js #    seed → localStorage, versioning, export/import/reset
│   │   ├── productService.js #    კატალოგი/ძიება/ფილტრები + admin CRUD
│   │   ├── orderService.js   #    შეკვეთები, პრომოკოდები, stock
│   │   ├── userService.js    #    demo auth (მსუბუქი hash — არა რეალური უსაფრთხოება)
│   │   ├── catalogService.js #    bootstrap, კატეგორია/სამყარო/settings/newsletter
│   │   ├── promoService.js · statsService.js · dataService.js
│   ├── api/client.js         # იგივე api ინტერფეისი — ახლა services-ზე დგას
│   ├── utils/                # storageKeys, idGenerator, dataValidation, themes…
│   ├── config/demoAdmin.js
│   ├── components/ · pages/ · admin/ · context/ · hooks/ · styles/ · assets/
│   └── main.jsx
└── scripts/                  # (dev) seed/არტის ხელახალი გენერაცია
```

---

## ✅ რა მუშაობს (ყველაფერი browser-ში)

Cinematic pinned-scroll intro (GSAP ScrollTrigger) · კატალოგი ფილტრებით/ძიებით/დალაგებით · სამყაროების identity ბარათები და გვერდები · პროდუქტის გვერდები · კალათა + პრომოკოდები (`RELIC10`, `MAGIC15`, `TEEN5`) · რჩეულები · შედარება · checkout demo შეკვეთით (`orders` → localStorage, stock მცირდება) · მომხმარებლის რეგისტრაცია/შესვლა/პროფილი/შეკვეთების ისტორია · Newsletter · **სრული Admin panel**: dashboard სტატისტიკით, პროდუქტების/შეკვეთების/კატეგორიების/სამყაროების/პრომოკოდების/newsletter/პარამეტრების მართვა + **JSON export / import / reset**.

Admin-ში დამატებული პროდუქტი მაშინვე ჩანს კატალოგში, ძიებაში, სამყაროსა და კატეგორიაში, საკუთარი detail გვერდით (უნიკალური ID + slug).

**სურათები:** ახალი პროდუქტისთვის მიუთითე URL, ლოკალური ბილიკი (მაგ. `/products/rv-001-1.svg`) ან პატარა Data URL. Vercel-ის ფაილურ სისტემაში ჩაწერა შეუძლებელია — ამიტომ ატვირთვა ფაილად არ ხდება.

---

## 🎨 კასტომიზაცია

- **ფერები:** `src/styles/theme.css` (CSS ცვლადები)
- **ლოგო:** `src/components/ui/Logo.jsx` + `public/favicon.svg`
- **სამყაროების ვიზუალები:** `src/assets/universes/` (ხელახლა გენერაცია: `npm run art`)
- **Seed მონაცემები:** `src/data/*.json` (სრული რეგენერაცია: `npm run reset:data` — dev ინსტრუმენტი)

---

## 📜 ბრძანებები

| ბრძანება | აღწერა |
|---|---|
| `npm run dev` | dev სერვერი (5173) |
| `npm run build` | production build → `dist/` |
| `npm run preview` | აწყობილი ვერსიის ლოკალური ნახვა (4173) |
| `npm run art` | პროდუქტებისა და სამყაროების SVG-ების რეგენერაცია |
| `npm run reset:data` | seed JSON-ების თავიდან აგება |

---

<div align="center">

**RelicVerse** — ნივთები იმ სამყაროებიდან, რომლებიც არასდროს დაგავიწყდება.

</div>
#   R e l i c V e r s e  
 