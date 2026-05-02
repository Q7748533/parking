# AirportMatrix — Memory

> Append-only project logbook. Decisions, lessons, facts, progress.
> Updated each session by AI. Never delete — only append.

---

## 2026-04-29 — Session summary

Initial audit identified 21 issues. **18 fixed** across 5 optimization passes. Plus additional rounds for homepage UX, SEO compliance, and route fixes:

| Batch | Changes |
|---|---|
| Security | API key → env vars, server-side validation for all admin actions |
| Data integrity | Cascade delete, Prisma schema synced to 33 columns |
| Performance | N+1 eliminated, pagination added, slug fallback removed, ISR fixed |
| Bugs | Typed JSON parsing, dynamic operating hours, nofollow SEO, copyright year, error states |
| Code quality | Dashboard real data, decorative search removed, aria-labels, airport name display |
| Homepage UX | Shared Header/Footer, `<main>` landmarks, dynamic SeoContent, "All 0 Parking" fix |
| Route fix | `/admin` 404 resolved, dashboard moved to correct path |
| I-Lang/Google SEO | 9/9 public pages compliant — H1 precision, H2/H3 hierarchy, semantic HTML, all Schema types |

**3 deferred** (lower impact): unify table implementations (tanstack vs manual), remaining `any` type edge cases, empty operating hours display.

### Files created this session
- `lib/validate.ts` — reusable server-side validation library
- `.ilang/soul.md` — project identity and conventions
- `.ilang/memory.md` — project logbook (this file)
- `.trae/project-rules.md` — ZeroCode v2.0 AI behavior rules
- `.trae/ilang-example.md` — I-Lang protocol reference
- `CLAUDE.md` — AI entry point (reading order)

### Current State (updated 2026-04-29)

- Turso database with `airports` (33 col) and `parking_providers` tables
- All public pages have ISR (`revalidate = 3600`), admin pages dynamic
- Structured data: WebSite, Organization, Breadcrumb, ItemList, Product, FAQPage, AboutPage, ContactPage, CollectionPage + I-Lang ContentLayer on every page
- Search: client-side instant filter + server-side full text search with pagination
- Admin: Dashboard with real DB stats, CRUD with server-side validation + error states
- SEO: 9/9 public pages I-Lang + Google SEO compliant

### Key File Map (updated)

| File | Role |
|---|---|
| `app/page.tsx` | Homepage — ISR, fetches stats+airports, ItemList schema, imports Header/Footer |
| `app/search-page-client.tsx` | Search UI — H1, results table, trust stats bar |
| `app/(user)/layout.tsx` | Shared user layout — Header + `<main>` + Footer |
| `app/(user)/search/actions.ts` | Batch parking queries, pagination |
| `app/(user)/seo-content.tsx` | Dynamic SEO content with real airport data, `<article>` wrapped |
| `app/(user)/info-page-shell.tsx` | Breadcrumb + content area for info pages |
| `app/(admin)/layout.tsx` | Admin shell with sidebar (仪表盘/机场管理/停车场管理) |
| `app/(admin)/admin/page.tsx` | Admin dashboard — real DB stats |
| `app/(admin)/admin/airports/page.tsx` | Airport CRUD (error states, cascade delete confirmation) |
| `app/(admin)/admin/parking/page.tsx` | Parking CRUD (error states) |
| `components/user/header.tsx` | Shared header — logo, nav (Home/Airports/FAQ), mobile menu |
| `components/user/footer.tsx` | Shared footer — logo, legal links, dynamic copyright |
| `lib/validate.ts` | Server-side validation library (15 functions) |
| `lib/db.ts` | Turso client singleton |
| `prisma/schema.prisma` | Full 33-column data model (documentation) |

### Environment

- `.env` — template only (no secrets)
- `.env.local` — Turso creds + Gemini API key (git-ignored)

---

## 2026-04-29 — AI context layer setup

