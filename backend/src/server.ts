import cors from 'cors';
import express, { Request, Response } from 'express';
import fs from 'fs';
import type { Request as ExpressRequest } from 'express';
import multer from 'multer';
import path from 'path';

type Item = { title: string; content: string; type?: string };
type Section = { id: string; title: string; items: Item[]; open?: boolean };
type Guide = { id: string; title: string; hero: string; sections: Section[] };

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const dataDir = path.resolve(__dirname, '..', 'data');
const guidesFile = path.join(dataDir, 'guides.json');
const uploadsDir = path.join(dataDir, 'uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Image upload endpoint
app.post('/api/upload', imageUpload.single('image'), (req: Request, res: Response) => {
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ error: 'No image file provided or invalid file type' });
  }
  res.json({ url: `/uploads/${file.filename}` });
});

// serve uploaded files
app.use('/uploads', express.static(uploadsDir));

function readGuides(): Guide[] {
  try {
    const txt = fs.readFileSync(guidesFile, 'utf-8');
    return JSON.parse(txt) as Guide[];
  } catch (err) {
    return [];
  }
}

function writeGuides(guides: Guide[]) {
  fs.writeFileSync(guidesFile, JSON.stringify(guides, null, 2), 'utf-8');
}

// multer setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({ storage });

app.get('/api/guides', (_req: Request, res: Response) => {
  const guides = readGuides();
  res.json(guides.map((g) => ({ id: g.id, title: g.title, hero: g.hero })));
});

app.get('/api/guides/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const guides = readGuides();
  const guide = guides.find((g) => g.id === id);
  if (!guide) return res.status(404).json({ error: 'Not found' });
  res.json(guide);
});

app.put('/api/guides/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const guides = readGuides();
  const idx = guides.findIndex((g) => g.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...guides[idx], ...req.body };
  guides[idx] = updated as Guide;
  writeGuides(guides);
  res.json(updated);
});

app.post('/api/guides', (req: Request, res: Response) => {
  const guides = readGuides();
  const payload = req.body as Partial<Guide>;
  const id = (payload.id || `g_${Date.now()}`).toString();
  const newGuide: Guide = { ...(payload as Guide), id };
  guides.push(newGuide);
  writeGuides(guides);
  res.status(201).json(newGuide);
});

// Upload endpoint: accepts form-data with 'file' and 'sectionId'
app.post('/api/guides/:id/uploads', upload.single('file'), (req: Request, res: Response) => {
  const id = req.params.id;
    const file = (req as ExpressRequest & { file: Express.Multer.File }).file;
  const sectionId = (req.body && req.body.sectionId) as string | undefined;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const guides = readGuides();
  const idx = guides.findIndex((g) => g.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Guide not found' });

  const guide = guides[idx];
  // default to first section if not provided
  const targetSection =
    (sectionId && guide.sections.find((s) => s.id === sectionId)) || guide.sections[0];
  const imgUrl = `/uploads/${file.filename}`;
  const newItem: Item = { title: file.originalname, content: imgUrl, type: 'image' };
  targetSection.items = targetSection.items || [];
  targetSection.items.push(newItem);
  writeGuides(guides);

  res.status(201).json({ url: imgUrl, sectionId: targetSection.id });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4001;
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
