# CLAUDE.md — Speed-to-Lead AI Automation

This is a living document. **Always read this file first** before starting any task.
When a new skill, service, tool, or workflow is introduced, **update this document immediately**.

---

## What This Project Does

**Speed-to-Lead**: AI-powered instant response system that captures leads and reaches out via SMS, phone call, and email — automatically — then books appointments and updates the CRM.

**Pipeline flow:**
```
Lead submits form → SMS with booking link → AI voice call → Follow-up email with booking link → CRM updated in Google Sheets → Lead books appointment on Google Calendar
```

**Live URL:** https://leads.rushanet.com
**GitHub:** https://github.com/sabushid/speed-to-lead
**Hosting:** Vercel (project: `speed-to-lead`)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Hosting:** Vercel (frontend + API routes), Railway (background workers, long-running services)
- **Domain:** leads.rushanet.com (CNAME via Hostinger → Vercel)

---

## Services & Integrations

### Twilio — SMS + Phone Calls + WhatsApp
- **What it does:** Sends instant SMS with booking link, initiates AI voice calls using TwiML text-to-speech, sends WhatsApp messages
- **When to use:** Any outbound SMS, phone call, or WhatsApp message to a lead
- **Phone number:** +14385330083
- **WhatsApp:** Use Twilio's WhatsApp Business API (same Twilio credentials)
- **Note:** Currently on free trial — SMS only delivers to verified numbers. Upgrade for production.
- **Key files:** `src/lib/services/twilio.ts`, `src/lib/pipeline/steps.ts`

### Google Sheets — CRM
- **What it does:** Stores all leads, statuses, pipeline events. Acts as the database.
- **Sheet name:** SpeedToLead CRM (tab: "Leads")
- **When to use:** Any lead read/write operation
- **Key file:** `src/lib/services/google-sheets.ts`

### Google Calendar — Appointment Booking
- **What it does:** Checks availability (freebusy), creates calendar events with lead info
- **Calendar:** primary
- **When to use:** When booking or checking appointment slots
- **Key file:** `src/lib/services/google-calendar.ts`

### Gmail API — Email
- **What it does:** Sends follow-up emails from the user's Gmail account
- **When to use:** Any outbound email to a lead
- **Key file:** `src/lib/services/gmail.ts`

### Google OAuth2 — Shared Auth
- **What it does:** Single OAuth2 client shared by Gmail, Calendar, and Sheets
- **Auth flow:** Visit `/api/auth/google` to get a refresh token
- **Key file:** `src/lib/services/google-auth.ts`
- **Important:** If you get `invalid_grant`, the refresh token expired — re-run the OAuth flow

### LiveKit — Voice AI (configured, not active)
- **What it does:** Real-time voice AI agent rooms
- **Current status:** Configured but not used in pipeline — voice calls use Twilio TwiML instead
- **When to activate:** When a LiveKit agent server is deployed and ready
- **Key file:** `src/lib/services/livekit.ts`

### Claude API (Anthropic) — AI Response Generation
- **What it does:** Generates contextual AI responses for emails and SMS
- **Model:** claude-sonnet-4-6
- **When to use:** Generating personalized outreach content
- **Key file:** `src/lib/ai/response-generator.ts`

### Railway — Background Services & Long-Running Processes
- **What it does:** Hosts services that need persistent processes (workers, queues, bots, agent servers)
- **When to use:** Anything that exceeds Vercel's 60s function limit, background workers, persistent servers (e.g. LiveKit agent, WhatsApp bot, queue processors)
- **Key difference from Vercel:** Railway runs always-on processes; Vercel is serverless with time limits
- **Status:** Available — will be used when long-running services are needed