### Decision: Multi-layer AI memory architecture

Created a cross-tool compatible AI context system using three directories that different tools read:

| Directory | Purpose | Read by |
|---|---|---|
| `CLAUDE.md` | Entry point, reading order | Claude, Cursor, Copilot |
| `.ilang/soul.md` | Project identity, tech stack, conventions | All I-Lang compatible tools |
| `.ilang/memory.md` | Project logbook, decisions, issues | All I-Lang compatible tools |
| `.trae/project-rules.md` | ZeroCode v2.0 AI behavior rules | Trae IDE |
| `.trae/ilang-example.md` | I-Lang protocol syntax reference | Trae IDE |

### Key rules from ZeroCode v2.0 (project-rules.md)

- **Tech stack defaults:** fullstack=Next.js(UI)/Go(API), db=SQLite, deploy=CF-Workers
- **[OPTIMIZE:auto]** explicitly calls out `avoid-N+1` and `db=indexes` — directly relevant to identified issues #1 and #5
- **Memory system** references `.zerocode/memory.md` — separate from `.ilang/`; potential consolidation target
- **Quality checks** auto-triggered after each feature: logic errors, edge cases, missing validation, security, hardcoded secrets
- **UI rules:** mobile-first, 44px min tap targets, no horizontal scroll, 16px min body text
- **User level detection:** auto-detected from first 3 messages, adjusts output accordingly

### Decision: `.trae/` integrated into read order

Updated `CLAUDE.md` to instruct AI to read `.trae/project-rules.md` and `.trae/ilang-example.md` after the `.ilang/` files. This ensures ZeroCode behavior rules are loaded for every session.

### Security hardening (2026-04-29)

**API Key:** Removed hardcoded Gemini API key from `ai-parse.ts` (was `sk-AfIq...` on line 5). Now reads from `process.env.GEMINI_API_KEY`. Added early-return guard when key is missing. BASE_URL also moved to env (`GEMINI_API_BASE_URL`).

**Environment files:** Scrubbed real key from `.env` (now a template with placeholders). Key moved to `.env.local` (git-ignored). **Action required: rotate this key** — it was exposed in git history and source files.

**Server-side validation:** Added `lib/validate.ts` with validation functions for all admin inputs. Both `createAirport`/`updateAirport` and `createParkingProvider`/`updateParkingProvider` now validate every field before database operations. Covers: type safety, length limits, number ranges, URL format, JSON structure, coordinate format, phone format, XSS injection prevention.

### Data integrity fixes (2026-04-29)

**Cascade delete:** `deleteAirport()` now deletes associated `parking_providers` before deleting the airport. Previously orphaned parking rows on airport deletion. Delete confirmation dialog updated to warn about cascade.

**Prisma schema synced:** Updated `prisma/schema.prisma` — `ParkingProvider` model grew from 11 to 33 columns matching actual DB. Added: slug, description, address fields (line1/city/stateCode/zipCode), lat/lng, shuttle fields, cancellation/parking/custom message policies, rating/ratingCount/recommendationPercentage, contactPhone, locationType, strikeOffPrice, discountPercentage, operatingHours, amenities. Note: Prisma still uses `provider = "sqlite"` — Turso/libSQL-specific provider not available. Raw SQL remains the primary data access path.

### Performance optimizations (2026-04-29)

**N+1 queries eliminated:** Replaced per-airport parking queries in `getAirportsWithParking()` and `searchAirports()` with a single batch `IN (?)` query. Added `batchGetParkingProviders()` helper — fetches all parking for N airports in 1 query, groups in memory, caps at 5 per airport. For 10 airports: 11 queries → 2 queries.

**Slug runtime fallback removed:** Removed all `generateSlug(String(row.name))` fallbacks from read paths (`search/actions.ts`, `airport/[code]/page.tsx`, `parking/actions.ts`). Slugs are now always read from the database column directly.

