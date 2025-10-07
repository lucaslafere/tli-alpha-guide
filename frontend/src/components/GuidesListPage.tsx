import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type GuideSummary = { id: string; title: string; hero: string };

export default function GuidesListPage() {
  const [guides, setGuides] = useState<GuideSummary[]>([]);

  useEffect(() => {
    axios
      .get('http://localhost:4001/api/guides')
      .then((r) => setGuides(r.data))
      .catch(() => setGuides([]));
  }, []);

  return (
    <div className="guides-page">
      <div className="guides-header">
        <h1>Torchlight Infinite - Character Guides</h1>
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
