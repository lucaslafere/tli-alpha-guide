import React, { useCallback, useState } from 'react';
import { DragDropUpload } from './DragDropUpload';
import { RichTextEditor } from './RichTextEditor';

interface Item {
  title: string;
  content: string;
  type?: string;
  open?: boolean;
}

interface SectionContentProps {
  sectionId: string;
  items: Item[];
  editMode: boolean;
  guideId: string;
  onUpdateItems: (items: Item[]) => void;
}

export const SectionContent: React.FC<SectionContentProps> = ({
  sectionId,
  items,
  editMode,
  guideId,
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

  return (
    <div className="section-content">
      {editMode && (
        <DragDropUpload
          className="section-upload"
          onUpload={async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sectionId', sectionId);

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
            draggable={editMode}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`section-item ${draggingIndex === index ? 'dragging' : ''}`}
          >
            {editMode && (
              <div className="item-controls">
                <button
                  className="btn icon"
                  onClick={() => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    onUpdateItems(newItems);
                  }}
                >
                  ×
                </button>
                <div className="drag-handle">⋮⋮</div>
              </div>
            )}
            {item.type === 'image' ? (
              <div className="item-image">
                <img src={item.content} alt={item.title} />
                {editMode && (
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index] = { ...item, title: e.target.value };
                      onUpdateItems(newItems);
                    }}
                    placeholder="Image title"
                    className="image-title-input"
                  />
                )}
              </div>
            ) : (
              <div className="item-text">
                {editMode ? (
                  <RichTextEditor
                    content={item.content}
                    onChange={(content) => {
                      const newItems = [...items];
                      newItems[index] = { ...item, content };
                      onUpdateItems(newItems);
                    }}
                  />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
