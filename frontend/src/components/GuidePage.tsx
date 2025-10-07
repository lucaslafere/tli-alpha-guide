import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function GuidePage({ id }: { id: string }) {
  const [guide, setGuide] = useState<any | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    axios.get(`http://localhost:4001/api/guides/${id}`).then(r => setGuide(r.data)).catch(() => setGuide(null))
  }, [id])

  function toggleSection(secId: string) {
    setGuide((g: any) => ({
      ...g,
      sections: g.sections.map((s: any) => (s.id === secId ? { ...s, open: !s.open } : s))
    }))
  }

  function save() {
    if (!guide) return
    axios.put(`http://localhost:4001/api/guides/${id}`, guide).then(r => setGuide(r.data))
  }

  if (!guide) return <div>Loading...</div>

  return (
    <div className="guide-page">
      <h2>{guide.title}</h2>
      <div className="hero">{guide.hero}</div>
      <div className="actions">
        <button onClick={() => setEditMode(e => !e)}>{editMode ? 'Exit edit' : 'Edit'}</button>
        {editMode && <button onClick={save}>Save</button>}
      </div>

      <div className="sections">
        {guide.sections.map((s: any) => (
          <div key={s.id} className="section">
            <div className="section-head" onClick={() => toggleSection(s.id)}>
              <h3>{s.title}</h3>
            </div>
            {s.open && (
              <div className="section-body">
                {s.items.map((it: any, idx: number) => (
                  <div key={idx} className="item">
                    <h4>{it.title}</h4>
                    {editMode ? (
                      <textarea value={it.content} onChange={e => {
                        const val = e.target.value
                        setGuide((g: any) => ({
                          ...g,
                          sections: g.sections.map((ss: any) => ss.id === s.id ? { ...ss, items: ss.items.map((x: any, i: number) => i === idx ? { ...x, content: val } : x) } : ss)
                        }))
                      }} />
                    ) : (
                      <p>{it.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