### Twilio WhatsApp API
- **What it does:** Sends WhatsApp messages to leads via Twilio's WhatsApp Business API
- **When to use:** When reaching out to leads on WhatsApp (in addition to or instead of SMS)
- **How it works:** Same Twilio client, use `whatsapp:+1XXXXXXXXXX` format for from/to numbers
- **Setup required:** Enable WhatsApp Sender in Twilio console, register a WhatsApp-enabled number or use the sandbox for testing
- **Key file:** `src/lib/services/twilio.ts` (will add `sendWhatsApp()` function)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with lead capture form
│   ├── book/page.tsx               # Booking page (clean URL, no lead ID)
│   ├── thank-you/page.tsx          # Post-submission confirmation
│   ├── dashboard/                  # Lead dashboard + detail views
│   └── api/
│       ├── leads/                  # POST: create lead + trigger pipeline, GET: list
│       ├── pipeline/               # POST: manually re-trigger pipeline
│       ├── webhooks/twilio/        # Twilio inbound SMS + call status
│       ├── webhooks/livekit/       # LiveKit room events
│       ├── calendar/availability/  # GET: available time slots
│       ├── calendar/book/          # POST: book appointment
│       └── auth/google/            # OAuth2 flow for refresh token
├── lib/
│   ├── pipeline/
│   │   ├── orchestrator.ts         # Runs all steps in sequence
│   │   ├── steps.ts                # SMS, call, email, CRM update logic
│   │   └── retry.ts                # Exponential backoff
│   ├── services/                   # Twilio, Gmail, Calendar, Sheets, LiveKit, Google Auth
│   ├── ai/                         # Prompts and response generation
│   ├── types/                      # Lead, Pipeline, Services types
│   ├── validators/                 # Zod schemas
│   ├── config/env.ts               # Environment variable access
│   └── utils/                      # Logger, phone formatting, date helpers
├── components/                     # LeadForm, LeadTable, StatsCards, PipelineStatus
└── hooks/                          # SWR hooks for leads data
```

---

## Pipeline Steps (in order)

| Step | Service | What happens |
|------|---------|-------------|
| 1. SMS | Twilio | Sends short SMS with booking link: `https://leads.rushanet.com/book` |
| 1b. WhatsApp | Twilio WhatsApp | Sends WhatsApp message with booking link (when enabled) |
| 2. Voice Call | Twilio (TwiML) | Calls lead with AI-generated greeting via text-to-speech |
| 3. Email | Gmail API | Sends HTML email with "Book Your Appointment" button |
| 4. CRM Update | Google Sheets | Marks pipeline as complete, records all events |

Pipeline runs via `next/server after()` to keep the Vercel serverless function alive after the API response is sent.

---

## Deployment

### Vercel (Frontend + API)
- **Deploy command:** `npx vercel --prod`
- **Auto-deploy:** Connected to GitHub — pushes to `master` trigger Vercel builds
- **Env vars:** All stored in Vercel (use `npx vercel env ls` to check)
- **Max function duration:** 60s (set via `export const maxDuration = 60` in route)
- **Best for:** Landing page, API routes, dashboard, short-lived serverless functions

### Railway (Background Services)
- **Best for:** Long-running workers, persistent processes, agent servers, queue consumers
- **When to use over Vercel:** Anything that runs longer than 60s, needs persistent connections, or runs continuously
- **Deploy:** Connect GitHub repo or use `railway up`

### Adding/Updating Env Vars on Vercel
```bash
# Remove old value
npx vercel env rm VAR_NAME production --yes
# Add new value (use printf to avoid trailing newline)
printf '%s' 'value' | npx vercel env add VAR_NAME production --yes
# Redeploy
npx vercel --prod
```

---

## Known Limitations & Gotchas

1. **Twilio free trial:** SMS only sends to verified numbers. Upgrade ($20) for production.
2. **Google refresh token:** Expires if unused for 6 months or if you re-consent. Re-run `/api/auth/google` to get a new one.
3. **Vercel serverless:** No long-running processes. Pipeline runs in `after()` callback with 60s max.
4. **Google Sheets as DB:** Works for hundreds of leads. If scaling to thousands, migrate to a real database.
5. **Voice calls:** Currently use simple TwiML text-to-speech, not interactive AI. Upgrade to LiveKit agent for two-way AI conversation.

---

## When Adding New Services

When I give you a new skill, API, or service to integrate:

1. **Read this file first** to understand the current architecture
2. **Add the service** to the appropriate section above
3. **Document:** what it does, when to use it, key files
4. **Update the pipeline** if it changes the lead flow
5. **Add env vars** to both `.env.local` and Vercel
6. **Test locally** then deploy with `npx vercel --prod`

---

## Website Design System (from Rushanet)

All UI in this project must follow the Rushanet design system. Reference: `C:\Users\User\Documents\RushanetAllwebpages&video\`

### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| Dark Purple | `#5400b1` | Primary brand, buttons, nav background, CTAs |
| Medium Purple | `#804dd3` | Gradients, hover states, secondary accents |
| Light Purple | `#c3aaea` | Highlights, badges, accents, borders |
| Pale Background | `#e5ebf8` | Light section backgrounds |
| Off-White | `#f7f5fc` | Card backgrounds, subtle bg |
| Text Primary | `#1c1228` | Body text |
| Text Muted | `#5e5470` | Descriptions, secondary text |

