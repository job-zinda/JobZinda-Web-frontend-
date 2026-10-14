# Job Zinda — Web

Web client for Job Zinda, the freelancer and professional network. It has feature parity with the Flutter app (`jobzindaflutterfinal`) and talks to the same backend (`job-zinda-backend`).

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, TanStack Query and Leaflet.

## Getting started

```bash
npm install
cp .env.example .env.local   # point at prod or a local backend
npm run dev                  # http://localhost:3000
```

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://server2.jobzinda.com/api/v1` | Backend API base. Use `http://localhost:4001/api/v1` for a local backend. |

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.

## Features

| Area | Routes | Notes |
|---|---|---|
| Auth | `/login`, `/login/email`, `/signup` | Username/password, email OTP (new emails continue to signup), referral codes via `?ref=` |
| Feed | `/`, `/post/[id]` | Banners, stories, category chips, For you / Following, likes, comments & replies, share, report |
| Create | `/create` | Image/video/text posts (video thumbnail generated in-browser) and stories |
| Discover | `/search`, `/map` | People search; Leaflet + OSM map of nearby freelancers with distance/gender/rating/project filters |
| Profiles | `/profile`, `/profile/[id]`, `/profile/edit`, `/profile/analytics`, `/profile/connections`, `/profile/[id]/feedback` | Follow, message, call/WhatsApp, block, rate, report, avatar/cover upload |
| Chat | `/chat`, `/chat/[profileId]`, `/chat/support` | Text, image and voice messages; "Lets plan" admin thread. REST + polling (backend has no sockets) |
| Notifications | `/notifications` | Filters, mark read, delete, tap-through routing |
| Money | `/plans`, `/wallet`, `/referrals`, `/course` | Razorpay checkout for plans and the course; wallet withdrawals (UPI) |
| Extras | `/plans-for-you`, `/tasks`, `/jobs/*`, `/help`, `/help/terms` | Admin broadcasts, Zinda-promoter Task Corner, job-seeker/employer form, support & account deletion |

Guests can browse the public feed, search, map and public profiles. Any action (like, follow, chat, post) opens a login prompt (`requireAuth` in `src/lib/auth-context.tsx`).

## Code map

```
src/
  app/(auth)/        login, email OTP, signup (split-screen layout)
  app/(app)/         every in-app page, wrapped in components/app-shell.tsx
  components/ui/     primitives (button, input, dialog, toast, tabs, avatar, …)
  components/feed/   post card, comments, stories, banners
  components/…       profile, chat, map, jobs feature components
  lib/api/client.ts  fetch wrapper: Bearer auth, x-platform header, 401 → refresh → retry
  lib/api/endpoints.ts  typed wrappers for every backend endpoint used
  lib/types.ts       backend response shapes
```

Tokens live in `localStorage` (`jz_token`, `jz_refresh_token`, `jz_user`). The colour tokens are the Stitch Material-3 palette defined in `src/app/globals.css`.

## Known backend gaps

- `/job-seeker/*` is called the same way the Flutter app calls it, but it isn't in `job-zinda-backend`.
- `story/getStoryViewCount` reads its params from a GET body, which browsers can't send, so the web app doesn't show story viewers.
- `follower/listAllFollowers` and `listAllFollowing` only return the logged-in user's own lists.
- `instagramLink`, `linkedinLink` and `experiences` aren't in the user schema, so the web app doesn't edit them.
