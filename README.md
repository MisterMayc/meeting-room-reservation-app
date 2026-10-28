# Hakob Torosyan - Test Assessment (T3 Frontend Engineer)

This task was done using chatgpt, codex, as in the test assessment I needed to also provide the link to AI chat :)
I have written only a few lines of code with my own hands, but I actively participated in making business logic, testing the layout, reading the task requirements and thinking ways to achieve them. No other AI chat was used, (only used one to remind me how to deploy to netlify :)), I will leave the link to AI chat below, this was the only chat I used while creating this application.

https://chatgpt.com/s/cx_6ae2524be0048191974cac59797e23c2

A daily booking calendar built with React, TypeScript, Vite, and CSS. MSW provides a mock http api backed by localStorage.

- **Live demo:** add the Netlify URL
- **AI conversation:** add the shared chat URL
- **Time spent:** add the actual total

## Run locally

Use Node.js 22.12 or later.

```bash
npm ci
npm run dev
```

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

## Features

- Select a date and view, create, edit, or delete bookings.
- Book between 09:00 and 18:00 for 30–120 minutes.
- Prevent overlaps within the same room; adjacent bookings are allowed.
- Reject past start times and exclude the edited booking from its own conflict check.
- Show loading, empty, saving, and error states.
- Handle HTTP 409 conflicts without losing form input.
- Responsive calendar with labelled inputs and keyboard controls.

## Try a conflict

1. Turn on Simulate conflict beside New reservation.
2. Submit a new booking for an available time.
3. The mock API saves a competing booking and returns HTTP 409. The calendar refreshes while your form stays open with its values intact.

I chose to create an optional case for simulating the conflict, so you can reproduce the error and see it directly in the app, not just the error handling code.

## Structure

- `src/domain` — booking rules and date/time helpers.
- `src/api` — fetch client and HTTP errors.
- `src/mocks` — MSW handlers and conflict simulation.
- `src/data` — localStorage persistence and initial demo data.
- `src/hooks` and `src/components` — UI state and components.

Thanks for reviewing my assessment, I hope to pass to the next step !

Hakob Torosyan