### Typography
- **Headings:** `Montserrat` (Google Fonts) — weights 300–900
- **Body:** `Roboto` (Google Fonts) — weights 300–700
- **Scale:** Use `clamp()` for responsive sizing
  - h1: `clamp(30px, 5vw, 50px)`, weight 800–900
  - h2: `clamp(28px, 4vw, 36px)`, weight 800
  - h3: `1.15rem–1.3rem`, weight 600–700
  - Body: `0.9rem–1.08rem`, line-height 1.7

### Component Patterns

**Buttons:**
- Primary: `gradient 135deg #5400b1 → #804dd3`, pill shape (`border-radius: 9999px`), white text, weight 600
- Hover: `translateY(-2px)`, `scale(1.05)`, enhanced shadow `0 8px 30px rgba(84,0,177,0.25)`
- Active: `scale(0.98)`
- Min height: 52px, padding: `16px 40px`

**Cards:**
- Background: white, border: `1px solid rgba(84,0,177,0.06)`, radius: `16–20px`
- Shadow: `0 4px 24px rgba(0,0,0,0.04)`
- Hover: `translateY(-4px)`, shadow `0 20px 60px rgba(84,0,177,0.12)`, border → `#c3aaea`
- Transition: `all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`

**Forms:**
- Input bg: `#f7f5fc`, border: `1px solid rgba(84,0,177,0.1)`, radius: `12px`, padding: `14px 16px`
- Focus: border `#804dd3`, ring `0 0 0 3px rgba(128,77,211,0.15)`, bg white

**Section Headers:**
- Tag: uppercase `0.78rem`, color `#5400b1`, bg `rgba(84,0,177,0.06)`, pill-shaped
- Title: Montserrat weight 800, gradient `em` accent
- Description: `#5e5470`, `1.08rem`, line-height 1.7

**Navigation:**
- Fixed top, z-50, bg `#5400b1`, `backdrop-filter: blur(20px)`
- Logo: white (inverted), links: `rgba(255,255,255,0.7)` → hover `rgba(255,255,255,1)`

**Stats/Results Section:**
- Background: `gradient 170deg #5400b1 → #3a0080`
- Cards: `bg rgba(255,255,255,0.05)`, `border rgba(255,255,255,0.1)`, `backdrop-filter: blur(10px)`
- Values: `#c3aaea`, weight 800, `2.6rem`

### Animations
- **Hover:** `translateY(-2px to -6px)`, `scale(1.05)`, shadow transitions
- **Entrance:** `slideUp` (opacity 0→1, translateY 40→0), `fadeIn`
- **Pulse:** `opacity 1→0.4→1` (2s infinite) for status dots
- **Transitions:** `all 0.2s` (simple), `all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)` (cards)

### Layout
- **Container:** max-width `1100–1140px`, centered
- **Section padding:** `96px 24px` (mobile), `100px 32px` (desktop)
- **Grid:** 1 col (mobile), 2–4 cols (desktop), gap `16–64px`
- **Breakpoints:** Tailwind — `md:` (768px), `lg:` (1024px)

### Dependencies for Design
```
framer-motion         — animations
lucide-react          — icons
class-variance-authority — component variants (CVA)
tailwind-merge        — class merging
```

### Design Reference Files
```
landing-app/src/app/globals.css           — Design tokens, CSS variables
landing-app/src/app/layout.tsx            — Font setup (Montserrat + Roboto)
landing-app/src/components/ui/hero.tsx    — Hero component with shader effects
landing-page/index.html                   — Full CSS color variables
```

---

## General Rules

- Always consult this file at the start of a task
- Prefer the tools/services listed here over alternatives unless told otherwise
- When a new tool is introduced, add it to this document immediately
- **Follow the Rushanet design system** for all UI — purple palette, Montserrat/Roboto fonts, component patterns above
- Keep SMS short — Twilio trial adds a prefix
- Use `after()` from `next/server` for background work on Vercel
- All Google services share one OAuth2 client
- Booking URL is always clean: `https://leads.rushanet.com/book` (no IDs in URL)
