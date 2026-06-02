# Benji Workout Tracker - 12 Week Edition

A private, dark-mode-only React app for tracking the full 12-week training rebuild.

The app is intentionally simple: open it, choose the week/day, log your sets, and the data persists in your browser with IndexedDB.

## What changed from the Week 1 version

- Full 12-week plan is included.
- Week selector added for Weeks 1-12.
- IndexedDB replaces localStorage for more robust browser storage.
- Dashboard now tracks total 12-week progress, selected week progress, volume, completed days/weeks, and body check-ins.
- Each week has separate body metrics: weight, waist, sleep, stress, surf sessions, gym sessions, and notes.
- Export/import now backs up the entire 12-week log.
- Checkboxes are labelled more clearly:
  - **Set done** marks that specific set as completed.
  - **Exercise complete** marks the whole exercise as finished.
- The project is ready for GitHub Pages deployment with GitHub Actions.

## Important storage note

IndexedDB is local browser storage. It is stronger and more suitable than localStorage for structured app data, but it is still stored per browser/device/domain.

That means:

- Data persists on your phone/browser unless browser data is cleared.
- Data is private and does not go to a server.
- Data does **not** automatically sync between your phone and laptop.
- If you open the app from `localhost`, GitHub Pages, and another custom domain, each origin has its own separate IndexedDB database.
- Use **Export** to download a JSON backup.
- Use **Import** on another device/browser to move the data manually.

If you later want true cross-device sync, add a backend such as Supabase, Firebase, a tiny API, or an encrypted cloud file workflow. GitHub Pages alone is static hosting, so it cannot sync app data by itself.

## Tech stack

- Vite
- React
- TypeScript
- Native IndexedDB wrapper, no external database library
- Static build, works on GitHub Pages
- No login, no server, no analytics, no external API

## Project structure

```text
src/
  App.tsx                         Main app shell, selected week/day, state updates
  data/trainingProgram.ts          Full 12-week workout data
  lib/storage.ts                   IndexedDB persistence, backup export/import, old Week 1 migration
  lib/analytics.ts                 Dashboard calculations
  components/                      Reusable UI pieces
  types.ts                         Data model for weeks, logs, body metrics
.github/workflows/deploy.yml       GitHub Pages deployment workflow
```

## Run locally

Install Node.js first. Node 20+ is recommended; the GitHub workflow uses Node 22.

```bash
npm install
npm run dev
```

Open the URL shown in the terminal, usually:

```text
http://localhost:5173
```

To test on your phone while your laptop and phone are on the same Wi-Fi:

1. Find your laptop IP address.
2. Keep the dev server running.
3. Open this on your phone:

```text
http://YOUR-LAPTOP-IP:5173
```

Example:

```text
http://192.168.1.23:5173
```

## Build locally

```bash
npm run build
```

The production files will be generated in:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

## Deploy to GitHub Pages for free

This project already includes a GitHub Actions workflow at:

```text
.github/workflows/deploy.yml
```

### 1. Create a new GitHub repository

Create a new empty repository on GitHub, for example:

```text
benji-workout-tracker
```

### 2. Push the app

From the project folder:

```bash
git init
git add .
git commit -m "Initial 12-week workout tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/benji-workout-tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 3. Enable GitHub Pages

In the GitHub repository:

1. Go to **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Save if GitHub asks you to save.

### 4. Wait for the deploy action

Go to the **Actions** tab in GitHub.

The workflow named **Deploy to GitHub Pages** should run automatically after you push to `main`.

When it finishes, your app URL will look similar to:

```text
https://YOUR_USERNAME.github.io/benji-workout-tracker/
```

## GitHub Pages and IndexedDB

IndexedDB works on GitHub Pages because the app runs fully in your browser.

But remember:

- Your GitHub Pages URL has its own IndexedDB database.
- Your localhost version has a different IndexedDB database.
- Your phone Safari/Chrome and laptop Chrome are separate databases.
- To move data between them, use Export/Import.

## Using the app

### Workout view

1. Select the week.
2. Select the day.
3. Log each set:
   - `kg`: working weight.
   - `Reps` or `Time`: reps, seconds, minutes, or distance depending on the exercise.
   - `RIR`: reps in reserve.
   - `Set done`: marks that set as completed.
4. Use exercise notes for machine settings, pain, assistance, or changes.
5. Use session notes for general workout notes.

### Dashboard view

Use this for:

- Total 12-week progress.
- Current week progress.
- Completed days/weeks.
- Volume estimate.
- Body metrics.
- Recent body trend.

### Guide view

Use this for:

- Tempo explanation.
- RIR explanation.
- Surf day rules.
- Pain rules.
- Exercise YouTube search links.

## Tempo reminder

A tempo like `3-1-1-1` means:

```text
3 seconds lower
1 second pause at the bottom/stretch
1 second lift
1 second pause/reset at the top
```

A tempo like `3-1-1` uses the same idea without a final top pause.

`Still` means hold position.

`Slow` means controlled with no rushing.

## RIR reminder

RIR means **reps in reserve**.

Examples:

- RIR 4: stop when you could still do about 4 clean reps.
- RIR 2: stop when you could still do about 2 clean reps.
- RIR 1: hard set, but still no ugly failed reps.

Use RIR instead of percentages because it adjusts better to sleep, stress, soreness, and surf sessions.

## Backup and restore

### Export backup

Click **Export** in the app.

This downloads a file like:

```text
benji-12-week-workout-log-2026-06-02.json
```

Keep it somewhere safe.

### Import backup

Click **Import** and select the JSON backup file.

This replaces the current browser's tracker state with the imported backup.

## Future extension ideas

The app is structured so future changes should be manageable:

- Add charts for weight, waist, sleep, volume, and estimated strength.
- Add exercise-specific history pages.
- Add PR detection.
- Add automatic next-load suggestions.
- Add Supabase/Firebase sync for phone/laptop continuity.
- Add authentication if the app becomes cloud-backed.
- Add a real PWA install prompt and offline cache strategy.

## Troubleshooting

### My data disappeared

Possible causes:

- Browser data was cleared.
- You opened the app on another device/browser.
- You changed from localhost to GitHub Pages.
- You changed the GitHub Pages URL/repository name.

Use Import if you have a JSON backup.

### GitHub Pages deployed but the screen is blank

Try these steps:

1. Run `npm run build` locally and confirm it succeeds.
2. Confirm GitHub Pages Source is set to **GitHub Actions**.
3. Check the failed step in the **Actions** tab.
4. Make sure the repository has the workflow file at `.github/workflows/deploy.yml`.

### I want automatic sync between phone and laptop

IndexedDB cannot do that by itself. You need a backend or cloud storage layer. The cleanest future approach would be:

- Supabase Auth + database, or
- Firebase Auth + Firestore, or
- a private API with a small database, or
- encrypted JSON backup files stored manually in iCloud/Drive.
