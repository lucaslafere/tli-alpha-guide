# Contributing to tli-alpha-guide

Thanks for your interest in contributing. This document explains the repo layout, how guides are stored, how to run the project locally, and the simplest ways to make changes.

1. Repo layout

- `backend/` - Express TypeScript server. Endpoints live in `backend/src/server.ts`. Data is stored in `backend/data/guides.json`.
- `frontend/` - Vite + React TypeScript app. Main entry: `frontend/src/main.tsx` and app shell `frontend/src/App.tsx`.
- `README.md` - quick run instructions.
- `CONTRIBUTING.md` - this file.
- `docs/DEVELOPER_GUIDE.md` - in-repo developer guide with API and data model (detailed).

2. How guides are stored

Guides are stored in `backend/data/guides.json` as an array of objects. Each guide has the following shape (example):

```json
{
  "id": "iris_growing_breeze",
  "title": "Iris - The Growing Breeze",
  "hero": "Iris",
  "sections": [
    {
      "id": "campaign",
      "title": "Campaign Leveling",
      "items": [{ "title": "Act 1", "content": "..." }]
    }
  ]
}
```

If you add fields, keep backward compatibility in mind. The frontend expects `id`, `title`, `hero`, and `sections` with `items[].content`.

3. Quick dev run (PowerShell)

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

4. Making changes

- Backend edits: update `backend/src/server.ts`. Keep endpoints small and well-typed. If adding new routes, document them in `docs/DEVELOPER_GUIDE.md`.
- Frontend edits: follow React + TypeScript conventions. Add components under `frontend/src/components`. Use CSS variables in `frontend/src/styles.css` for theming.

5. Committing

- Commit early and in small chunks. Use descriptive messages such as `feat(frontend): add guide editor` or `fix(backend): validate guide id`.

6. Tests & formatting

- (Optional) Add unit tests for critical logic. There are no tests initially.

7. Future improvements

- Add validation and simple backups for `guides.json` before writing.
- Add basic authentication for admin edits.

Thanks — we appreciate contributions!
