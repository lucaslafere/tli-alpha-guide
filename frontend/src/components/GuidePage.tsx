import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Section } from './Section';

type Item = { title: string; content: string; type?: string; open?: boolean };
type Section = { id: string; title: string; items: Item[]; open?: boolean };
type Guide = { id: string; title: string; hero: string; sections: Section[] };

export default function GuidePage() {
  const { guideId } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null);
  // States for guide editing
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    if (!guideId) return;

    axios
      .get<Guide>(`http://localhost:4001/api/guides/${guideId}`)
      .then((r) => setGuide(r.data))
      .catch(() => setGuide(null));

    // Add handlers for section title changes and deletion
    const handleSectionTitleChange = (e: any) => {
      const { id, title } = e.detail;
      setGuide((g) =>
        g
          ? {
              ...g,
              sections: g.sections.map((s) =>
                s.id === id
                  ? {
                      ...s,
                      title,
                    }
                  : s
              ),
            }
          : g
      );
    };

    const handleSectionDelete = (e: any) => {
      const { id } = e.detail;
      setGuide((g) =>
        g
          ? {
              ...g,
              sections: g.sections.filter((s) => s.id !== id),
            }
          : g
      );
    };

    window.addEventListener('sectionTitleChange', handleSectionTitleChange);
    window.addEventListener('sectionDelete', handleSectionDelete);

    return () => {
      window.removeEventListener('sectionTitleChange', handleSectionTitleChange);
      window.removeEventListener('sectionDelete', handleSectionDelete);
    };
  }, [guideId]);

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

  function save() {
    if (!guide || !guideId) return;
    axios
      .put<Guide>(`http://localhost:4001/api/guides/${guideId}`, guide)
      .then((r) => setGuide(r.data));
  }

  const handleSectionDragStart = (index: number) => {
    setDraggingSectionIndex(index);
  };

  const handleSectionDragOver = (index: number) => {
    if (draggingSectionIndex === null) return;
    setGuide((g) => {
      if (!g) return g;
      const newSections = [...g.sections];
      const dragged = newSections[draggingSectionIndex];
      newSections.splice(draggingSectionIndex, 1);
      newSections.splice(index, 0, dragged);
      return {
        ...g,
        sections: newSections,
      };
    });
    setDraggingSectionIndex(index);
  };

  const handleSectionDragEnd = () => {
    setDraggingSectionIndex(null);
  };

  // Save guide data to server

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
        {guide.sections.map((s, idx) => (
          <Section
            key={s.id}
            id={s.id}
            index={idx}
            title={s.title}
            items={s.items}
            open={s.open}
            editMode={editMode}
            guideId={guideId || ''}
            onSectionDragStart={handleSectionDragStart}
            onSectionDragOver={handleSectionDragOver}
            onSectionDragEnd={handleSectionDragEnd}
            onToggle={() => toggleSection(s.id)}
            onUpdateItems={(items) => {
              setGuide((g) =>
                g
                  ? {
                      ...g,
                      sections: g.sections.map((ss) =>
                        ss.id === s.id
                          ? {
                              ...ss,
                              items,
                            }
                          : ss
                      ),
                    }
                  : g
              );
            }}
          />
        ))}

        {editMode && (
          <button
            className="btn secondary add-section"
            onClick={() => {
              setGuide((g) =>
                g
                  ? {
                      ...g,
                      sections: [
                        ...g.sections,
                        {
                          id: `section_${Date.now()}`,
                          title: 'New Section',
                          items: [],
                          open: true,
                        },
                      ],
                    }
                  : g
              );
            }}
          >
            + Add new section
          </button>
        )}
      </div>
    </div>
  );
}