**Pagination added:** `getAirports()` (admin) and `getParkingProviders()` (admin) now accept `page`/`pageSize` params (default 50), return `total` count. Both use parallel queries (data + count via Promise.all). `searchAirports()` (public) also accepts page/pageSize (default 20).

**Homepage ISR fixed:** Removed conflicting `dynamic = 'force-static'` from `app/page.tsx`. Now properly uses ISR with `revalidate = 3600` — page regenerates every hour instead of being stuck at build-time.

**Bonus — Parking admin shows airport name:** `rowToParking()` now maps `airport_code` and `airport_name` from the JOIN query. Admin table can display "JFK" instead of raw UUID.

### Bug fixes (2026-04-29)

**Typed JSON parsing:** Added `Amenity` and `OperatingDay` interfaces in `parking-detail-client.tsx`. Replaced `any[]` with typed `parseAmenities()` and `parseOperatingHours()` helpers. Errors logged to console instead of being silently swallowed.

**Operating hours sidebar:** Booking card sidebar now shows `is24x7 ? "Open 24/7" : "See hours below"` instead of always displaying "Open 24/7" regardless of actual data.

**Affiliate link SEO:** Added `nofollow sponsored` to `rel` attribute on booking affiliate links — Google SEO compliance for paid links.

**Footer copyright year:** Fixed hardcoded `© 2026` in `airport-parking-client.tsx` → now uses `new Date().getFullYear()`.

**Admin error states:** Both `AirportsPage` and `ParkingPage` now show error UI with retry button when data loading fails, instead of silently showing an empty table. Added `AlertCircle`/`RefreshCw` icons for retry.

**Note:** Template literal bug (`$(airport.code)` → `${airport.code}`) reported by audit was not present in actual code — already correct.

### Code quality (2026-04-29)

**Admin dashboard → real data:** Rewrote `(admin)/page.tsx` as a server component. Now queries actual DB stats (total airports, total providers, average price). Quick actions link to real admin pages. Removed fake users/articles/visits/activities/export button.

**Admin search → removed:** Replaced decorative search input in admin header with simple "AirportMatrix 管理后台" label. Removed unused `Search` and `Input` imports.

**Accessibility — aria-labels:** Added `aria-label` to all icon-only buttons: admin sidebar open/close (中文标签), parking data table edit/delete (includes provider name). Airport data table already had `sr-only` labels via dropdown trigger.

**Note on globals.css:** Dark theme CSS variables (--background, --card, --foreground, etc.) are actively used by admin panel components. User-facing pages override with inline Tailwind colors. Not dead code — kept as-is.

### Homepage UX overhaul (2026-04-29)

**Shared Header/Footer extracted:** Created `components/user/header.tsx` (client, with mobile menu state) and `components/user/footer.tsx` (server, with nav links). Eliminated ~120 lines of duplicated HTML across search-page-client, airport-parking-client, and parking-detail-client.

**User layout wired up:** `(user)/layout.tsx` now renders `<Header />` + `<main>{children}</main>` + `<Footer />`. All `(user)/` pages automatically get consistent chrome. Homepage at `/` imports Header/Footer directly since it's outside the route group.

**`<main>` landmarks:** Added `<main role="main">` to both root layout and user layout for HTML5 semantics and accessibility.

**"All 0 Parking" fixed:** The link now conditionally renders only when `parkingProviders.length > 0`. No more dead links to empty airport pages.

**SEO content dynamic:** `SeoContent` now accepts `topAirports` prop from DB. Renders real airport codes as clickable pills, dynamically inserts airport names into SEO copy instead of hardcoding JFK/LAX/Chicago.

**Cleaner search-page-client:** Reduced from 389 lines to ~290. Removed mobile menu state, header markup, footer markup. Kept search + results + trust stats.

### Decision: Merged memory systems — `.ilang/memory.md` as single source of truth

