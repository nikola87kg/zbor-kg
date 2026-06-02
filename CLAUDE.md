# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # dev server at http://localhost:4201
npm run build          # production build (SSR)
npm run watch          # dev build with watch mode
npm test               # run unit tests
npm run serve:ssr:zbor # serve the built SSR output at http://localhost:4000
```

Generate a new component:
```bash
ng generate component path/to/component-name
```

## Architecture

**Angular 21 SSR app** using the `@angular/build:application` builder with Express.js for server-side rendering.

### Dual entry points
- `src/main.ts` — browser bootstrap
- `src/main.server.ts` — server bootstrap (uses merged config)
- `src/server.ts` — Express server; serves static files from `dist/zbor/browser` and delegates all other requests to Angular SSR. Also exports `reqHandler` for Firebase Cloud Functions.

### Config split
- `src/app/app.config.ts` — browser providers (router, hydration with event replay)
- `src/app/app.config.server.ts` — merges browser config with SSR providers
- `src/app/app.routes.server.ts` — all routes use `RenderMode.Prerender` by default; change to `RenderMode.Server` for dynamic SSR routes

### Components
Angular 21 drops the `.component` suffix convention. New components use `app.ts` / `app.html` / `app.scss` (not `app.component.ts`). The legacy `app.component.*` files are an artifact of initial scaffolding and should not be used as a naming model.

Components are standalone (no NgModules). The root selector prefix is `app-`.

### Styling
SCSS throughout. Global styles in `src/styles.scss`. Prettier configured with `singleQuote: true`, `printWidth: 100`, and the Angular parser for HTML files.

### Firebase
`firebase` v12 is installed. Firebase config (project `zbor-kg`) should be initialized via `initializeApp()` in a dedicated service or `app.config.ts` provider — not directly in component files. Analytics (`getAnalytics`) only runs in the browser; guard with `isPlatformBrowser` when used in an SSR context.
