import React from 'react'

export default function GuideList({ guides, onSelect }: { guides: any[]; onSelect: (id: string) => void }) {
  return (
    <div>
      <h3>Guides</h3>
      <ul className="guide-list">
        {guides.map(g => (
          <li key={g.id} onClick={() => onSelect(g.id)}>
            <strong>{g.title}</strong>
            <div className="muted">{g.hero}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
