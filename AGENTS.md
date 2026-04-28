# AGENTS.md

## 1. Loyiha Tahlili

### Asosiy stack
- **Framework:** React 19 + Vite 6
- **Til:** TypeScript (`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`)
- **Routing:** `react-router-dom` (`BrowserRouter`, file-based emas, route config `src/route/allRoutes.tsx`)
- **Server state / data fetching:** `@tanstack/react-query`
- **HTTP client:** `axios` (`src/api/apiClient.ts`)
- **Form layer:** asosan `Formik + Yup`, ayrim UI form komponentlarda `react-hook-form` dependency bor, lekin active business/teacher flowlarda Formik ustun
- **Styling:** Tailwind CSS v4 + plain CSS (`src/styles/main.css`, `src/styles/auth.css`, `src/styles/phoneNumberInput.css`)
- **UI primitives:** ikkita qatlam aralash ishlatiladi
  - eski custom UI (`src/components/ui/button/Button.tsx`, `src/components/form/*`)
  - yangi Radix/CVA/shadcn-uslubidagi UI (`src/components/ui/*`, masalan `newButton.tsx`, `dropdown-menu.tsx`, `switch.tsx`)
- **Notifications:** `react-hot-toast`
- **Meta/head:** `react-helmet-async`
- **Icons:** `lucide-react`

### Active product surface
Active teacher/business workspace asosan shu route va komponentlarda:
- `src/pages/Dashboard/*`
- `src/pages/Courses/*`
- `src/pages/CourseDetails/CourseDetails.tsx`
- `src/components/courseDetails/*`
- `src/pages/Users/Users.tsx`
- `src/pages/UserProfiles.tsx`
- `src/components/auth/*`

### Legacy / demo surface
Repo ichida demo yoki admin-template meros bo‘laklari ham bor:
- `src/pages/UiElements/*`
- `src/pages/Charts/*`
- `src/pages/Tables/*`
- `src/pages/Forms/*`
- `src/components/ecommerce/*`
- `src/components/tables/*`

Yangi ishda avval active workspace ichida ishlash kerak. Legacy qatlamni sababsiz “bir xil qilish” yoki global refactor qilish noto‘g‘ri.

### State management
- **Global UI state:** React Context
  - `ThemeContext`
  - `SidebarContext`
  - `ToastProvider`
- **Server state:** React Query
- **Local page/component state:** `useState`, `useMemo`, `useEffect`
- **Form state:** Formik

Bu loyihada Redux, Zustand, Jotai ishlatilmaydi.

### API pattern
- Barcha API call’lar `src/api/*` ichida
- Har domain odatda 2 fayldan iborat:
  - `*Api.ts` — raw request / response normalize
  - `use*.ts` — React Query hook’lari
- `apiClient.ts`:
  - `axios.create`
  - bearer token interceptor
  - 401 refresh token retry
  - prod/dev URL resolve qiladi

### Styling pattern
- Tailwind utility class’lar komponent ichida inline yoziladi
- global token/theme `src/styles/main.css` ichida
- auth va phone input uchun plain CSS override mavjud
- dark mode `html.dark` class orqali ishlaydi

### Config / env
- `.env.example` yoki `.env` repo ichida yo‘q
- hozir API URL `src/api/apiClient.ts` ichida resolve qilinadi:
  - dev default: `http://localhost:8080/api`
  - prod default: `https://westep.uz/api`
  - override: `VITE_API_BASE_URL`, `VITE_ASSET_BASE_URL`

### Testing holati
- `*.test.*` yoki `*.spec.*` fayllar yo‘q
- Jest/Vitest runner script yo‘q
- amaliy test strategiya hozir:
  - `eslint`
  - `npm run build`
  - manual smoke-check

## 2. Umumiy Qoidalar

### Import va dependency tartibi
Mavjud kodda odatiy tartib:
1. React / third-party importlar
2. route yoki framework helperlari
3. local domain importlar
4. style yoki asset importlar

Relativ importlar `.ts` / `.tsx` extension bilan yoziladi. Shu uslubni saqla.