ZeroCode rules originally pointed to `.zerocode/memory.md` as its persistence path. Changed all references in `.trae/project-rules.md` to `.ilang/memory.md`:
- `[MEM:persistent|path=.ilang/memory.md]`
- `[STEP4:learn] => [WRITE:.ilang/memory.md]`

One canonical memory file, one format. No more split-brain between I-Lang and ZeroCode memory paths.

### AI parse improvements (2026-04-29)

**Typed interfaces:** Replaced all `any` types in `ai-parse.ts` with 6 typed interfaces: `RawParkingJson`, `RawParkingType`, `RawAmenity`, `RawOperatingDay`, `RawAddress`. Changed `||` fallbacks to `??` for correct boolean/falsy handling.

**AI feedback:** Added `aiGenerated?: boolean` to `ParsedParkingData`. UI now shows green success ("AI content generated") or amber warning ("AI did not generate content — using extracted data only") based on the flag. Previously AI failures were silent.

**Edit mode:** Removed `{!provider && ...}` guard — AI JSON parse section now available for both creating and editing parking providers.

**Fetch timeout:** Added `AbortController` with 25-second timeout. Timeout returns "AI request timed out — using basic extraction" instead of hanging indefinitely.

**Parking type fix:** Added 5 compound types (outdoor valet, outdoor self, indoor valet, covered self, covered valet) to `VALID_PARKING_TYPES` and dialog dropdown. Raw JSON `parkingMainType` values like "Outdoor Valet" now pass validation instead of being rejected.

### Final polish (2026-04-29)

**Error states:** Added `error` prop + red banner with retry button to `search-page-client.tsx` and `airport-parking-client.tsx`. Homepage and airport detail page now pass error strings when data fails.

**Semantic tables:** Converted div grids with ARIA roles to real `<table>/<thead>/<tbody>/<tr>/<th>/<td>` in both `search-page-client.tsx` and `airport-parking-client.tsx`.

**UUID fallback removed:** Admin parking table Airport column now shows "—" when airportCode is missing instead of raw UUID.

**Dead code:** Removed `lib/prisma.ts` (unused Prisma client), `lib/db-queries.ts` + `app/api/db-test/` (dev test artifacts). No imports referencing them.

### Cross-reference recommendation (2026-04-30)

**"More Parking at {airportCode}" section:** Added to bottom of parking detail page. Shows up to 4 other parking providers at the same airport, sorted by cheapest first. Each card shows name, distance, type, and price. "View all {airportCode} parking →" link to airport page. Extends user session (lower bounce rate) and builds internal link structure.

**New server action:** `getOtherParkingAtAirport(airportId, excludeId, limit)` in `parking-actions.ts` — fetches lightweight data (id/name/slug/type/price/distance) excluding current provider.

**Model/endpoint:** Kept as-is per user decision (`gemini-3.1-pro-preview` via `api.vectorengine.ai`).

### AI extraction enhancements (2026-04-29)

**Airport auto-matching:** Added `resolveAirportId()` — queries DB by `airportCode` from raw JSON. If matched, auto-sets `airportId` in form. UI shows green "Auto-matched from airportCode in JSON data" hint.

**Review detail extraction:** Added `review_summary` TEXT column (JSON). Extracts `reviewAttribute` from raw JSON (locationRating, staffRating, facilityRating, safetyRating, reviewCount). Stored as JSON string.

**Social proof fields:** Added 3 new DB columns + extraction:
- `been_here_count` INTEGER — "1,101 people parked here"
- `shuttle_recc_percentage` REAL — shuttle recommendation %
- `free_cancel_available` INTEGER — free cancellation flag

**Parking type preference:** Now uses `parkingMainType` (e.g. "Outdoor Valet") over `parkingType` when available.

**DB migration required:** Run `npx tsx scripts/migrate-add-review-fields.ts` to add new columns.

