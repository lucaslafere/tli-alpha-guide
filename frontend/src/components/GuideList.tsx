import React from 'react';

type GuideSummary = { id: string; title: string; hero?: string };

export default function GuideList({
  guides,
  onSelect,
}: {
  guides: GuideSummary[];
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h3>Guides</h3>
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