### Naming convention
- Page komponentlar: `PascalCase.tsx`
- Domain komponentlar: `PascalCase.tsx`
- Hooklar: `useXxx.ts` yoki `useXxx.tsx`
- API layer: `xxxApi.ts`, `useXxx.ts`
- Type fayllari: markaziy `src/types/types.ts`

### Eksport uslubi
- **Pages:** deyarli hammasi `export default function ...`
- **Katta komponentlar:** ko‘pincha `default export`
- **Utility / hook / query helperlar:** named export
- **UI primitive’lar:** mixed; mavjud fayldagi uslubni buzma

### Mavjud kodga mos yozish qoidasi
- Generic abstraction o‘ylab topma
- Avval mavjud domain patternni ko‘chir
- `src/api/*` va `src/components/*` ichidagi amaliy pattern ustun
- Har kichik muammo uchun global refactor qilma

### Xavfli zonalar
- Button va form qatlamlari ikki xil. Ularni bir patch ichida “birlashtirish” yoki standartlashtirishga urinma.
- Legacy demo sahifalarni active workspace bilan aralashtirma.
- `ProtectedRoute.tsx` deyarli ishlatilmaydi; haqiqiy gate `AuthProtected.tsx`.

## 3. Sub-Agent Rollari

Har agent minimal kontekst bilan ishlashi kerak. Faqat kerakli fayllarni o‘qiydi.

### Agent: Code Reader
- **Maqsad:** o‘zgartirishdan oldin domain flow, import pattern va mavjud implementatsiyani aniqlash
- **Qachon ishlatiladi:** yangi task boshlanishida, ayniqsa route/API/form oqimlarida
- **Qoidalar:**
  - avval tegishli `page -> component -> api -> type` zanjirini o‘qiydi
  - faqat kerakli fayllarni ko‘radi
  - active workspace va legacy demo qismini farqlaydi
- **Taqiqlangan narsalar:**
  - kod yozish
  - global tavsiya chiqarish
  - keraksiz fayl o‘qish
- **Output format:**
  - `Surface:`
  - `Files:`
  - `Current pattern:`
  - `Risks:`

### Agent: Component Writer
- **Maqsad:** yangi yoki mavjud UI komponentni loyiha uslubida yozish
- **Qachon ishlatiladi:** page, card, modal, form section, dashboard block qo‘shilganda
- **Qoidalar:**
  - birinchi navbatda mavjud qo‘shni komponentni reference qiladi
  - default export uslubini saqlaydi
  - Tailwind utility class inline yozadi
  - dark mode class’larini unutmang
- **Taqiqlangan narsalar:**
  - yangi styling paradigm kiritish
  - CSS Modules yoki styled-components olib kirish
  - mavjud button systemlarni majburan almashtirish
- **Output format:**
  - o‘zgargan komponentlar ro‘yxati
  - props contract
  - UI state / eventlar

### Agent: Refactor Agent
- **Maqsad:** mavjud oqimni buzmasdan tuzilmani tozalash
- **Qachon ishlatiladi:** duplicate logic, type cleanup, query invalidation, routing cleanup
- **Qoidalar:**
  - faqat bir domain ichida refactor qiladi
  - diff kichik va tekshiriladigan bo‘lishi kerak
  - mavjud public API’ni saqlaydi
- **Taqiqlangan narsalar:**
  - cross-project redesign
  - active va legacy qatlamni bir patch’da aralashtirish
  - “rewrite from scratch”
- **Output format:**
  - `Before`
  - `After`
  - `Behavior unchanged`
  - `Risk`

### Agent: API / Data Fetching Agent
- **Maqsad:** backend endpoint ulash, normalize qilish, query hook yozish
- **Qachon ishlatiladi:** yangi endpoint, cache invalidation, mutation, optimistic update
- **Qoidalar:**
  - requestlar `src/api/<domain>` ichiga ketadi
  - raw transport `*Api.ts` ichida qoladi
  - React Query hook `use*.ts` ichida qoladi
  - errorlar `parseApiError` yoki toast helper bilan moslashtiriladi
  - query key’lar domain bo‘yicha aniq bo‘lishi kerak