**Files changed:** `ai-parse.ts` (+imports, +types, +resolveAirportId), `parking/actions.ts` (+4 fields to type/INSERT/UPDATE/rowToParking), `parking-dialog.tsx` (+default values, +edit mapping, +auto-match hint), `scripts/migrate-add-review-fields.ts` (new).

### Parking detail page enhancements (2026-04-29)

**Rating breakdown:** Added `RatingBar` component showing staff/facility/location/safety ratings as horizontal bars. Parsed from `review_summary` JSON. Appears below overall rating.

**Social proof:** `beenHereCount` shown as "X travelers have parked here" under ratings.

**Shuttle recommendation:** `shuttleReccPercentage` shown in shuttle section: "X% of travelers recommend the shuttle".

**Free cancellation badge:** Green checkmark "Free cancellation" in booking card sidebar when `freeCancelAvailable` is true.

**Type sync:** `parking-actions.ts` `ParkingDetail` type and `getParkingDetail()` now include `reviewSummary`, `beenHereCount`, `shuttleReccPercentage`, `freeCancelAvailable`.

### AI Review Summary (2026-04-29)

**Feature:** Admin can paste raw traveler review texts in parking-dialog → AI summarizes into 2-4 sentence natural overview → stored as `review_ai_summary` → displayed on public detail page as "What Travelers Say" card.

**DB:** Added `review_ai_summary` TEXT column via migration script.

**AI:** `summarizeReviews()` in `ai-parse.ts` — sends reviews (max 8000 chars) to Gemini with structured 6-sentence prompt (overall→praised→secondary→cautions→ideal traveler→takeaway), 25s timeout, 800 token max, 400 char minimum enforced.

**UI (admin):** Purple card in parking-dialog with paste textarea + "Summarize with AI" button + live preview of generated summary. Works for both create and edit.

**UI (public):** "What Travelers Say" card with MessageSquare icon, purple-tinted summary text, "Based on X traveler reviews" attribution. Appears between Key Features and Operating Hours.

**SEO:** Added `review` to Product schema (Review type with reviewBody + author + reviewRating). Google can use for rich result review snippets.

### Parking detail page — card merge (2026-04-29)

Merged 7 scattered cards into 3 content-dense sections for better Google 2026 structure clarity:

| Section | Content |
|---|---|
| **Title & Overview** | Name, address, VERIFIED, rating stars + count + recommendation% + beenHereCount + custom message highlight |
| **Traveler Insights** | AI description + What Travelers Say (AI review summary) + Rating Breakdown bars — all in one card |
| **Amenities & Services** | Key Features tags + Operating Hours + Shuttle info/recommendation% + Cancellation Policy + Parking Access — one card with `<hr>` dividers |

Each section is a single `bg-white rounded-lg` card. Content flows naturally with border separators between subsections. Sidebar unchanged.

### InfoPageShell header/footer dedup (2026-04-29)

Fixed duplicate header/footer on all info pages (privacy, terms, about, contact, faq, airports). `InfoPageShell` had its own full header+nav+footer, but `(user)/layout.tsx` already provides Header+Footer via the shared components. Striped InfoPageShell from 73 lines to 21 — now only provides breadcrumb + content area.

### Route fix — /admin 404 (2026-04-29)

`(admin)/page.tsx` mapped to `/` (conflicting with homepage). Moved dashboard to `(admin)/admin/page.tsx` → `/admin` route. Added "仪表盘" sidebar entry with LayoutDashboard icon. Deleted old conflicting file.

### I-Lang SEO & Google SEO compliance (2026-04-29)

**Homepage fixes:**
- Title: `AirportMatrix — Airport Parking Price Comparison | Find & Book Deals` (removed keyword-stuffed city codes)
- H1: `Find & Book Airport Parking Deals — Price Comparison` (entity-first declaration)
- Airport names: `<h2>` → `<h3>` (I-Lang metadata H2 list now matches DOM exactly)
- "Real-Time Matrix" → dynamic "Popular Airports" / "Search Results" label
- Trust stats: `<div>` → `<dl>/<dt>/<dd>` semantic definition list, "60% Average Savings" → "Up to 60% Savings vs Drive-Up"
- SEO content: 4 `<div>` → 4 `<article>` with `<h2>` each
- Added ItemList Product+Offer schema for displayed parking providers
- I-Lang metadata: synced H1/H2/H3 with DOM, added h3 layer declaration

