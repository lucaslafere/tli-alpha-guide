import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type GuideSummary = { id: string; title: string; hero: string };
type Guide = { id: string; title: string; hero: string; sections?: any[] };

export default function GuidesListPage() {
  const [guides, setGuides] = useState<GuideSummary[]>([]);

  useEffect(() => {
    axios
      .get('http://localhost:4001/api/guides')
      .then((r) => setGuides(r.data))
      .catch(() => setGuides([]));
  }, []);

  async function createNewGuide() {
    const title = window.prompt('New guide title', 'New Guide');
    if (!title) return;
    const idBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const id = `${idBase || 'guide'}_${Date.now()}`;

    // try fetch iris guide to use as template
    let sections: any[] = [];
    try {
      const r = await axios.get('http://localhost:4001/api/guides/iris_growing_breeze');
      sections = r.data.sections || [];
    } catch (e) {
      console.warn('Could not load iris template, using empty sections', e);
    }

    const payload = { id, title, hero: `${title} — quick summary`, sections } as Guide;
    try {
      const res = await axios.post('http://localhost:4001/api/guides', payload);
      const created: Guide = res.data;
      // update local list and reload to ensure UI state
      setGuides((g) => [...g, { id: created.id, title: created.title, hero: created.hero }]);
      setTimeout(() => window.location.reload(), 200);
    } catch (err) {
      console.error('Create guide failed', err);
      alert('Failed to create guide');
    }
  }

  return (
    <div className="guides-page">
      <div
        className="guides-header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h1>Torchlight Infinite - Character Guides</h1>
        <button onClick={createNewGuide}>New Guide</button>
      </div>
      <div className="guides-grid">
        {guides.map((guide) => (
          <Link to={`/guides/${guide.id}`} key={guide.id} className="guide-card">
            <h2>{guide.title}</h2>
            <div className="guide-hero">{guide.hero}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
