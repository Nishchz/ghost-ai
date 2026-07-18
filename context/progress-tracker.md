# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 12: Shape Panel (completed)

## Current Goal
- All planned feature specs (01–12) implemented and verified.

## Completed

- Feature 01: Design System — shadcn/ui installed and configured for Tailwind v4, dark-only theme tokens in globals.css, Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea components added to components/ui/, lucide-react installed, lib/utils.ts cn() helper in place. TypeScript compiles clean.
- Feature 02: Editor Chrome — EditorNavbar (fixed top bar with sidebar toggle using PanelLeftOpen/PanelLeftClose icons) and ProjectSidebar (floating overlay, slides in from left, Tabs for My Projects/Shared, New Project button) created in components/editor/. Dialog pattern documented — uses existing shadcn Dialog with globals.css tokens. Components compile without TypeScript or lint errors.
- Feature 03: Auth — ClerkProvider with dark theme wrapping root layout, proxy.ts at project root (protected-first, public: /sign-in, /sign-up), sign-in/sign-up two-panel pages using CSS variables only, home page redirects (auth→/editor, unauth→/sign-in), app/editor/page.tsx created, UserButton added to EditorNavbar right section. npm run build passes.
- Feature 04: Project Dialogs — editor home CTA, Create/Rename/Delete dialogs, sidebar project item actions, useProjectDialogs hook, mobile backdrop scrim.
- Feature 05: Prisma — Project and ProjectCollaborator models in prisma/models/project.prisma, cached Prisma client singleton in lib/prisma.ts branching on DATABASE_URL (for Accelerate vs. direct pg), database migration applied, and successful type-safe client generation in app/generated/prisma.
- Feature 06: Project APIs — REST endpoints for GET/POST /api/projects and PATCH/DELETE /api/projects/[projectId]. Auth enforced (401 unauthenticated, 403 non-owner mutations). Routes are thin; no UI wiring at this stage.
- Feature 07: Wire Editor Home — editor/page.tsx converted to Server Component fetching projects via getUserProjects helper; EditorHomeClient and WorkspaceClient client wrappers created; useProjectActions hook wires Create (POST + navigate), Rename (PATCH + refresh), Delete (DELETE + redirect/refresh) to real API; project sidebar items navigate to /editor/[id] on click; Room ID preview shown in Create dialog; /editor/[projectId] workspace route added. npm run build and npm run lint pass clean.
- Feature 08: Editor Workspace Shell — lib/project-access.ts created with getCurrentIdentity and getProjectIfAccessible helpers; components/editor/access-denied.tsx created (lock icon, centered layout, link to /editor); /editor/[projectId]/page.tsx refactored to use access helpers and render AccessDenied for missing or unauthorized projects instead of redirecting; components/editor/workspace-navbar.tsx created with project name in center, Share button placeholder, and AI sidebar toggle; WorkspaceClient updated to use WorkspaceNavbar and collapsible right AI sidebar placeholder; ProjectSidebar updated with activeProjectId prop to highlight the current room. TypeScript compiles clean.
- Feature 09: Share Dialog — API routes for collaborator CRUD: GET/POST /api/projects/[projectId]/collaborators and DELETE /api/projects/[projectId]/collaborators/[collaboratorId]; ownership enforced server-side for invite and remove; collaborator emails enriched with Clerk Backend API (display name + avatar via clerkClient().users.getUserList); ShareDialog client component with invite-by-email form (owner only), collaborator list with avatars, per-row remove (owner only), and copy-link with temporary Copied! feedback; WorkspaceNavbar updated from placeholder to functional Share button opening ShareDialog; isOwner prop threaded from server page through WorkspaceClient. npm run build passes clean.
- Feature 10: Liveblocks Setup — liveblocks.config.ts updated with typed Presence (cursor: {x,y}|null, isThinking: boolean) and UserMeta (id, name, avatar, color); lib/liveblocks.ts created with lazy-initialized cached node client (getLiveblocksClient) and deterministic cursor color helper (getCursorColor, 8-color palette); POST /api/liveblocks-auth created — requires Clerk auth, verifies project access via getProjectIfAccessible, ensures room exists via getOrCreateRoom (private by default, user gets room:write), returns ID-token session with name/avatar/color attached; @liveblocks/node installed. npm run build passes clean.
- Feature 11: Base Canvas — Installed `@liveblocks/react`, `@liveblocks/react-flow`, `@xyflow/react`, and `react-error-boundary`. Created shared canvas types in `types/canvas.ts`. Created `CollaborativeCanvas` with React Flow, Background, and MiniMap, and `CanvasWrapper` with Liveblocks room/error fallback/suspense loading configurations. Replaced canvas placeholder in `WorkspaceClient` with the new Liveblocks-backed canvas wrapper. Verified `npm run build` compiles clean.
- Feature 12: Shape Panel — Floating bottom toolbar with draggable shapes (rectangle, diamond, circle, pill, cylinder, hexagon), React Flow integration via ReactFlowProvider, onDragOver/onDrop handler, default sizes per shape, custom canvasNode renderer with 4 hover-revealed handles.

## In Progress

- None


## Open Questions

- None.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Project ID and Liveblocks room ID are kept aligned: the client generates a `slug-XXXX` room ID and passes it as the `id` field on POST /api/projects, so both the database record and the room share the same identifier.
- Server Components are used for initial data fetching (editor home and workspace pages); client components handle interactive state.

## Session Notes

- Using Next.js 16.2.10 with React 19 and Tailwind CSS v4.
- shadcn version 4.5.0 was used; it auto-detected Tailwind v4.
- lucide-react ^1.25.0 installed as a direct dependency.
- All 12 feature specs implemented. Next steps will be defined when new specs are added.
- LIVEBLOCKS_SECRET_KEY must be added to .env.local (from https://liveblocks.io/dashboard/apikeys) before /api/liveblocks-auth will function at runtime.