**All pages audit results (9/9 compliant):**
- `/airports`: Fixed I-Lang literal `${count}` bug (was string, now computed), added CollectionPage+Organization schema, converted `<div>` grid to semantic `<table>` + mobile card view
- `/about`: Added AboutPage schema with nested Organization (E-E-A-T)
- `/contact`: Added ContactPage schema with dual ContactPoint (customer service + sales)
- `/airport/[code]`: Added `role=table/rowgroup/row/cell` ARIA to parking grid
- `/airport/[code]/[slug]`: Already compliant (H1→H2→H3, Product+AggregateRating, breadcrumb)
- `/faq`: Already compliant (FAQPage schema with 10 Q&A — Google rich result eligible)
- `/privacy`, `/terms`: Already compliant (breadcrumb, section hierarchy)

### AI parse improvements (2026-04-29)

**Typed interfaces:** Replaced all `any` types in `ai-parse.ts` with 6 typed interfaces: `RawParkingJson`, `RawParkingType`, `RawAmenity`, `RawOperatingDay`, `RawAddress`. Changed `||` fallbacks to `??` for correct boolean/falsy handling.

**AI feedback:** Added `aiGenerated?: boolean` to `ParsedParkingData`. UI now shows green success or amber fallback warning. Previously AI failures were silent.

**Edit mode:** AI JSON parse section now available for both creating and editing parking providers.

**Fetch timeout:** Added `AbortController` with 25s timeout.

**Parking type fix:** Added 5 compound types to `VALID_PARKING_TYPES` and dialog dropdown.

**Model/endpoint:** Kept as-is (`gemini-3.1-pro-preview` via `api.vectorengine.ai`).

### AI extraction enhancements (2026-04-29)

**Airport auto-matching:** `resolveAirportId()` queries DB by `airportCode` from raw JSON. Green hint in UI.

**Review detail extraction:** `review_summary` TEXT column (JSON) — locationRating, staffRating, facilityRating, safetyRating.

**Social proof fields:** `been_here_count`, `shuttle_recc_percentage`, `free_cancel_available`.

**DB migration:** `scripts/migrate-add-review-fields.ts`.

### Parking detail page — content merge + cross-reference (2026-04-29/30)

Merged 7 scattered cards into 3 sections: Title & Overview | Traveler Insights | Amenities & Services.

**AI Review Summary:** `summarizeReviews()` — 6-sentence structured prompt, 800 tokens max, 400 char minimum. Admin purple card with paste + Summarize button. Public "What Travelers Say" card with MessageSquare icon.

**Cross-reference:** "More Parking at {airportCode}" section at bottom of detail page. Shows 4 cheapest other providers at same airport. `getOtherParkingAtAirport()` in parking-actions.ts.

**Section 2 always visible:** Now renders with placeholder text even when data is empty, rather than hiding entirely.

### Final polish (2026-04-29)

**Error states:** Added red banner + retry to `search-page-client` and `airport-parking-client`.

**Semantic tables:** Converted div grids to real `<table>/<thead>/<tr>/<th>/<td>` in both search and airport parking pages.

**UUID fallback removed:** Admin parking table Airport column shows "—" when airportCode missing.

**Dead code removed:** `lib/prisma.ts`, `lib/db-queries.ts`, `app/api/db-test/`.

### UX polish (2026-04-30)

**OG images:** Added `images` to root `layout.tsx` OpenGraph (`/og-image.png`, 1200x630) and Twitter card metadata. Placeholder image — replace `public/og-image.png` with actual branding.

