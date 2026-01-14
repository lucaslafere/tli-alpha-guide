import React from 'react';

type GuideSummary = { id: string; title: string; hero?: string };

export default function GuideList({
  guides,
  onSelect,
}: {
  guides: GuideSummary[];
  onSelect: (id: string) => void;
}) {
  async function createNewGuide() {
    const title = window.prompt('New guide title', 'New Guide');
    if (!title) return;
    const idBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const id = `${idBase || 'guide'}_${Date.now()}`;

    // Try to fetch the existing Iris guide to use as the template
    let sections: any[] = [];
    try {
      const r = await fetch('/api/guides/iris_growing_breeze');
      if (r.ok) {
        const iris = await r.json();
        sections = iris.sections || [];
      }
    } catch (e) {
      // ignore — fallback to empty sections
      console.warn('Could not load iris template, using empty sections', e);
    }

    const payload = { id, title, hero: `${title} — quick summary`, sections };

    try {
      const res = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const guide = await res.json();
      if (onSelect) onSelect(guide.id);
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      console.error('Create guide failed', err);
      alert('Failed to create guide: ' + String(err));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3>Guides</h3>
        <button onClick={createNewGuide}>New Guide</button>
      </div>
      <ul className="guide-list">
        {guides.map((g) => (
          <li key={g.id} onClick={() => onSelect(g.id)}>
            <strong>{g.title}</strong>
            <div className="muted">{g.hero}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
