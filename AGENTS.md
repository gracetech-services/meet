# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project for LiveKit Meet. Routes live in `app/`, including rooms under `app/rooms/[roomName]/`, API handlers under `app/api/`, and the custom conference route in `app/custom/`. Shared React components, hooks, utilities, and tests live in `lib/`. Styles are in `styles/`; static assets are in `public/` and `.github/assets/`. Keep route-specific UI close to its route and reusable behavior in `lib/`.

## Build, Test, and Development Commands

Use pnpm, as declared by `packageManager`:

- `pnpm install`: install dependencies from `pnpm-lock.yaml`.
- `pnpm dev`: run the local Next.js dev server at `http://localhost:3000`.
- `pnpm build`: create a production Next.js build.
- `pnpm start`: serve production.
- `pnpm lint`: run Next.js ESLint checks.
- `pnpm lint:fix`: apply ESLint fixes.
- `pnpm test`: run Vitest tests once.
- `pnpm format:check`: verify Prettier formatting.
- `pnpm format:write`: format TypeScript, Markdown, and JSON files.

For local setup, copy `.env.example` to `.env.local` and fill in LiveKit values.

## Coding Style & Naming Conventions

Write TypeScript and React with strict type checking enabled. Use 2-space indentation, single quotes, semicolons, trailing commas, and a 100-character print width, matching `.prettierrc`. Prefer named exports for shared helpers and components. Component files use PascalCase, such as `SettingsMenu.tsx`; hooks use `use...`, such as `useSetupE2EE.ts`; utilities use descriptive camelCase names, such as `getLiveKitURL.ts`. Use the `@/*` path alias for root-relative imports when it improves clarity.

## Testing Guidelines

Tests run with Vitest. Place focused unit tests next to the code they cover using `*.test.ts` or `*.test.tsx`, as in `lib/getLiveKitURL.test.ts`. Add tests for URL parsing, environment-dependent logic, and utility behavior. Run `pnpm test` before submitting changes; use `pnpm build` when touching routes, API handlers, or configuration.

## Commit & Pull Request Guidelines

Recent history uses concise, imperative subjects and conventional prefixes, for example `fix(deps): update dependency next to v15.5.16 [security]` and `chore(deps): update dependency node to v24`. Follow that style when practical: `fix:`, `feat:`, `chore:`, or scoped forms like `fix(deps):`.

Pull requests should describe the change, note environment updates, link issues, and include screenshots or recordings for UI changes. Before opening a PR, run `pnpm lint`, `pnpm test`, `pnpm format:check`, and `pnpm build` when relevant.

## Security & Configuration Tips

Do not commit `.env.local` or secrets. Keep public client configuration separate from server-only API route values. When changing LiveKit token, recording, or connection-detail logic, verify local behavior and production build compatibility.
