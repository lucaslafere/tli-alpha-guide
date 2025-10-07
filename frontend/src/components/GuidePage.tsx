import axios from "  useEffect(() => {
    if (!guideId) return;
    axios
      .get<Guide>(`http://localhost:4001/api/guides/${guideId}`)
      .then((r: { data: Guide }) => setGuide(r.data))
      .catch(() => setGuide(null))
  }, [guideId]);;
import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

export default function GuidePage() {
  const { guideId } = useParams();rt axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function GuidePage({ id }: { id: string }) {
  type Item = { title: string; content: string; type?: string; open?: boolean };
  type Section = { id: string; title: string; items: Item[]; open?: boolean };
  type Guide = { id: string; title: string; hero: string; sections: Section[] };

  const [guide, setGuide] = useState<Guide | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadSection, setUploadSection] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    axios
      .get<Guide>(`http://localhost:4001/api/guides/${id}`)
      .then((r: { data: Guide }) => setGuide(r.data))
      .catch(() => setGuide(null));
  }, [id]);

  function toggleSection(secId: string) {
    setGuide((g: Guide | null) => {
      if (!g) return g;
      return {
        ...g,
        sections: g.sections.map((s) => (s.id === secId ? { ...s, open: !s.open } : s)),
      };
    });
  }

  function toggleAll() {
    setAllExpanded((prev) => !prev);
    setGuide((g) => {
      if (!g) return g;
      return {
        ...g,
        sections: g.sections.map((s) => ({
          ...s,
          open: !allExpanded,
          items: s.items.map((it) => ({ ...it, open: !allExpanded })),
        })),
      };
    });
  }

  function toggleItem(sectionId: string, itemIndex: number) {
    setGuide((g) => {
      if (!g) return g;
      return {
        ...g,
        sections: g.sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map((it, idx) =>
                  idx === itemIndex ? { ...it, open: !it.open } : it
                ),
              }
            : s
        ),
      };
    });
  }

  function save() {
    if (!guide) return;
    axios.put<Guide>(`http://localhost:4001/api/guides/${id}`, guide).then((r) => setGuide(r.data));
  }

  async function uploadImage() {
    if (!file || !guide) return;
    const fd = new FormData();
    fd.append('file', file);
    if (uploadSection) fd.append('sectionId', uploadSection);
    const resp = await axios.post(`http://localhost:4001/api/guides/${id}/uploads`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const { url, sectionId } = resp.data as { url: string; sectionId: string };
    // reflect change locally
    setGuide((g) =>
      g
        ? ({
            ...g,
            sections: g.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: [...(s.items || []), { title: file.name, content: url, type: 'image' }],
                  }
                : s
            ),
          } as Guide)
        : g
    );
    setFile(null);
  }

  if (!guide) return <div>Loading...</div>;

  return (
    <div className="guide-page">
      <div className="guide-header">
        <div>
          <h2>{guide.title}</h2>
          <div className="hero">{guide.hero}</div>
        </div>
        <div className="actions">
          <button onClick={() => setEditMode((e) => !e)} className="btn">
            {editMode ? 'Exit edit' : 'Edit'}
          </button>
          {editMode && (
            <button onClick={save} className="btn primary">
              Save
            </button>
          )}
          <button onClick={toggleAll} className="btn secondary">
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      <div className="sections">
        {guide.sections.map((s) => (
          <div key={s.id} className="section">
            <div
              className={`section-head ${s.open ? 'open' : ''}`}
              onClick={() => toggleSection(s.id)}
            >
              <h3>{s.title}</h3>
              <span className="chevron"></span>
            </div>
            {s.open && (
              <div className="section-body">
                {s.items.map((it: Item, idx: number) => (
                  <div key={idx} className="item">
                    <div
                      className={`item-head ${it.open ? 'open' : ''}`}
                      onClick={() => toggleItem(s.id, idx)}
                    >
                      <h4>{it.title}</h4>
                      <span className="chevron"></span>
                    </div>
                    {(editMode || it.open) && (
                      <div className="item-body">
                        {editMode ? (
                          <textarea
                            value={it.content}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGuide((g) =>
                                g
                                  ? ({
                                      ...g,
                                      sections: g.sections.map((ss) =>
                                        ss.id === s.id
                                          ? {
                                              ...ss,
                                              items: ss.items.map((x, i) =>
                                                i === idx ? { ...x, content: val } : x
                                              ),
                                            }
                                          : ss
                                      ),
                                    } as Guide)
                                  : g
                              );
                            }}
                          />
                        ) : it.type === 'image' ? (
                          // render images inline
                          // content stores the relative URL (/uploads/filename)
                          <img
                            src={it.content}
                            alt={it.title}
                            style={{ maxWidth: '100%', borderRadius: 6 }}
                          />
                        ) : (
                          <p>{it.content}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editMode && guide && (
        <div className="uploader">
          <h4>Upload image to section</h4>
          <select
            value={uploadSection || ''}
            onChange={(e) => setUploadSection(e.target.value || null)}
          >
            <option value="">-- choose section --</option>
            {guide.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          <button onClick={uploadImage} disabled={!file} className="btn primary">
            Upload
          </button>
        </div>
      )}
    </div>
  );
}