**Loading skeletons:** Created 3 `loading.tsx` files:
- `app/(user)/airport/[code]/loading.tsx` — table skeleton with 5 rows
- `app/(user)/airport/[code]/[parkingId]/loading.tsx` — detail page skeleton with sidebar
- `app/(admin)/loading.tsx` — admin card skeleton

**Search debounce:** Added 200ms debounce via `useRef`/`setTimeout` to client-side search filtering in `search-page-client.tsx`. No more filtering on every keystroke.

**Info page breadcrumbs:** `InfoPageShell` now accepts `title` prop. All 6 info pages pass their title (About Us, Contact Us, FAQ, Privacy Policy, Terms of Service, All US Airports). Visual breadcrumb now shows "Home / Page Name".

### SEO basics (2026-04-30)

**robots.txt:** Created `public/robots.txt` — allow all bots, sitemap pointer to `https://airportmatrix.com/sitemap.xml`.

**Custom 404:** Created `app/not-found.tsx` — branded page with search icon, "Page Not Found" heading, links to Home and Browse Airports. `robots: { index: false }` so 404 pages don't get indexed.

### PSEO — airport page content layer (2026-04-30)

**Airport SEO intro:** Created `airport-seo-content.tsx` — server-rendered section showing dynamic airport parking stats: provider count, price range (min–max), available types as pills, shuttle/covered availability. Custom paragraph with data-driven text.

**Airport-specific FAQ:** 3 dynamic Q&As per airport — "How much is parking?", "What types are available?", "Does it have shuttle?" — all answered with actual DB data. Server-rendered for SEO indexing.

**By the Numbers:** Added stats block with avg price, cheapest option, closest distance, shuttle %, covered count, free cancellation %, avg rating — all from DB via 9 parallel queries + in-memory fallback. Updates dynamically per airport.

**Stats fetch:** Replaced in-memory computation with 9 parallel DB queries (COUNT, AVG, MIN distance, etc.) for accurate aggregate stats. Includes fallback to in-memory if DB fails.

### Review summary prompt stability fix (2026-04-29)

Increased `max_tokens` 500→800, added 6-sentence structure template, 400 char minimum enforcement, 1200 char target.

### Parking type normalization + airport auto-match fix (2026-04-30)

Way.com uses inconsistent type names: "Covered Self Park", "Outdoor Self Park". Added `normalizeType()` that strips trailing `" Park"` suffix. Added 4 missing types to validation/dropdown. Fixed `airportId` not reaching `generateContentWithAI` fallback — was using `basicData` instead of `mergedBasic`.

### Airport page layout polish (2026-04-30)

**Header server-rendered:** Moved H1 + "Back to All Airports" from client component to server page.tsx for SEO.

**Stats bar redesign:** Replaced `<dl>` grid with compact icon ribbon — 💰 avg price, 🏷️ cheapest, 📍 closest, 🚌 shuttle, ⭐ rating, ✅ free cancel. Pipe separators on desktop, wraps on mobile.

**FAQ at bottom:** Split `AirportFaq` into separate component, rendered after parking table. Intro paragraph now full-width above stats.

**Type tags fix:** Added `.trim().filter(Boolean)` to prevent glued tags like "shuttlecovered self".

**I-Lang H2 sync:** Added H2 list to airport page I-Lang metadata — 4 headings matching DOM (About, Stats, Table, FAQ). Meta description now dynamic with airport name + city + state.

### Full site I-Lang/Google SEO audit (2026-04-30)

**Airport detail page (`/airport/[code]`):** ✅ compliant. H1 correct, 4 I-Lang H2s synced, semantic `<table>`, Breadcrumb+ItemList+I-Lang, dynamic meta/canonical. Stats bar redesigned to icon ribbon. FAQ at page bottom.

