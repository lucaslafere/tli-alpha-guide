# Developer Guide

This file documents the backend endpoints, data model, developer workflows, and notes for extending the TLI Guides app.

Overview

- Small monorepo with `frontend/` and `backend/`. The backend persists guides to `backend/data/guides.json` (a flat JSON file). The frontend provides a simple UI to view and edit guides.

Backend (server)

- Location: `backend/src/server.ts`
- Startup: `npm run dev` (uses ts-node-dev in package.json)

Endpoints

1. GET /api/guides

- Description: returns an array of guide summaries.
- Response shape: `[ { id, title, hero } ]`

2. GET /api/guides/:id

- Description: returns the full guide object for given id.
- Response shape: the guide object (see Data Model below)
- Status codes: 200 OK, 404 Not Found

3. POST /api/guides

- Description: create a new guide. Request body should be a guide object (without id or with a custom id). Server will persist and return 201.

4. PUT /api/guides/:id

- Description: update an existing guide. Body is the updated guide object. Server replaces the corresponding guide and writes the JSON file.

Data model

- Guide (object)

  - id: string (unique)
  - title: string
  - hero: string (character name)
  - sections: array of Section

- Section (object)

  - id: string
  - title: string
  - items: array of Item

- Item (object)
  - title: string
  - content: string (plain text or HTML/markdown if you prefer — current UI renders plain text)

Notes on persisting

- The server reads and writes the single `guides.json` file synchronously. This is OK for a small, single-user admin tool. If multiple concurrent admins will edit, replace with a proper DB or add file locking + backup.

Extending the API

- Validation: add JSON Schema validation (ajv) in the backend before writing.
- Images: to allow images inside guides, either store image URLs or add an uploads endpoint and serve static files from `backend/data/uploads`.

Frontend

- Location: `frontend/src/`
- Main files:
  - `App.tsx` — main shell and state for selected guide
  - `components/GuideList.tsx` — sidebar list
  - `components/GuidePage.tsx` — guide view/editor with collapsible sections and items
  - `styles.css` — CSS variables for colors

Developer flow

1. Pull the repo
2. Start backend: `cd backend && npm install && npm run dev`
3. Start frontend: `cd frontend && npm install && npm run dev`
4. Make changes, verify in the browser, commit and push

Design decisions and tradeoffs

- Data persistence: simple JSON file for speed and minimal infra.
- No auth: this is intended as a local authoring tool. Add auth before exposing widely.

Troubleshooting

- If edits do not appear on the frontend, check browser console for network errors and ensure the backend is running on port 4001.
- If `guides.json` becomes corrupted, restore from git history or maintain backups.

Contact

- If you need help extending or hardening this project, add an issue with details in the repo.
