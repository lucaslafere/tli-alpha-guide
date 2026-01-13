import React, { useCallback, useState } from 'react';
import { DragDropUpload } from './DragDropUpload';
import { SubSection } from './SubSection';

interface Item {
  title: string;
  content: string;
  type?: string;
  open?: boolean;
}

interface SectionProps {
  id: string;
  title: string;
  items: Item[];
  open?: boolean;
  editMode: boolean;
  guideId: string;
  onToggle: () => void;
  onUpdateItems: (items: Item[]) => void;
}

export const Section: React.FC<SectionProps> = ({
  id,
  title,
  items,
  open,
  editMode,
  guideId,
  onToggle,
  onUpdateItems,
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingIndex(index);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      if (draggingIndex === null) return;

      const newItems = [...items];
      const draggedItem = newItems[draggingIndex];
      newItems.splice(draggingIndex, 1);
      newItems.splice(index, 0, draggedItem);

      onUpdateItems(newItems);
      setDraggingIndex(index);
    },
    [draggingIndex, items, onUpdateItems]
  );

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const addNewSubsection = () => {
    const newItem: Item = {
      title: 'New Act',
      content: '',
      open: true,
    };
    onUpdateItems([...items, newItem]);
  };

  return (
    <div className={`section ${editMode ? 'editing' : ''}`}>
      <div className={`section-head ${open ? 'open' : ''}`} onClick={onToggle}>
        {editMode ? (
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const event = new CustomEvent('sectionTitleChange', {
                detail: { id, title: e.target.value },
              });
              window.dispatchEvent(event);
            }}
            onClick={(e) => e.stopPropagation()}
            className="section-title-input"
          />
        ) : (
          <h3>{title}</h3>
        )}
        <div className="section-controls">
          {editMode && (
            <button
              className="btn icon"
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent('sectionDelete', {
                  detail: { id },
                });
                window.dispatchEvent(event);
              }}
            >
              ×
            </button>
          )}
          <span className="chevron"></span>
        </div>
      </div>
      {open && (
        <div className="section-body">
          {editMode && (
            <DragDropUpload
              className="section-upload"
              onUpload={async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('sectionId', id);

                const resp = await fetch(`http://localhost:4001/api/guides/${guideId}/uploads`, {
                  method: 'POST',
                  body: formData,
                });

                if (!resp.ok) throw new Error('Upload failed');
                return resp.json();
              }}
              onSuccess={(url) => {
                const newItem: Item = {
                  title: 'Image',
                  content: url,
                  type: 'image',
                  open: true,
                };
                onUpdateItems([...items, newItem]);
              }}
            />
          )}

          <div className="section-items">
            {items.map((item, index) => (
              <div
                key={index}
                className={`section-item ${draggingIndex === index ? 'dragging' : ''}`}
              >
                {editMode && (
                  <div className="drag-handle-area">
                    <div
                      className="drag-handle"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => e.stopPropagation()}
                      role="button"
                      aria-label="Drag item"
                    >
                      ⋮⋮
                    </div>
                  </div>
                )}
                <SubSection
                  title={item.title}
                  content={item.content}
                  type={item.type}
                  open={item.open}
                  editMode={editMode}
                  onToggle={() => {
                    const newItems = [...items];
                    newItems[index] = { ...item, open: !item.open };
                    onUpdateItems(newItems);
                  }}
                  onUpdate={(title, content) => {
                    const newItems = [...items];
                    newItems[index] = { ...item, title, content };
                    onUpdateItems(newItems);
                  }}
                  onDelete={() => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    onUpdateItems(newItems);
                  }}
                />
              </div>
            ))}
          </div>

          {editMode && (
            <button className="btn secondary add-subsection" onClick={addNewSubsection}>
              + Add new Act
            </button>
          )}
        </div>
      )}
    </div>
  );
};
