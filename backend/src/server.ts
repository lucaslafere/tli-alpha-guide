import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const dataDir = path.resolve(__dirname, '..', 'data');
const guidesFile = path.join(dataDir, 'guides.json');

function readGuides(): any[] {
  try {
    const txt = fs.readFileSync(guidesFile, 'utf-8');
    return JSON.parse(txt);
  } catch (err) {
    return [];
  }
}

function writeGuides(guides: any[]) {
  fs.writeFileSync(guidesFile, JSON.stringify(guides, null, 2), 'utf-8');
}

app.get('/api/guides', (req, res) => {
  const guides = readGuides();
  res.json(guides.map(g => ({ id: g.id, title: g.title, hero: g.hero })));
});

app.get('/api/guides/:id', (req, res) => {
  const id = req.params.id;
  const guides = readGuides();
  const guide = guides.find(g => g.id === id);
  if (!guide) return res.status(404).json({ error: 'Not found' });
  res.json(guide);
});

app.put('/api/guides/:id', (req, res) => {
  const id = req.params.id;
  const guides = readGuides();
  const idx = guides.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...guides[idx], ...req.body };
  guides[idx] = updated;
  writeGuides(guides);
  res.json(updated);
});

app.post('/api/guides', (req, res) => {
  const guides = readGuides();
  const payload = req.body;
  const id = (payload.id || `g_${Date.now()}`).toString();
  const newGuide = { ...payload, id };
  guides.push(newGuide);
  writeGuides(guides);
  res.status(201).json(newGuide);
});

const port = process.env.PORT ? Number(process.env.PORT) : 4001;
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