- **Taqiqlangan narsalar:**
  - page ichida to‘g‘ridan-to‘g‘ri axios chaqirish
  - component ichida response normalize qilish
  - token bilan qo‘lda ishlash, agar `apiClient` hal qilsa
- **Output format:**
  - endpoint
  - request/response mapping
  - query key
  - invalidation plan

### Agent: State Agent
- **Maqsad:** local/global UI state oqimini to‘g‘ri joyga qo‘yish
- **Qachon ishlatiladi:** sidebar, theme, modal, selection flow, multi-step state
- **Qoidalar:**
  - local state bo‘lsa component ichida qoldiradi
  - global UI state bo‘lsa Context ishlatadi
  - server state’ni Contextga ko‘chirmaydi, React Query’da qoldiradi
- **Taqiqlangan narsalar:**
  - Redux/Zustand kiritish
  - React Query ma’lumotini localStorage state sifatida ko‘paytirish
- **Output format:**
  - state owner
  - read/write points
  - persistence bormi-yo‘qmi

### Agent: Page / Layout Agent
- **Maqsad:** route-level page, layout, sidebar/header integration
- **Qachon ishlatiladi:** yangi sahifa, routing, nested editor, page shell ishlari
- **Qoidalar:**
  - route qo‘shish `src/route/allRoutes.tsx`
  - protected/public oqimni tekshiradi
  - page meta `dashboardNav.tsx` yoki `PageMeta` bilan moslashtiriladi
  - AppLayout ichidagi spacing/collapse logic’ni buzmaydi
- **Taqiqlangan narsalar:**
  - route’larni fayl-based tizimga o‘tkazish
  - auth gate’ni chetlab o‘tish
- **Output format:**
  - route
  - parent layout
  - navigation impact

### Agent: UI Component Agent
- **Maqsad:** `src/components/ui` va form primitive qatlamida ishlash
- **Qachon ishlatiladi:** button, input, dropdown, dialog, switch, scroll area
- **Qoidalar:**
  - avval qaysi UI qatlam ishlatilayotganini aniqlaydi:
    - `src/components/ui/button/Button.tsx`
    - yoki `src/components/ui/button/newButton.tsx`
  - qo‘shni komponent qaysi patternni ishlatsa, o‘shani davom ettiradi
  - `cn`, `cva`, Radix primitive’larni faqat shu qatlamda ishlatadi
- **Taqiqlangan narsalar:**
  - bir patch’da barcha buttonlarni bir formatga o‘tkazish
  - business page’larda boshqa button oilasini majburan almashtirish
- **Output format:**
  - primitive turi
  - variantlar
  - dark mode holati

### Agent: Test / Verification Agent
- **Maqsad:** loyiha sharoitiga mos verifikatsiya qilish
- **Qachon ishlatiladi:** har feature, bug fix, build fix
- **Qoidalar:**
  - bu repoda test suite yo‘q, shuning uchun:
    - `npx eslint <changed files>`
    - kerak bo‘lsa `npm run build`
    - kerak bo‘lsa manual smoke scenario
  - verification aniq o‘zgargan domainga bog‘langan bo‘lishi kerak
- **Taqiqlangan narsalar:**
  - mavjud bo‘lmagan test framework nomidan gapirish
  - “tests passed” deyish, agar test yo‘q bo‘lsa
- **Output format:**
  - `Lint:`
  - `Build:`
  - `Manual smoke:`
  - `Untested risk:`

## 4. Komponent Standarti

### Props yozish
Mavjud pattern ikki xil:
- kichik komponentlar: inline props (`{courseId}: {courseId: string}`)
- murakkab komponentlar: `interface XxxProps` yoki `type XxxProps`

Qoidalar:
- 1-2 prop bo‘lsa inline yozish mumkin
- reusable yoki ko‘p prop bo‘lsa `interface/type` ajrat

### Export usuli
- Page va domain komponentlarda `default export` ustun
- Utility, hook, variant helperlar named export
- Mavjud faylda qanday bo‘lsa shuni saqla

