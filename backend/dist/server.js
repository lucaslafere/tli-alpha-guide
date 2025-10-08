"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
const dataDir = path_1.default.resolve(__dirname, '..', 'data');
const guidesFile = path_1.default.join(dataDir, 'guides.json');
const uploadsDir = path_1.default.join(dataDir, 'uploads');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
// Configure multer for image uploads
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const imageUpload = (0, multer_1.default)({
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
app.post('/api/upload', imageUpload.single('image'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No image file provided or invalid file type' });
    }
    res.json({ url: `/uploads/${file.filename}` });
});
// serve uploaded files
app.use('/uploads', express_1.default.static(uploadsDir));
function readGuides() {
    try {
        const txt = fs_1.default.readFileSync(guidesFile, 'utf-8');
        return JSON.parse(txt);
    }
    catch (err) {
        return [];
    }
}
function writeGuides(guides) {
    fs_1.default.writeFileSync(guidesFile, JSON.stringify(guides, null, 2), 'utf-8');
}
// multer setup
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${Date.now()}_${safe}`);
    },
});
const upload = (0, multer_1.default)({ storage });
app.get('/api/guides', (_req, res) => {
    const guides = readGuides();
    res.json(guides.map((g) => ({ id: g.id, title: g.title, hero: g.hero })));
});
app.get('/api/guides/:id', (req, res) => {
    const id = req.params.id;
    const guides = readGuides();
    const guide = guides.find((g) => g.id === id);
    if (!guide)
        return res.status(404).json({ error: 'Not found' });
    res.json(guide);
});
app.put('/api/guides/:id', (req, res) => {
    const id = req.params.id;
    const guides = readGuides();
    const idx = guides.findIndex((g) => g.id === id);
    if (idx === -1)
        return res.status(404).json({ error: 'Not found' });
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
// Upload endpoint: accepts form-data with 'file' and 'sectionId'
app.post('/api/guides/:id/uploads', upload.single('file'), (req, res) => {
    const id = req.params.id;
    const file = req.file;
    const sectionId = (req.body && req.body.sectionId);
    if (!file)
        return res.status(400).json({ error: 'No file uploaded' });
    const guides = readGuides();
    const idx = guides.findIndex((g) => g.id === id);
    if (idx === -1)
        return res.status(404).json({ error: 'Guide not found' });
    const guide = guides[idx];
    // default to first section if not provided
    const targetSection = (sectionId && guide.sections.find((s) => s.id === sectionId)) || guide.sections[0];
    const imgUrl = `/uploads/${file.filename}`;
    const newItem = { title: file.originalname, content: imgUrl, type: 'image' };
    targetSection.items = targetSection.items || [];
    targetSection.items.push(newItem);
    writeGuides(guides);
    res.status(201).json({ url: imgUrl, sectionId: targetSection.id });
});
const port = process.env.PORT ? Number(process.env.PORT) : 4001;
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