**Parking detail page (`/airport/[code]/[slug]`):** Fixed 5 issues — I-Lang H2 list added (Traveler Insights, Amenities & Services, More Parking), "Book Parking" `<h2>`→`<div>`, dynamic meta with price/type/distance, OG never empty, canonical prefers slug over UUID.

**Airports directory (`/airports`):** Fixed 5 issues — I-Lang H2 list added, intro paragraph, `<article>` wrapper, `@id` on Airport schema, meta description dynamic with real count.

**Homepage (`/`):** Fixed 3 issues — `generateMetadata()` with real airport count, I-Lang `coverage` field dynamic, SeoContent `totalAirports` prop.

**metadataBase:** Added `metadataBase: new URL("https://airportmatrix.com")` to root layout, eliminating localhost OG image warnings.

**All 9 public pages now 100% I-Lang + Google SEO compliant.**

### Homepage cache invalidation (2026-04-30)

Parking CRUD now calls `revalidatePath("/")` alongside admin paths. Adding/editing/deleting a parking provider instantly refreshes the homepage (not just the admin table).

### AI review summary improvements (2026-04-30)

**Prompt overhaul:** Replaced rigid 6-sentence template with 3 flexible topics + explicit anti-template rules. Banned formulaic phrases ("standout feature", "ideal choice", "top-tier option", generic closings). Temperature raised 0.5→0.7.

**Anti-fabrication rules:** Added verification step — before each sentence, AI must confirm a specific review supports it. No shuttle in reviews → no shuttle in summary. No valet mentioned → no valet described. Short/vague reviews → short honest summary.

**Placeholder text:** Empty "What Travelers Say" now shows natural text ("Check back soon for a summary...") instead of admin-facing message.

**Anti-fabrication — provider name:** Added rule preventing AI from embellishing provider names with parentheticals, alternate names, or "operating as" notes unless those appear in the actual reviews.

**Anti-template — openings & transitions:** Banned "goes a long way", "solid match", repeated "If you're..." openings. Added rule to vary sentence starters across summaries.

### Homepage display fix (2026-04-30)

**perAirport increased:** 5→10 parking providers displayed per airport on homepage.

**Real total counts:** Added `totalParkingCount` to `AirportWithParking` type. "All XX Parking" link now shows real DB count (not truncated display count). Count fetched via GROUP BY query alongside parking data.

### PSEO — state aggregation + nearby airports (2026-04-30)

**State pages:** Created `/airport-parking/[state]` dynamic route. Covers all 50 states via SLUG_TO_STATE map. Each page shows all airports in that state as clickable cards with parking count. Breadcrumb + meta description dynamic. Added to sitemap.

**Nearby airports:** Created `NearbyAirports` server component on airport detail page. Queries other airports in same state (up to 4) + "All {state} airports →" link to state page. Boosts internal linking and dwell time.

**State pages I-Lang/SEO:** Added I-Lang ContentLayer (H1+H2), ItemList schema with Airport+PostalAddress items, dynamic meta per state. Now fully compliant.

**Sitemap revalidation:** Added `revalidate = 1800` to sitemap.ts — regenerates from DB every 30 min instead of serving stale cache indefinitely.

### Admin pagination + Schema fixes (2026-04-30)

**Admin pagination:** Both airports and parking admin pages now paginate — 20 items/page, prev/next buttons, "Showing X–Y of Z" count.

**Product schema complete:** Added `image`, `review`, `description`, `shippingDetails` (doesNotShip), `hasMerchantReturnPolicy` to all 3 Product schema locations. Created `public/og-image.svg` brand image (1200×1200).

**Shared Organization schema:** Created `components/schemas/organization-schema.tsx` — reusable WebSite+Organization component with dynamic airport count. Imported on all 10 public pages. Every page now has site-wide entity signals.

**I-Lang alignment:** Fixed H2 arrays to match actual DOM across all pages. Removed placeholder H3 from homepage. Changed `narrative_voice` to `airport_detail` on airport page. Added `CollectionPage` schema to state aggregation pages.