### Fayl va papka nomlash
- Komponent: `PascalCase.tsx`
- Hook: `useXxx.ts`
- API file: `xxxApi.ts`
- Page: route ma’nosiga mos `PascalCase.tsx`

### Komponent ichidagi mantiq chegarasi
Mavjud kodda page/container komponentlar ko‘proq mantiq ushlab turadi:
- query chaqiradi
- `useMemo`
- filter/selection
- event handlers

UI child komponentlar ko‘proq presentational.

Shu sabab:
- data orchestration page yoki container’da qolsin
- primitive UI ichiga business logic tushirma

## 5. Fayl Tuzilmasi Standarti

### Yangi API qo‘shilganda
- raw request: `src/api/<domain>/<domain>Api.ts`
- react-query hook: `src/api/<domain>/use<Domain>.ts`

### Yangi page qo‘shilganda
- route-level fayl: `src/pages/<Domain>/<Page>.tsx`
- route mapping: `src/route/allRoutes.tsx`
- agar dashboard navigation bo‘lsa: `src/layout/dashboardNav.tsx`

### Yangi domain komponent qo‘shilganda
- course builder bilan bog‘liq: `src/components/courseDetails/*`
- courses list / create / edit: `src/components/courses/*`
- auth bilan bog‘liq: `src/components/auth/*`
- umumiy form primitives: `src/components/form/*`
- UI primitive: `src/components/ui/*`

### Yangi type qo‘shilganda
- avval `src/types/types.ts` tekshiriladi
- agar mavjud domain interface shu faylda bo‘lsa, yangi type ham shu yerga qo‘shiladi
- alohida type fayl ochish faqat haqiqiy zarurat bo‘lsa

## 6. Git Commit Format

Yaqin commit tarixida asosiy pattern:
- `fix: ...`
- `feat: ...`

Misollar:
- `fix: point production api to westep domain`
- `fix: resolve production build issues`
- `feat: revamp teacher and business workspace`

Historikada tartibsiz commit ham bor (`efef`), lekin yangi ishlar uchun qabul qilinadigan format:
- `<type>: <short summary>`

Tavsiya etilgan `type` lar:
- `fix:`
- `feat:`
- `refactor:`
- `chore:`

## 7. Tez Yo‘riqnoma

### 1. Yangi sahifa qo‘shish
1. `Code Reader`
2. `Page / Layout Agent`
3. kerak bo‘lsa `API / Data Fetching Agent`
4. `Component Writer`
5. `Test / Verification Agent`

### 2. Yangi komponent qo‘shish
1. `Code Reader`
2. `UI Component Agent` yoki `Component Writer`
3. `Test / Verification Agent`

### 3. API ulash
1. `Code Reader`
2. `API / Data Fetching Agent`
3. page ichida ishlatish uchun `Component Writer`
4. `Test / Verification Agent`

### 4. State qo‘shish
1. `Code Reader`
2. `State Agent`
3. kerak bo‘lsa `Component Writer`
4. `Test / Verification Agent`

### 5. Bug fix
1. `Code Reader`
2. muammoga qarab:
   - `API / Data Fetching Agent`
   - yoki `State Agent`
   - yoki `Refactor Agent`
3. `Test / Verification Agent`

### 6. Refactor
1. `Code Reader`
2. `Refactor Agent`
3. zarurat bo‘lsa `Page / Layout Agent` yoki `API / Data Fetching Agent`
4. `Test / Verification Agent`

### 7. Course builder / lesson manage flow o‘zgartirish
1. `Code Reader`
2. `Page / Layout Agent`
3. `API / Data Fetching Agent`
4. `Component Writer`
5. `Test / Verification Agent`

## Yakuniy ish qoidasi
- Avval active workspace’ni top
- Qo‘shni fayl patternini ko‘chir
- API’ni `src/api` qatlamida ushla
- React Query va Context rolini aralashtirma
- UI qatlamlarini sababsiz birlashtirma
- Test yo‘q joyda test bor deb ko‘rsatma
