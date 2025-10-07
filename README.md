# tli-alpha-guide

This repository contains a small Vite + React (TypeScript) frontend and an Express (TypeScript) backend used to author and view Torchlight Infinite guides stored as JSON files.

Run instructions (PowerShell):

1. Backend

```powershell
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:4001

2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

Notes:

- Guides are stored in `backend/data/guides.json`.
- Admin editing in the UI does a PUT to `/api/guides/:id` and updates the JSON file.
