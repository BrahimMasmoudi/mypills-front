# Incremental Dependency Upgrades and External Medication API Hardening

* **Author:** BrahimMasmoudi
* **Status:** Accepted
* **Date:** 2026-11-26

--------------------------------------------------------------------------------

## Overview

`mypills-front` runs on Node 24 across three standalone Yarn subprojects (`back`, `front`, and `e2e`) whose dependencies lag upstream releases (such as `back`'s ESLint v8 setup) and whose verification gates and external API protections are incomplete. This design defines a two-phase plan: Phase A establishes offline verification gates and external medication lookup error handling and timeouts, and Phase B upgrades dependencies incrementally (`back`, then `front`, then `e2e`) while verifying that all lint, typecheck, build, unit, and E2E checks pass.

Domain identifiers used in this document:

* `cip13`: 13-digit French pharmaceutical presentation barcode identifier (or 12-digit code after leading-zero stripping in non-GS1 scans).
* `cis`: 8-digit French medication code mapped from `cip13` via Firestore (`cip_to_cis`) and used to query the external medication API.
* `bareCode`: Medication barcode field stored on the client form and saved medication document (preserving the parsed `cip13`).
* `expiryDate`: Medication expiration date parsed from GS1 Application Identifier `17` during scans (or chosen manually via the dialog month/year picker).

## The Problem

1. **Missing verification gates and misplaced dependencies:**
   * `back` lacks a standalone typecheck script, excludes database migrations from typechecking, and places runtime imports (`date-fns` and `@google-cloud/tasks`) in `devDependencies` while keeping unused/CLI packages (`firebase`, `fireway`) in `dependencies`.
   * `front` has `vue-tsc` installed without a `typecheck` or unit `test` script, and places build/CLI tools (`typescript`, `vue-tsc`, `esbuild`, `firebase-tools`) in `dependencies` instead of `devDependencies`.
   * `e2e` has no `scripts` block in `package.json`.
   * Neither PR nor production GitHub workflows run `back`/`front` linting or frontend typechecks before deploying.
2. **Live external API coupling blocks verification:** `back`'s default unit test suite executes an external API test against `https://medicaments-api.giygas.dev/medicament/id/60234100` and asserts exact equality on mutable fields such as medicine price. Any third-party price change or brief API outage blocks CI deployments and interferes with bisecting regressions to a single commit.
3. **Unhandled external API failures break the medication creation flow:** The backend lookup adapter disables TLS certificate verification process-wide in the local emulator, issues HTTP requests with no timeout or runtime validation, and collapses upstream failures into generic internal errors. On the client, the medication creation dialog maps all lookup failures to a `"not found"` modal dialog toast, fails silently on empty parsed barcodes, allows mobile submission without a medication name, drops the scanned `bareCode` on lookup failure and manual custom-name entry, double-toasts when incrementing an existing duplicate medication from the confirmation dialog, and discards entered data if creation fails.

Stabilizing the verification harness and external API fallback path in Phase A allows Phase B dependency upgrades across `back`, `front`, and `e2e` to proceed with isolated commits and clear failure attribution.

## Goals

* Establish repeatable verification gates across subprojects (`lint`, `typecheck`, `build`, and offline unit tests in `back`; `lint`, `typecheck`, `test`, and `generate` in `front`; `typecheck` and Cypress E2E in `e2e`) and run them in GitHub Actions before deployment.
* Eliminate third-party test flakiness in default `yarn test` runs by mocking external HTTP responses while preserving an isolated opt-in check for live medication API schema verification.
* Bound external medication API failures and tolerate secondary schema drift via 5-second timeouts, standard TLS enforcement, required medication-name validation with per-field DTO defaults, structured failure logs, and distinct backend error codes.
* Display a non-blocking error toast and preserve scanned `bareCode` and `expiryDate` values when external lookup or save fails so users can complete medication creation manually.
* Upgrade dependencies across `back`, then `front`, then `e2e` (including ESLint flat-config migration in `back` and `dependencies`/`devDependencies` cleanup), adapting code and tests so all verification gates pass.

## Non-Goals

* Replacing `medicaments-api.giygas.dev` with a new medication provider, adding upstream retry loops/circuit breakers, or building a Firestore cache/offline mirror of the French medication database.
* Merging `back`, `front`, and `e2e` into a single root Yarn workspace with a shared `node_modules`.
* Expanding frontend unit testing beyond non-DOM TypeScript parsing logic; UI component rendering and fallback interactions remain covered by Cypress E2E.
* Running full live staging deployments on every intermediate dependency-upgrade commit or automating staging promotion pipelines.

## Critical User Journeys (CUJs)

### CUJ 1: Barcode Scan Fallback When External Medication API Fails

* **Given**: An authenticated user opens the medication creation dialog, scans a medication DataMatrix/barcode, and `medicaments-api.giygas.dev` times out, returns an HTTP error, or returns a malformed payload.
* **When**: The client invokes the backend medication-details lookup with the parsed `cip13` code.
* **Then**:
  * The backend lookup adapter aborts at the 5-second timeout (or rejects the invalid response), logs structured error diagnostics, and throws a typed adapter error, which the entry point maps to a non-2xx error code.
  * The frontend shows a non-blocking error toast explaining that external medication lookup failed, preserves the scanned `bareCode` and `expiryDate` even when the user types a custom name manually, and lets the user save the medication.

### CUJ 2: Dependency Upgrade Verification Across Subprojects

* **Given**: Phase A baseline scripts, CI checks, and API hardening are merged and passing.
* **When**: An engineer upgrades a major dependency, a coupled dependency cluster, or a batched semver-compatible minor/patch group in `back`, `front`, or `e2e` and adapts affected code or configs.
* **Then**: `lint`, `typecheck`, `build`/`generate`, and mocked unit tests pass locally for that commit without calling live external APIs, and local emulator-backed Cypress E2E tests pass against the built frontend bundle at each subproject milestone before merging.

## Proposed Architecture

The design separates execution into two sequential phases so verification tooling and API error handling stabilize before any dependency version upgrades begin.

```text
Phase A: Baseline Gates + External API Hardening (Current Dependencies)
  [A.1 Standardized subproject scripts, dependency cleanup & pre-deploy CI gates]
        -> [A.2 Harden external lookup, DTO safety, dialog fallback & infrastructure tests]
        |
        v
Phase B: Ordered Dependency Upgrade Sequence
  [back clusters & batches] -> (Emulator E2E milestone)
        -> [front clusters & batches] -> (Emulator E2E milestone)
        -> [e2e cluster] -> (PR Emulator E2E & Merge Production Verification)
```

### Phase A: Verification Baseline and External API Hardening

#### Phase A.1: Verification Baseline & CI Gating

1. **Subproject Verification Contracts (`back`, `front`, `e2e`):**
   * `back` cleans stale build outputs before standard `npm`/`node`-compatible production compilation (required because `firebase deploy` resolves Cloud Functions dependencies from `back/lib` without Yarn; excluding tests and migrations), adds full typechecking (covering source, tests, and database migrations), isolates offline unit tests from opt-in live API checks, and cleans up `dependencies` vs. `devDependencies`.
   * `front` adds `typecheck` (preparing Nuxt types before running `vue-tsc`) and Vitest unit tests for non-DOM TypeScript barcode parsing logic, fixes existing strict `vue-tsc` errors, moves build/CLI tools (including `firebase-tools`) to `devDependencies` so local `dev` emulator scripts keep working, disables `nuxt-vuefire` build-time emulator detection so offline static bundles keep emulator wiring without polling port `4400`, connects Auth/Firestore/Storage/Functions emulators in the Firebase client plugin behind one explicit build/generate-time `runtimeConfig.public` emulator flag, and aligns emulator hosts to `localhost` across the Firebase client plugin and Cypress.
   * `e2e` installs `firebase-tools` in `devDependencies`, updates TypeScript target/module settings for Node/Cypress APIs, adds `typecheck` and local emulator Cypress runner scripts targeting the Firebase Hosting emulator port, and covers the manual fallback journey end-to-end.
2. **CI Pipeline Alignment:**
   * PR, manual staging, and production merge GitHub workflows run subproject `lint`, `typecheck`, `build`/`generate`, and offline `test` gates before migrations or deployment.
   * Non-E2E CI jobs skip Cypress binary downloads and prepare Nuxt types unconditionally (on both cache hits and cache misses) before running `front` lint, typecheck, or build commands.
   * Backend CI tests run offline with mocked dependencies and without live Firestore or Gemini credentials in all workflows.
   * PR E2E checks run against ephemeral local Firebase Emulators serving the built static bundle (configured with non-secret emulator Firebase web settings and compiled backend functions) through the Hosting emulator, avoiding shared staging contention across concurrent PRs; database migrations and production deploys run on merge, while staging deploys move to an explicit manual dispatch workflow (with the `runtimeConfig.public` emulator flag explicitly disabled during both staging and production builds).

#### Phase A.2: External API Hardening, Adapter Tests & Manual Fallback Flow

```text
Medication Creation Dialog
  |-- parse barcode -> { cip13, expiryDate }
  |-- [empty cip13 -> clear bareCode; non-blocking error toast ("invalid barcode"); abort lookup]
  |-- retain scanned bareCode + expiryDate across lookup and manual custom-name entry
  v
Medications Store
  |-- catches lookup error -> logs non-PII lookup failure analytics -> rethrows
  v
Backend Medication Lookup Entry Point
  |-- validate 12-or-13-digit string cip13 -> [invalid -> invalid-argument]
  |-- Medication Lookup Use Case
        |-- Firestore CIS Repository -> [null -> not-found]
        |-- Medication API Gateway -> External HTTP Adapter
              |-- standard TLS enforced across all environments
              |-- 5-second request timeout covering headers and JSON parsing
              |-- require non-empty medication name; warn on non-array details
              |-- map upstream 404 -> not-found; timeout/HTTP/network/parse -> typed adapter error
              |-- log structured failure diagnostics
        |-- DTO Mapper [type-safe sanitized non-undefined DTO values]
  v
Error Mapping
  |-- not-found -> not-found error
  |-- timeout -> deadline-exceeded error
  |-- HTTP / network / invalid response -> unavailable error
  |-- unexpected DB/CIS error -> internal / unexpected error
  v
Frontend Fallback
  |-- not-found -> non-blocking queue error toast ("not found")
  |-- invalid-argument -> non-blocking queue error toast ("invalid barcode"; clear bareCode)
  |-- unavailable / deadline-exceeded / internal / unexpected -> non-blocking queue error toast ("service unavailable")
  |-- dialog stays open with scanned bareCode (for valid codes) + expiryDate preserved for manual save
```

1. **Standard TLS Enforcement and Bounded Timeouts:** Remove process-wide TLS disabling and per-request TLS override code; enforce standard TLS across all environments. Bound the entire HTTP request and JSON body read at a 5-second timeout, map upstream 404 responses to not-found, and log structured error diagnostics.
2. **Identity Validation & Mapper Defaults:** Validate directly inside the adapter that the primary medication name field is a non-empty string without adding a schema library, warn if secondary list structures drift, and enforce type-checked collections/strings/finite-numbers and non-`undefined` defaults across all DTO fields inside the mapper without disabling global Firestore undefined checks.
3. **Decoupled Adapter Tests:** Move adapter tests out of the domain layer into the infrastructure layer using mocked HTTP replies in default `yarn test`, and isolate live external API schema checks behind an opt-in command run at milestones.
4. **Client Fallback & Toast Separation:** In the medication creation dialog, clear `bareCode` and surface an invalid-barcode toast when barcode parsing yields an empty identifier. When a scanned medication matches an existing entry (the duplicate-medication confirmation flow), isolate `incrementPills` errors from lookup error handling so a failed increment emits an error toast and keeps the dialog open without emitting success feedback. Move lookup and creation-failure error feedback onto the non-blocking queue toast system so failed saves keep the dialog open with user input intact, and ensure single non-duplicate success feedback after save. Preserve scanned `bareCode` (for valid barcode lookups) and `expiryDate` across lookup failures and manual custom-name entry (clearing them on duplicate-confirmation cancel), enforce name validation on mobile submission, and classify lookup errors into three buckets matching the diagram (`not-found`, `invalid-argument`, and `unavailable` / `deadline-exceeded` / `internal` / unexpected mapped to the unavailable-service message).

### Phase B: Incremental Dependency Upgrade Strategy

Upgrades execute in order (`back` -> `front` -> `e2e`) after Phase A merges:

* **Scope & Batching:** Migrate `back` from ESLint v8 to ESLint v9/v10 flat config, align `back` TypeScript/Jest/Firebase/date clusters and `front`/`e2e` framework clusters, and batch semver-compatible minor/patch updates per subproject to limit commit count while isolating major upgrades, standalone Firebase CLI updates, and coupled peer-dependency clusters into one commit each.
* **Milestone Verification:** Run static and unit checks on every commit, run local emulator-backed Cypress E2E against the built frontend bundle after completing each subproject (`back`, `front`, `e2e`), and resolve exact target package versions from `yarn outdated` in a Phase B implementation addendum before Phase B commits begin.

## Alternatives Considered

### Alternative A: Strict Single-Package Commits for Every Dependency (Including Minor/Patch)

* **Pros**: Isolates every `package.json` line change to its own commit.
* **Cons**: Fails `yarn install`, `lint`, or `typecheck` on intermediate commits when peer-dependency ranges are coupled (such as ESLint + TypeScript-ESLint + Google ESLint config in `back`, Nuxt + modules + Vue TypeScript checker in `front`, and Cypress + Firebase test helpers in `e2e`), and creates 20+ separate commits for minor/patch updates.
* **Reason for Rejection**: Per-commit verification fails when coupled toolchains cannot resolve independently; isolating major upgrades and coupled clusters while batching semver-compatible minor/patch updates per subproject preserves bisectability without broken intermediate commits.

### Alternative B: Consolidating Into a Root Yarn Workspaces Monorepo

* **Pros**: Centralizes shared tooling (`firebase-tools`, `typescript`, `eslint`) and reduces duplicated dependencies across `back`, `front`, and `e2e`.
* **Cons**: Widens the change scope by restructuring three separate Yarn v1 lockfiles, Cloud Functions deployment packaging, Nuxt build paths, and CI cache keys alongside dependency upgrades.
* **Reason for Rejection**: Restructuring repository packaging delays API hardening; subprojects remain separate while keeping `firebase-tools` in `front` and `e2e` `devDependencies` where local dev and CI E2E invoke it.

### Alternative C: Strict Full-Mirror Schema Validation (`zod` / Full Upstream Response Schema)

* **Pros**: Detects every upstream schema change across all fields in the external API payload.
* **Cons**: Adds an extra runtime validation dependency and rejects usable medication lookups when unused metadata or secondary fields change.
* **Reason for Rejection**: Checking the primary medication name field directly in the adapter and enforcing non-`undefined` defaults in the DTO mapper protects downstream writes without extra dependencies or false outages.

### Alternative D: Adding Upstream Retries or Firestore Caching on the External Lookup Adapter

* **Pros**: Masks transient upstream failures or short outages.
* **Cons**: Retries extend latency past the 5-second interactive scan budget, and Firestore caching introduces synchronization complexity and BDPM (Base de Données Publique des Médicaments) mirroring maintenance.
* **Reason for Rejection**: A 5-second timeout into manual fallback caps wait time without Firestore caching or extra lifecycle complexity.

### Alternative E: Running Staging Deploy and Cypress E2E After Every Single Dependency Commit

* **Pros**: Exercises full Firebase Hosting and Cloud Functions integration on every commit.
* **Cons**: Adds multi-minute deploy/E2E overhead per commit across all upgraded packages and repeatedly mutates the shared staging environment.
* **Reason for Rejection**: Running `lint`, `typecheck`, `build`/`generate`, and mocked unit tests per commit—paired with ephemeral emulator E2E per subproject milestone and in PR CI—verifies compilation, logic, and E2E flows without staging contention.

## Risks & Limits

* **Live TLS verification under Node 24:** Both the emulator adapter branch and the existing integration test previously disabled TLS verification. Before Phase A merges, the live handshake against `medicaments-api.giygas.dev` must be verified under Node 24; if its certificate chain fails default CAs, an explicit CA bundle update must be added before removing the override.
* **Mock-to-live contract drift:** Because live API checks are opt-in and excluded from default CI `yarn test`, mock fixtures can drift from `medicaments-api.giygas.dev` between releases. Mitigated by requiring only the medication name field, defaulting secondary DTO fields, and requiring the opt-in live check to pass at Phase A completion and after `back` runtime or HTTP dependency upgrades.
* **Uncached upstream dependency without retries or rate-limit protection:** Each scan lookup calls `medicaments-api.giygas.dev` 1:1 with a single 5-second timeout and no retry, circuit breaker, or upstream cache, exposing lookups to upstream rate limits or outages. Mitigated by capping wait time at 5 seconds and falling back immediately to manual entry with preserved `bareCode` and `expiryDate`.
* **Emulator-vs-production parity:** Running PR E2E against local Firebase Emulators with browser-intercepted lookup responses does not exercise production IAM, Cloud Functions cold starts, ReCaptchaV3 App Check enforcement (bypassed by test tokens), production security rules, or live `cip_to_cis` lookups. Mitigated by merge-time deployment checks, backend unit/integration specs, and the manual-dispatch staging verification workflow.
* **Database migration breakage and Phase B runtime regressions:** Database migrations execute via TypeScript compilation at runtime and were excluded from `tsc`, while `front` (Nuxt/Vue) and `e2e` (Cypress/Node) upgrades can pass static checks yet regress at runtime. Mitigated by including migrations in `back` typechecking and running static generation plus emulator E2E milestones after each subproject.
* **ESLint v9/v10 plugin and rule migration compatibility:** The Google ESLint preset uses core rules removed in ESLint v9, `@typescript-eslint` v8 drops legacy stylistic formatting rules, `eslint-plugin-import` lags behind ESLint v10, and Yarn v1 ignores peer mismatch warnings unless checked. Mitigated by dropping the Google preset, migrating or dropping removed stylistic rules, switching to a flat-config-compatible import plugin (or holding `back` ESLint at v9 if blocked), and using Yarn dependency resolutions only where verified.

## Non-Functional Requirements

* **Security & TLS Isolation:** Production outbound adapters contain no global or per-request TLS verification overrides; standard TLS applies to every outbound call (Firebase Admin, Cloud Tasks, AI advisor client, and the external medication adapter). Production and staging builds explicitly keep emulator flags disabled.
* **Latency & Cloud Function Concurrency:** Bound outbound external API requests and body reads at a 5-second timeout so unresponsive upstream calls fail without holding Cloud Functions slots up to the 60-second function timeout.
* **Observability:** Emit structured backend error/warning logs (excluding user PII) and lookup-failure analytics events whose parameters record only error category (never raw scanned barcode strings; note analytics initializes only in staging/production environments).
* **Rollout & Rollback:** Phase A must merge and pass all CI gates before Phase B commits start; Phase B dependency commits isolate package and lockfile changes so regressions can be bisected and reverted in reverse order with `yarn.lock` regeneration.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Phase A Checkpoints & Target Files

Execute Phase A in four sequential checkpoints so `lint`, `typecheck`, `build`/`generate`, and tests remain valid at every stage:

#### Checkpoint 1 — `back` Scripts, Hardening, and Offline Test Isolation

1. **`back/package.json` & `back/yarn.lock`** (Modify)
   * **Type / Scope**: Package Manifest & Lockfile
   * **Proposed Changes**:
     * Add `"typecheck": "tsc --noEmit"`.
     * Update `"build": "rm -rf lib && tsc -p tsconfig.build.json"` (remaining `npm`-compatible for `firebase.json` `predeploy`) and `"build:watch": "tsc -p tsconfig.build.json --watch"`.
     * Keep `"test": "jest"` offline and add `"test:live": "RUN_LIVE_API_TESTS=true jest src/infrastructure/adapters/external/giygas-api-adapter.live.spec.ts"`.
     * Move `date-fns` and `@google-cloud/tasks` from `devDependencies` to `dependencies`, move `fireway` (Firestore migration CLI) from `dependencies` to `devDependencies`, and remove unused `firebase` client SDK from `back/package.json`.
2. **`back/tsconfig.json`, `back/tsconfig.build.json`, `back/tsconfig.dev.json`, & `back/.eslintrc.js`** (Modify / Create)
   * **Type / Scope**: TypeScript & Lint Configuration
   * **Proposed Changes**:
     * Update `back/tsconfig.json` `"include"` to `["src", "migrations"]` and `"exclude"` to `["node_modules", "lib"]` so `typecheck` checks source, tests, and `fireway` migrations (all 9 existing `back/migrations/*.ts` files pass strict `tsc --noEmit` cleanly).
     * Create `back/tsconfig.build.json` extending `./tsconfig.json` with `"include": ["src"]` and `"exclude": ["node_modules", "migrations", "lib", "**/*.spec.ts", "**/*.test.ts"]` so `build` omits tests and migrations from `back/lib/`.
     * Add `"jest.setup.ts"` to `back/tsconfig.dev.json` `"include"` (`[".eslintrc.js", "jest.setup.ts"]`) and add `"migrations/**/*"` to `ignorePatterns` in `back/.eslintrc.js` (alongside existing `back/.eslintignore` entries) so `yarn --cwd back lint` passes cleanly before Phase B flat-config migration.
3. **`back/src/infrastructure/adapters/external/external-api-error.ts`** (Create)
   * **Type / Scope**: Adapter Error Class
   * **Proposed Changes**: Export `ExternalApiErrorKind = 'TIMEOUT' | 'HTTP_ERROR' | 'NETWORK_ERROR' | 'SCHEMA_ERROR'` and `class ExternalApiError extends Error` with multi-line constructor (no semicolons per `back/.eslintrc.js`): `constructor(public readonly errorKind: ExternalApiErrorKind, message: string, public readonly meta: { httpStatus?: number, cis?: string, durationMs?: number, issues?: string[] } = {})` calling `super(message)` and setting `this.name = 'ExternalApiError'`.
4. **`back/src/types/cip13.ts`** (Modify)
   * **Type / Scope**: Value Object Validation
   * **Proposed Changes**: Mirror `Cis.isValid` by adding `public static isValid(value: unknown): value is string` (`typeof value === 'string' && /^\d{12,13}$/.test(value)`) and checking `if (!Cip13.isValid(value)) throw new Error('Invalid CIP13 code')` inside `Cip13.create(value)`, rejecting non-strings and path-injecting inputs (`/`, `.`, `..`) before Firestore `.doc()`.
5. **`back/src/infrastructure/adapters/external/giygas-api-adapter.ts`** (Modify)
   * **Type / Scope**: External API Adapter
   * **Proposed Changes**:
     * Remove `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` so standard TLS verification remains enabled across all environments (confirming live Node 24 TLS handshake against `medicaments-api.giygas.dev` before merging Phase A).
     * Add `constructor(private readonly timeoutMs = 5000)`, record `const startMs = Date.now()` before `fetch`, and pass `{ signal: AbortSignal.timeout(this.timeoutMs) }` to `undici` `fetch` (covering headers and `await response.json()` within the same 5-second abort budget).
     * Map `response.status === 404` to `new Error('NOT_FOUND_IN_DB')`; map other `!response.ok` responses to `ExternalApiError('HTTP_ERROR', ..., { httpStatus: response.status, cis: cis.getValue(), durationMs: Date.now() - startMs })`.
     * Wrap `await response.json()` in a local `try/catch` mapping `SyntaxError` to `ExternalApiError('SCHEMA_ERROR', ...)`; validate `typeof parsed?.elementPharmaceutique === 'string' && parsed.elementPharmaceutique.trim().length > 0` (`SCHEMA_ERROR` if missing/empty); log `firebase-functions/logger.warn` with `{ cis: cis.getValue(), driftedFields }` if `composition` or `presentation` is present (non-null) and not an array.
     * In the outer `catch` block: if `err?.message === 'NOT_FOUND_IN_DB'`, rethrow as-is; otherwise normalize (`err instanceof ExternalApiError` -> keep, `err?.name === 'TimeoutError' || err?.name === 'AbortError'` -> `ExternalApiError('TIMEOUT', ..., { cis: cis.getValue(), durationMs: Date.now() - startMs })`, remaining errors -> `ExternalApiError('NETWORK_ERROR', ..., { cis: cis.getValue(), durationMs: Date.now() - startMs })`), log `{ cis: cis.getValue(), errorKind, httpStatus, durationMs, issues }` via `firebase-functions/logger.error`, and throw. Return `parsed as MedicamentResponse`.
6. **`back/src/utils/mapper.ts` & `back/src/application/usecases/medication/get-details/get-medication-details.spec.ts`** (Modify)
   * **Type / Scope**: Mapper & Use-Case Unit Test
   * **Proposed Changes**:
     * In `toMedicationDto`: guard `Array.isArray(...)` and `item && typeof item === 'object'` for `voiesAdministration`, `composition`, `presentation`, and `parseMedicationUnit` input; guard `typeof data.surveillanceRenforcee === 'string'` before `.toLowerCase()`; default missing scalar strings to `''`, arrays to `[]`, `enhancedSurveillance` to `false`, `quantity` to `1`, and presentation `barcode13`/`price` to `0` (`Number.isFinite(p.cip13) ? p.cip13 : 0` and `Number.isFinite(p.prix) ? p.prix : 0`, keeping `$firestore` `ignoreUndefinedProperties` untouched).
     * In `get-medication-details.spec.ts`: fix `surveillanceRenforce` -> `surveillanceRenforcee`, remove excess `denomination`, add `cis`, `generiques`, and `conditions` to `mockApiResponse`, update both `mockCis` declarations (`lines 27 and 80`) to `Cis.create('61234567')`, remove `as any`, and add a unit test verifying `toMedicationDto` handles missing optional fields (`''`, `[]`, `false`, `1`, `0`), non-array `voiesAdministration`/`composition`/`presentation`, and non-finite `cip13`/`prix` values (`NaN`, `null`, string).
7. **`back/src/infrastructure/entry-points/medication/get-details/index.ts` & `back/src/infrastructure/entry-points/medication/get-details/index.spec.ts`** (Modify)
   * **Type / Scope**: Cloud Function Entry Point & Spec
   * **Proposed Changes**:
     * Validate `typeof data?.cip13 === 'string' && Cip13.isValid(data.cip13.trim())` **before** the `try` block, throwing `HttpsError('invalid-argument', 'Valid cip13 is required')` on invalid inputs (so it is never caught and downgraded to `'internal'`), then pass `Cip13.create(data.cip13.trim())` into `useCase.execute(...)`.
     * Inside `catch`: map `e?.message === 'NOT_FOUND_IN_DB'` to `HttpsError('not-found', 'Medication not found in database')`, `ExternalApiError` (`TIMEOUT`) to `HttpsError('deadline-exceeded', 'External medication service timed out')`, `ExternalApiError` (other kinds) to `HttpsError('unavailable', 'External medication service unavailable')`, and all remaining unexpected errors (such as DB or `Cis.create` failures, logged via `firebase-functions/logger.error`) to `HttpsError('internal', 'Search failed')`.
     * Clean pre-existing `quotes`, `semi`, and `object-curly-spacing` lint violations in `get-details/index.ts` (`lines 6, 8`) and `index.spec.ts` (`line 6`). Update `index.spec.ts` to use `'3400999999999'` for `NOT_FOUND_IN_DB` and assert all six `HttpsError` cases (`invalid-argument`, `not-found`, `deadline-exceeded`, `unavailable`, `internal`, and `unauthenticated`).
8. **`back/src/domain/gateway/medicament-api-gateway.spec.ts` (Delete), `back/src/infrastructure/adapters/external/giygas-api-adapter.spec.ts` (Create), `back/src/infrastructure/adapters/external/giygas-api-adapter.live.spec.ts` (Create), & `back/jest.setup.ts` (Modify)**
   * **Type / Scope**: Infrastructure Adapter Tests & Jest Environment
   * **Proposed Changes**:
     * Delete `back/src/domain/gateway/medicament-api-gateway.spec.ts`.
     * Create `giygas-api-adapter.spec.ts` using `undici`'s `MockAgent` + `setGlobalDispatcher(mockAgent)` (restoring the previous dispatcher in `afterAll`) and `new GiygasApiAdapter(50)` to test valid payloads (with unknown extra fields), non-array optional fields (succeeds with warning), missing `elementPharmaceutique`, non-JSON / `SyntaxError`, HTTP `404` (`NOT_FOUND_IN_DB`), HTTP `500` (`HTTP_ERROR`), network errors (`NETWORK_ERROR`), and 50ms timeouts (`TIMEOUT`).
     * Create `giygas-api-adapter.live.spec.ts` guarded by `const describeLive = process.env.RUN_LIVE_API_TESTS === 'true' ? describe : describe.skip` to verify live `https://medicaments-api.giygas.dev/medicament/id/60234100` contract shape under Node 24 without asserting volatile fields such as `prix`.
     * Update `back/jest.setup.ts` to remove its leading blank line and trailing semicolons (satisfying `back/.eslintrc.js`), and set `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`, and `GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key'` unconditionally (removing `if (!process.env.GITHUB_ACTIONS)`) so `back/src/infrastructure/config/firebase.ts` imports and all existing mocked `back` specs run offline with zero live GCP/Gemini credentials.
   * **Checkpoint 1 Verification**: `yarn --cwd back lint && yarn --cwd back typecheck && yarn --cwd back build && yarn --cwd back test`.

#### Checkpoint 2 — `front` Fallback UI, Emulator Config, Typecheck Fixes, and Vitest

9. **`front/package.json`, `front/yarn.lock`, `front/nuxt.config.ts`, `front/app/plugins/firebase.ts` (Modify), & `front/vitest.config.ts` (Create)**
   * **Type / Scope**: Frontend Manifest, Emulator Flag & Unit Test Runner
   * **Proposed Changes**:
     * Add `"typecheck": "nuxi prepare && vue-tsc --noEmit"` and `"test": "vitest run"` scripts; install `vitest` (`^3.0.0`) in `devDependencies`.
     * Move `typescript`, `vue-tsc`, `esbuild`, and `firebase-tools` from `dependencies` to `devDependencies` (keeping `@nuxt/ui`, `@pinia/nuxt`, `@vite-pwa/nuxt`, and `nuxt-vuefire` in `dependencies`, and keeping `firebase-tools` in `front` `devDependencies` so `front` `"dev"` keeps working).
     * Update `front/nuxt.config.ts`: set `vuefire.emulators: { enabled: false }` and remove `vuefire.emulators.hosts` (disabling `nuxt-vuefire`'s build-time port-`4400` probing so offline static bundles keep emulator wiring when generated before `firebase emulators:exec`); add one runtime config flag `runtimeConfig.public.firebase.useEmulators` evaluating `process.env.NUXT_PUBLIC_USE_EMULATORS === 'true' || process.env.NODE_ENV !== 'production'`; remove `functions.enableEmulator` and the unused `storage.{enableEmulator,emulatorPort,emulatorHost}` keys; and align `localhost` emulator settings under `runtimeConfig.public.firebase` (`functions: { emulatorHost: 'localhost', emulatorPort: 5001 }`, `authEmulatorUrl: 'http://localhost:9099'`, `firestoreEmulatorHost: 'localhost'`, `firestoreEmulatorPort: 8080`, `storageEmulatorHost: 'localhost'`, `storageEmulatorPort: 9199`).
     * Update `front/app/plugins/firebase.ts`: change line 1 `import type { Firestore } from '@firebase/firestore/lite'` to import `Firestore`, `getFirestore`, and `connectFirestoreEmulator` from `'firebase/firestore'` (matching `vuefire`'s `useFirestore()` return type and `front/app/store/documents.ts` under strict `vue-tsc`); read `useEmulators` from `$config.public.firebase`; when `useEmulators` is true (guarded cleanly per `firebaseApp`), connect Auth via `connectAuthEmulator(auth, ...)` (`firebase/auth`, when `auth` is non-null) **before** `onAuthStateChanged` and `getCurrentUser()`, connect Firestore via `connectFirestoreEmulator(getFirestore(firebaseApp), ...)` (`firebase/firestore`) and Storage via `connectStorageEmulator(getStorage(firebaseApp), ...)` (`firebase/storage`), and replace `functionsConfig.enableEmulator` + `'127.0.0.1', 5001` at lines 115–116 with `useEmulators` + `connectFunctionsEmulator(functionsInstance, functionsConfig.emulatorHost, functionsConfig.emulatorPort)`.
     * Configure `front/vitest.config.ts` with `test: { environment: 'node', include: ['tests/**/*.spec.ts'] }` and `resolve.alias` mapping `~` -> `./app`.
10. **`front/app/store/medications.ts`, `front/app/locales/en.json`, & `front/app/locales/fr.json`** (Modify)
    * **Type / Scope**: Store Error Telemetry & Locales
    * **Proposed Changes**: In `medications.ts` `getMedicationDetails`, catch errors, emit `$analytics && logEvent($analytics, 'barcode_lookup_failed', { error_code: (e as any)?.code ?? 'unknown' })` (no barcode/PII), and rethrow. Add `scanner.external_api_error_message` (`"Medication service is unavailable. Please enter medication details manually."` / `"Le service des médicaments est indisponible. Veuillez saisir les informations manuellement."`) and `scanner.invalid_barcode_message` (`"Invalid barcode format. Please enter medication details manually."` / `"Format de code-barres invalide. Veuillez saisir les informations manuellement."`) to `en.json` and `fr.json`.
11. **`front/app/components/molecules/medications/CreateMedicationDialog.vue`, `front/app/layouts/default.vue`, & `front/app/components/molecules/QueuedToast/QueueToast.vue`** (Modify)
    * **Type / Scope**: Frontend Fallback UI, Typecheck Fixes & Toast Selector
    * **Proposed Changes**:
      * *State retention (`CreateMedicationDialog.vue`):* If `!cip13` after `parseBarcode(code)` (`line 537`), call `useQueueToast().addToast('error', t('scanner.invalid_barcode_message'))`, clear `medication.value.bareCode = ''`, and return; otherwise assign `medication.value.bareCode = cip13` alongside `expiryDate` before calling `getMedicationDetails`. Retain existing `medication.value.bareCode` and `expiryDate` inside `handleCustomName()` (`#no-data` custom name entry), clear `medication.value.bareCode = ''` alongside `name` and `expiryDate` inside the duplicate-cancel `else` branch (`lines 586–590`), and clear `medication.value.bareCode = ''` when `e?.code === 'functions/invalid-argument'`.
      * *Error & creation toasts (`CreateMedicationDialog.vue`):* Replace `openToast` in `if (!data)` with `useQueueToast().addToast('error', t('scanner.not_found_message'))`; isolate `medicationsStore.incrementPills` and `close('success')` inside a nested `try/catch` (calling `useQueueToast().addToast('error', t('error'))` and returning without calling `close('success')` if incrementing fails); in lookup `catch (e: any)`, classify `e?.code` (`functions/not-found` -> `scanner.not_found_message`, `functions/invalid-argument` -> `scanner.invalid_barcode_message`, `functions/unavailable` / `functions/deadline-exceeded` / fallback -> `scanner.external_api_error_message`) via `useQueueToast().addToast('error', ...)`; in `performCreation()`, catch creation errors and call `useQueueToast().addToast('error', t('error'))` while keeping the dialog open (instead of `close('error')`); on duplicate increment (`line 584`), remove `openToast('success', ...)` before `close('success')` so `layouts/default.vue` displays the single post-close success toast; remove the unused `openToast` import.
      * *Template & typecheck fixes (`CreateMedicationDialog.vue`):* Bind `v-model:menu="isMenuOpen"` on both desktop (`line 30`) and mobile (`line 247`) `<v-combobox>` elements and set `isMenuOpen.value = false` inside `handleCustomName()` so selecting the custom option closes the dropdown overlay before confirmation; add `data-cy="scan-barcode-button"` to both desktop (`line 80`) and mobile (`line 296`) scan buttons; add `data-cy="custom-medication-option"` to both desktop and mobile `#no-data` `<v-list-item>` elements; add `:disabled="!medication.name"` and `data-cy="confirm-create-button"` to the mobile confirm button; remove the duplicate `medication.value.details = val.details` line; import `QueueToastType`, remove `as any` at line 66 (`@click:close="medication.name = null"`) and line 477 (`name: null`), type local state as `Omit<Medication, 'name'> & { name: string | null }`, widen `updateViewMode` (`line 500`) to `(mode: 'month' | 'months' | 'year') => void`, and in `performCreation()` guard `if (!medication.value.name) return` before calling `createMedication({ ...medication.value, name: medication.value.name })`.
      * *Parent layout (`layouts/default.vue`):* In `openAddMedicationDialog`, return early if `!user?.uid`, pass `userUid: user.uid`, `email: user.email ?? ''`, and `selectedCountry: selectedCountry.value ?? 'OTHER'`, and wrap `createMedication` as `async (med: Medication) => { await medicationStore.createMedication(med) }` so it returns `Promise<void>`.
      * *Toast selector (`QueueToast.vue`):* Add ``:data-cy="`queue-toast-${type}`"`` on the root toast element using the destructured `type` prop.
12. **`front/tests/composables/useBarcodeParser.spec.ts`** (Create)
    * **Type / Scope**: Frontend Unit Tests (No DOM)
    * **Proposed Changes**: Explicitly `import { describe, it, expect } from 'vitest'` and verify GS1 DataMatrix parsing (`01` + `17` expiry), GS1 `01` without `17` (`expiryDate: null`), 13-digit leading-zero stripping, 13-digit code not starting with `'0'`, and empty/control-char-only input.
   * **Checkpoint 2 Verification**: `yarn --cwd front typecheck && yarn --cwd front lint && yarn --cwd front test && yarn --cwd front generate`.

#### Checkpoint 3 — `e2e` Tooling and Manual Fallback Spec

13. **`e2e/package.json`, `e2e/yarn.lock`, `e2e/tsconfig.json`, `front/app/plugins/html5-qrcode-patch.client.ts`, & `e2e/tests/medication/fallback.cy.ts`** (Modify / Create)
    * **Type / Scope**: E2E Tooling & Fallback Coverage
    * **Proposed Changes**:
      * Update `e2e/tsconfig.json` `"target"` and `"lib"` from `es5` to `ES2022` (plus `dom`).
      * Install `firebase-tools` (`^14.26.0`) in `e2e/package.json` `devDependencies` and add `"typecheck": "tsc --noEmit"` and `"cy:run:local": "CYPRESS_BASE_URL=http://localhost:5000 cypress run --browser chrome"` (matching `firebase.json` Hosting emulator port `5000`).
      * Update `front/app/plugins/html5-qrcode-patch.client.ts`: declare `override start(...)` on `PatchedHtml5Qrcode` (matching `front/.nuxt/tsconfig.json`'s `"noImplicitOverride": true` and `Html5Qrcode.start`) and set a module-level `useEmulators` flag (or define `PatchedHtml5Qrcode` inside `defineNuxtPlugin`) from `nuxtApp.$config.public.firebase.useEmulators`, so only when `useEmulators && (globalThis as any).__E2E_BARCODE__` is truthy, `override start(...)` invokes `qrCodeSuccessCallback?.(barcode, { decodedText: barcode, result: { text: barcode } })` immediately and returns `Promise.resolve(null)` without opening a camera.
      * Create `e2e/tests/medication/fallback.cy.ts` (intercepting `POST **/getMedicationDetails*` at the browser boundary—no `cip_to_cis` seeding required): visit `/`, open the creation dialog (`.v-fab__container > .v-btn` -> `[data-cy="add-medication-button"]`), set `win.__E2E_BARCODE__ = '010340093595583817281231'`, intercept `POST **/getMedicationDetails*` with `statusCode: 503` `{ error: { status: 'UNAVAILABLE', message: 'External medication service unavailable' } }`, click `[data-cy="scan-barcode-button"]`, assert `[data-cy="queue-toast-error"]`, type `'Custom Fallback Med'` into `[data-cy="medication-name-input"] input`, click `[data-cy="custom-medication-option"]` (which invokes `handleCustomName()` and closes the `<v-combobox>` menu overlay), click `[data-cy="confirm-create-button"]`, assert `'Custom Fallback Med'` is visible in the UI, and verify via `cy.callFirestore('get', 'medications', { where: [['name', '==', 'Custom Fallback Med']] })` that `bareCode === '3400935955838'` persisted.
   * **Checkpoint 3 Verification**: `yarn --cwd e2e typecheck`, `yarn --cwd back build`, `NUXT_PUBLIC_USE_EMULATORS=true FIREBASE_API_KEY=AIzaSyD8L9ygNvkH0FO46dceDGmneRwQ7WuaFBk FIREBASE_AUTH_DOMAIN=my-pills-staging-460b5.firebaseapp.com FIREBASE_PROJECT_ID=my-pills-staging-460b5 FIREBASE_STORAGE_BUCKET=my-pills-staging-460b5.firebasestorage.app FIREBASE_MESSAGING_SENDER_ID=824429090964 FIREBASE_APP_ID=1:824429090964:web:7e0cb8ae45c2424b8afc81 yarn --cwd front generate`, and `yarn --cwd e2e firebase emulators:exec --only auth,firestore,functions,storage,hosting "yarn cy:run:local"`.

#### Checkpoint 4 — CI Workflows

14. **`.github/workflows/firebase-hosting-pull-request.yml`, `.github/workflows/firebase-hosting-merge.yml`, & `.github/workflows/firebase-hosting-staging.yml`** (Modify / Create)
    * **Type / Scope**: CI/CD Pipeline Gates
    * **Proposed Changes**:
      * **Shared CI setup:** Set `CYPRESS_INSTALL_BINARY=0` in static/unit/deploy install jobs; cache `back/node_modules`, `front/node_modules`, and `e2e/node_modules` keyed on `hashFiles('front/yarn.lock', 'back/yarn.lock', 'e2e/yarn.lock')`; run `yarn --cwd front nuxi prepare` unconditionally (both cache hits and cache misses) before `front` `lint`, `typecheck`, `test`, and `generate`.
      * **`firebase-hosting-pull-request.yml`:** In `install` (`lines 33–36`), add `cd ../e2e && yarn install --frozen-lockfile` (under `CYPRESS_INSTALL_BINARY=0`) so `e2e/node_modules` is populated in the cached workspace. Remove `Create SA Key for Integration Tests` (`serviceAccountKey.json`) and `GEMINI_API_KEY` from the `test` job so `back` runs offline `yarn test` with external dependencies mocked; run `back` (`lint`, `typecheck`, `build`, `test`), `front` (`nuxi prepare`, `lint`, `typecheck`, `test`, `generate` with `NUXT_PUBLIC_USE_EMULATORS=true`, `ENVIRONMENT` omitted so analytics stays disabled, and the non-secret `my-pills-staging-460b5` `FIREBASE_*` web config from `e2e/support/e2e.ts`), and `e2e` (`typecheck`). Upload `back/lib` and `front/.output/public` as workflow artifacts to `e2e-test`; in `e2e-test`, remove `environment: staging` (`line 144`) and staging secret env vars (`CYPRESS_BASE_URL`, `CYPRESS_FIREBASE_SERVICE_ACCOUNT`, `SERVICE_ACCOUNT`, `CYPRESS_FIREBASE_APPCHECK_DEBUG_TOKEN`), restore `back/node_modules` and `e2e/node_modules` from cache, cache `~/.cache/Cypress` (running `yarn --cwd e2e cypress install` on cache miss), set `GCLOUD_PROJECT: my-pills-staging-460b5` and `GEMINI_API_KEY: test-gemini-key`, and replace `cypress-io/github-action@v7` with a `run:` step executing `yarn --cwd e2e firebase emulators:exec --only auth,firestore,functions,storage,hosting "yarn cy:run:local"` (Chrome via `e2e/cypress.config.ts`); remove `migrate:prod` and staging `deploy` from PR runs.
      * **`firebase-hosting-merge.yml`:** Remove the dead root `if [ -f package.json ]` check; install `e2e` with `CYPRESS_INSTALL_BINARY=0` (`cd e2e && yarn install --frozen-lockfile`); run `back` (`lint`, `typecheck`, `build`, `test`), `front` (`nuxi prepare`, `lint`, `typecheck`, `test`, `generate` with `NODE_ENV: production`, `ENVIRONMENT: production`, `NUXT_PUBLIC_USE_EMULATORS: false`, `FUNCTIONS_URL`, `FIREBASE_*`, `FIREBASE_VAPID_KEY`, and `VITE_FIREBASE_APP_CHECK_SITE_KEY` secrets), and `e2e` (`typecheck`) without live GCP or Gemini secrets in the verification steps, before running `fireway` `migrate:prod` and deploying to `mypills-prod`.
      * **`firebase-hosting-staging.yml` (Create):** Add a `workflow_dispatch` workflow targeting `environment: staging` (`my-pills-staging-460b5`) running the same verification gates (with `NODE_ENV: production`, `NUXT_PUBLIC_USE_EMULATORS: false`, and `ENVIRONMENT: staging`), `fireway` `migrate:prod`, Firebase deploy, and Cypress staging E2E (`browser: chrome`) on demand.
    * **Checkpoint 4 Verification**: Validate PR CI on push/PR (mocked offline tests, static gates, and ephemeral emulator E2E) and confirm merge/staging workflows run all `back`, `front`, and `e2e` static/unit verification gates before `migrate:prod` and deployment.

### Phase B Roadmap (Post-Phase-A Implementation Addendum)

Phase B is a roadmap only and must not be executed until Phase A merges, passes all CI gates, and a reviewed Phase B implementation addendum locks exact package versions (from `yarn outdated`), exact file boundaries, and tooling choices (such as ESLint v9 vs. v10):
1. **`back` upgrades:** ESLint flat-config migration cluster (removing `eslint-config-google`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, and `eslint-plugin-import`; deleting `.eslintrc.js`, `.eslintignore` [migrating `lib/`, `migrations/`, `jest.config.ts`, `*.config.ts` into flat-config `ignores`], and `tsconfig.dev.json`; dropping/replacing removed `@typescript-eslint/semi` and `member-delimiter-style` rules), TypeScript/Jest/ts-node cluster, Firebase server cluster, date cluster, and minor/patch batch.
2. **`front` upgrades:** Nuxt/UI cluster, Workbox PWA cluster, ESLint/TypeScript cluster, Pinia cluster (`pinia`, `@pinia/nuxt`, `@pinia-plugin-persistedstate/nuxt`), i18n cluster (`vue-i18n`, `@intlify/unplugin-vue-i18n`), VueUse cluster (`@vueuse/core`, `@vueuse/nuxt`), Firebase client cluster (`firebase`, `vuefire`, `nuxt-vuefire`), standalone major upgrades (`html5-qrcode`, `jspdf`, `@date-io/date-fns` + `date-fns`, `sass`), and minor/patch batch (plus `firebase-tools` in `devDependencies`).
3. **`e2e` upgrades:** Standalone `firebase-tools` upgrade before the first Phase B emulator milestone, followed by the `cypress`, `cypress-firebase`, `firebase`, `firebase-admin`, and `typescript` cluster.

### Verification Plan

* **Per-Commit Static & Unit Gates (Phase A & every Phase B commit):**
  * `back`: `yarn --cwd back lint`, `yarn --cwd back typecheck`, `yarn --cwd back build`, `yarn --cwd back test`
  * `front`: `yarn --cwd front typecheck` (runs `nuxi prepare` first), `yarn --cwd front lint`, `yarn --cwd front test`, `yarn --cwd front generate`
  * `e2e`: `yarn --cwd e2e typecheck`
* **Opt-In Live Contract Check (Phase A completion & after `back` runtime or HTTP dependency upgrades in Phase B):**
  * `yarn --cwd back test:live` (executes `giygas-api-adapter.live.spec.ts` against `https://medicaments-api.giygas.dev/medicament/id/60234100` to confirm schema compatibility against the live API response)
* **Milestone & PR E2E Verification (End of Phase A, and in Phase B after each subproject's upgrades: `back`, `front`, `e2e`):**
  * Build `back` (`yarn --cwd back build`), generate `front` with `NUXT_PUBLIC_USE_EMULATORS=true` and the non-secret `my-pills-staging-460b5` `FIREBASE_*` web config (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`), and run `yarn --cwd e2e firebase emulators:exec --only auth,firestore,functions,storage,hosting "yarn cy:run:local"` covering all specs under `e2e/tests/` (`medication/*.cy.ts` including `fallback.cy.ts`, and `prescription/upload.cy.ts`).
* **Merge Verification:**
  * GitHub Actions `firebase-hosting-merge.yml` runs all `lint`, `typecheck`, `test`, and `build`/`generate` checks before `migrate:prod` and production `deploy`.

--------------------------------------------------------------------------------

*Drafted with EGM*
