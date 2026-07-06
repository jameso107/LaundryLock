# ZCS Connect — Proof of Concept

An interactive, browser-based mockup of **ZCS Connect** — the mobile communication hub for
Zeeland Christian School described in the PRD (v0.1, July 2026). Built to show stakeholders
what the app could look and feel like before the Expo/Supabase build begins.

**One-liner:** One app for everything between ZCS and home.

## What it demonstrates

A simulated phone with a role switcher. All three roles share one in-memory state, so actions
in one role show up live in the others.

- **Parent** — F1 onboarding (join code `ZCS-7RM4KX` → child name → feed), merged
  school-wide + classroom feed with read tracking, teacher DMs with the permanent
  "may be reviewed by administration" disclosure, merged calendar with RSVPs and
  volunteer-slot claiming, and a To-Do tab with a signable permission slip
  (typed-name signature, per-child responses).
- **Teacher** — classroom join-code card (regenerate + printable handout), member list,
  announcement composer with push fan-out, per-post read counts with a one-time nudge,
  and a form-completion dashboard with rate-limited reminders.
- **Admin** — school-wide composer with **priority alert** mode (snow-day template included),
  classroom/adoption overview, staff allowlist, and the DM audit-log browser where every
  admin view is itself logged.

Post as the Teacher or fire a priority alert as the Admin, then switch to Parent and watch
it land in the feed with an in-phone push banner.

## Stack

Plain HTML/CSS/JS — no build step, no dependencies, no backend. Demo data only; state
resets on reload.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Static site on Vercel (no build command, output directory `.`).

---

*Prepared for Zeeland Christian School by Syzygy Services LLC. This is a visual/interaction
proof of concept — the production app is planned as Expo (React Native) + Supabase per the PRD.*
