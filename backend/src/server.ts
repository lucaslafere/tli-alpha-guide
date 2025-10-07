import cors from 'cors'
import express from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

const dataDir = path.resolve(__dirname, '..', 'data')
const guidesFile = path.join(dataDir, 'guides.json')
const uploadsDir = path.join(dataDir, 'uploads')

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

// serve uploaded files
app.use('/uploads', express.static(uploadsDir))

function readGuides(): any[] {
  try {
    const txt = fs.readFileSync(guidesFile, 'utf-8')
    return JSON.parse(txt)
  } catch (err) {
    return []
  }
}

function writeGuides(guides: any[]) {
  fs.writeFileSync(guidesFile, JSON.stringify(guides, null, 2), 'utf-8')
}

// multer setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, `${Date.now()}_${safe}`)
  }
})

const upload = multer({ storage })

app.get('/api/guides', (req, res) => {
  const guides = readGuides()
  res.json(guides.map((g) => ({ id: g.id, title: g.title, hero: g.hero })))
})

app.get('/api/guides/:id', (req, res) => {
  const id = req.params.id
  const guides = readGuides()
  const guide = guides.find((g) => g.id === id)
  if (!guide) return res.status(404).json({ error: 'Not found' })
  res.json(guide)
})

app.put('/api/guides/:id', (req, res) => {
  const id = req.params.id
  const guides = readGuides()
  const idx = guides.findIndex((g) => g.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const updated = { ...guides[idx], ...req.body }
  guides[idx] = updated
  writeGuides(guides)
  res.json(updated)
})

app.post('/api/guides', (req, res) => {
  const guides = readGuides()
  const payload = req.body
  const id = (payload.id || `g_${Date.now()}`).toString()
  const newGuide = { ...payload, id }
  guides.push(newGuide)
  writeGuides(guides)
  res.status(201).json(newGuide)
})

// Upload endpoint: accepts form-data with 'file' and 'sectionId'
app.post('/api/guides/:id/uploads', upload.single('file'), (req, res) => {
  const id = req.params.id
  const sectionId = (req.body && req.body.sectionId) || undefined
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const guides = readGuides()
  const idx = guides.findIndex((g) => g.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Guide not found' })

  const guide = guides[idx]
  // default to first section if not provided
  const targetSection = (sectionId && guide.sections.find((s: any) => s.id === sectionId)) || guide.sections[0]
  const imgUrl = `/uploads/${req.file.filename}`
  const newItem = { title: req.file.originalname, content: imgUrl, type: 'image' }
  targetSection.items = targetSection.items || []
  targetSection.items.push(newItem)
  writeGuides(guides)

  res.status(201).json({ url: imgUrl, sectionId: targetSection.id })
})

const port = process.env.PORT ? Number(process.env.PORT) : 4001
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`))
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const dataDir = path.resolve(__dirname, "..", "data");
const guidesFile = path.join(dataDir, "guides.json");

function readGuides(): any[] {
  try {
    const txt = fs.readFileSync(guidesFile, "utf-8");
    return JSON.parse(txt);
  } catch (err) {
    return [];
  }
}

function writeGuides(guides: any[]) {
  fs.writeFileSync(guidesFile, JSON.stringify(guides, null, 2), "utf-8");
}

app.get("/api/guides", (req, res) => {
  const guides = readGuides();
  res.json(guides.map((g) => ({ id: g.id, title: g.title, hero: g.hero })));
});

app.get("/api/guides/:id", (req, res) => {
  const id = req.params.id;
  const guides = readGuides();
  const guide = guides.find((g) => g.id === id);
  if (!guide) return res.status(404).json({ error: "Not found" });
  res.json(guide);
});

app.put("/api/guides/:id", (req, res) => {
  const id = req.params.id;
  const guides = readGuides();
  const idx = guides.findIndex((g) => g.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const updated = { ...guides[idx], ...req.body };
  guides[idx] = updated;
  writeGuides(guides);
  res.json(updated);
});

app.post("/api/guides", (req, res) => {
  const guides = readGuides();
  const payload = req.body;
  const id = (payload.id || `g_${Date.now()}`).toString();
  const newGuide = { ...payload, id };
  guides.push(newGuide);
  writeGuides(guides);
  res.status(201).json(newGuide);
});

const port = process.env.PORT ? Number(process.env.PORT) : 4001;
app.listen(port, () =>
  console.log(`Backend listening on http://localhost:${port}`)
);
