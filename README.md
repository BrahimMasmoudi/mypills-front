# MyPills 💊

MyPills is a medication management PWA built with Nuxt and Firebase to help users track their medicine inventory, monitor expiration dates, store prescriptions, get AI-powered medication guidance, and receive timely reminders via push notifications.

## ✨ Features
- **Smart Scanning:** Add medications by scanning GS1 DataMatrix or CIP13 barcodes (`html5-qrcode`), with automatic fallback to manual entry (preserving scanned barcode and expiry date) if external lookup fails.
- **Medication Inventory:** Track pill quantities, box counts, and expiry alerts in real time.
- **Prescription Storage:** Upload and share PDF/image prescriptions via Firebase Storage.
- **AI Advisor:** Medication guidance powered by `@google/genai` (Gemini).
- **🔔 Smart Reminders & Push Notifications:** Custom schedules via Cloud Tasks and Firebase Cloud Messaging (FCM).
- **Responsive PWA:** Desktop and mobile layouts with offline service worker support.
- **Internationalization:** English 🇬🇧 and French 🇫🇷 (`vue-i18n`).

## 🛠️ Technologies Used

### Frontend (`front/`)
- **Framework:** Nuxt 4 (Vue 3, Vite, TypeScript)
- **UI Libraries:** Vuetify & Nuxt UI
- **State & Firebase:** Pinia, VueFire (`nuxt-vuefire`), Firebase JS SDK
- **Scanning & PDF:** `html5-qrcode`, `jspdf`
- **Tests & Quality:** Vitest, `vue-tsc`, ESLint

### Backend (`back/`)
- **Runtime:** Node.js 24, TypeScript
- **Platform:** Firebase Cloud Functions v2, Cloud Firestore, Cloud Storage, FCM
- **Scheduling & AI:** `@google-cloud/tasks`, `@google/genai`
- **External Medication Lookup:** `undici` HTTP client (`GiygasApiAdapter`) with 5s timeout, response size cap, and runtime validation
- **Migrations & Tests:** Fireway, Jest (`ts-jest`), ESLint

### End-to-End (`e2e/`)
- **Framework:** Cypress + `cypress-firebase` against local Firebase Emulators (Auth, Firestore, Functions, Storage, Hosting)

## 📁 Repository Structure

```text
.
├── back/                 # Firebase Cloud Functions (hexagonal architecture) & Firestore migrations
├── front/                # Nuxt 4 SPA / PWA frontend
├── e2e/                  # Cypress E2E test suite & Firebase Emulator runner config
├── docs/designs/         # Architecture & hardening design documents
├── firebase.json         # Firebase Hosting, Functions, Firestore, Storage, and Emulator configuration
└── .github/workflows/    # CI/CD pipelines (lint, typecheck, build, unit tests, emulator E2E, deploy)
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 24** (`back` targets `"engines": { "node": "24" }`)
- **Yarn** (`1.22.x`)
- **Java** (required by the local Firebase Firestore Emulator)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/BrahimMasmoudi/mypills-front.git
cd mypills-front

yarn --cwd back install
yarn --cwd front install
yarn --cwd e2e install
```

### 2. Local Environment Configuration
- Backend (`back/.env`): configure `GEMINI_API_KEY` (or a placeholder value when running local emulator E2E tests).
- Frontend emulator mode: enabled automatically in non-production builds or explicitly via `NUXT_PUBLIC_USE_EMULATORS=true`.

## 🧪 Development, Build & Verification

### Backend (`back/`)
```bash
cd back
yarn lint        # ESLint check
yarn typecheck   # TypeScript typecheck (tsc --noEmit)
yarn build       # Compile Cloud Functions to back/lib/
yarn test        # Offline Jest unit test suite (live API test skipped by default)
yarn test:live   # Opt-in live check against medicaments-api.giygas.dev (RUN_LIVE_API_TESTS=true)
```

### Frontend (`front/`)
```bash
cd front
yarn lint        # ESLint check
yarn typecheck   # nuxi prepare && vue-tsc --noEmit
yarn test        # Vitest unit tests
NUXT_PUBLIC_USE_EMULATORS=true yarn generate   # Static bundle for local Hosting Emulator
yarn dev         # Build backend, start emulators, run migrations, and start Nuxt dev server
```

### End-to-End Tests (`e2e/`)
Build `back` and generate `front` with emulator support first, then run the Cypress suite against Firebase Emulators:
```bash
yarn --cwd back build
NUXT_PUBLIC_USE_EMULATORS=true yarn --cwd front generate
yarn --cwd e2e typecheck
FUNCTIONS_DISCOVERY_TIMEOUT=60 yarn --cwd e2e firebase emulators:exec --only auth,firestore,functions,storage,hosting "yarn cy:run:local"
```
