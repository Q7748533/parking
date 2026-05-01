# AirportMatrix — Soul

> Auto-maintained project profile. Updated each session by AI.
> I-Lang protocol v2.0 — portable across Claude, ChatGPT, Cursor, Copilot, etc.

---

## Project Identity

- **Name:** AirportMatrix
- **Purpose:** Airport parking price comparison and booking platform for US airports
- **Audience:** US travelers looking for affordable airport parking
- **Brand:** "AIRPORT MATRIX" — indigo (#6366f1) primary color, professional but approachable
- **Domain:** airportmatrix.com

## Tech Stack

- **Framework:** Next.js 16.2.4 (App Router, ISR with `revalidate = 3600`)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 + tailwind-merge + class-variance-authority
- **UI Components:** Custom shadcn-style (`components/ui/`) built on Radix primitives
- **Icons:** lucide-react
- **Tables:** @tanstack/react-table (admin), native `<table>` (public)
- **Database:** Turso (libSQL) via `@libsql/client` (direct SQL, no ORM)
- **AI:** Gemini via vectorengine.ai proxy — content generation, review summarization
- **Runtime:** Node.js, deployed on Vercel

## Code Conventions

- **Server Actions:** All data mutations use `"use server"` functions in `actions.ts` files, colocated with pages
- **Database access:** Direct Turso SQL via `lib/db.ts`. No ORM (Prisma removed as dead code).
- **Validation:** Server-side input validation via `lib/validate.ts` — 15 typed functions for airports + parking
- **Type patterns:** Server actions export types alongside functions (e.g., `Airport`, `ParkingProvider`, `AirportFormData`)
- **Result pattern:** All server functions return `{ success: boolean; data?: T; error?: string }`
- **Slugs:** Generated via `lib/slug.ts` → stored in DB column, no runtime fallback
- **Parking types:** Normalized via `normalizeType()` — strips Way.com "Park" suffix, 14 valid types
- **Shared components:** `components/user/header.tsx` (client, mobile menu), `components/user/footer.tsx` (server)
- **Admin UI:** Chinese labels, violet/purple color scheme, sidebar + header layout
- **User UI:** English, indigo (#6366f1) accents, clean white cards on gray (#f5f7fa) background
- **Layouts:** `(user)/layout.tsx` wraps all public sub-pages with shared Header+Footer. Homepage imports Header/Footer directly.

## SEO Philosophy

- **PSEO approach:** Every page template generates unique, data-driven content from DB — no hardcoded copy
- **I-Lang compliance:** All 9 public pages declare H1+H2+H3 in I-Lang metadata matching DOM exactly
- **Structured data:** WebSite, Organization, BreadcrumbList, ItemList, Product+AggregateRating+Review, CollectionPage, AboutPage, ContactPage, FAQPage — plus I-Lang ContentLayer on every page
- **Semantic HTML:** `<main>`, `<article>`, `<table>/<thead>/<tr>/<th>/<td>`, `<dl>/<dt>/<dd>` on all pages
- **Dynamic meta:** Every page's title and description are built from real DB data (prices, counts, types)
- **ISR:** All public pages `revalidate = 3600`, admin pages dynamic
- **E-E-A-T signals:** Stats bar on homepage, rating breakdown on detail pages, "What Travelers Say" AI summary, Organization+AboutPage+ContactPage schema
- **Cross-reference:** "More Parking at {airportCode}" section on parking detail pages
- **SEO infrastructure:** robots.txt, sitemap.xml (dynamic), custom 404, `metadataBase` configured, OG images

## Architectural Decisions

- **Route groups** separate user-facing `(user)` and admin `(admin)` layouts with no layout inheritance
- **Colocated server actions** — each feature area has its own `actions.ts`
- **Client components** handle search/filter state; admin CRUD uses client state with server action calls
- **No auth** for admin routes currently
- **AI parse pipeline:** Raw JSON → `extractBasicData()` → `resolveAirportId()` → `generateContentWithAI()` → merged form data. Separate `summarizeReviews()` for review text.
- **Batch queries:** `batchGetParkingProviders()` fetches all parking in 1 query for search/listing
- **Parallel stats:** Airport detail page runs 9 parallel DB queries for stats, with in-memory fallback
- **Loading UX:** `loading.tsx` skeleton files at key route segments
- **Error states:** Red banner + retry on `search-page-client` and `airport-parking-client`
