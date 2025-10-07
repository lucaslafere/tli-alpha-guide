import React, { useCallback } from 'react';
import { DragDropUpload } from './DragDropUpload';
import { RichTextEditor } from './RichTextEditor';

interface Item {
  title: string;
  content: string;
  type?: string;
  open?: boolean;
}

interface SubSectionProps {
  title: string;
  content: string;
  open?: boolean;
  type?: string;
  onToggle: () => void;
  onUpdate: (title: string, content: string) => void;
  onDelete?: () => void;
  editMode: boolean;
}

export const SubSection: React.FC<SubSectionProps> = ({
  title,
  content,
  open,
  type,
  onToggle,
  onUpdate,
  onDelete,
  editMode,
}) => {
  return (
    <div className="item">
      <div className={`item-head ${open ? 'open' : ''}`} onClick={onToggle}>
        {editMode ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate(e.target.value, content)}
            onClick={(e) => e.stopPropagation()}
            className="item-title-input"
          />
        ) : (
          <h4>{title}</h4>
        )}
        <div className="item-controls">
          {editMode && onDelete && (
            <button
              className="btn icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              ×
            </button>
          )}
          <span className="chevron"></span>
        </div>
      </div>
      {(editMode || open) && (
        <div className="item-body">
          {type === 'image' ? (
            <img src={content} alt={title} style={{ maxWidth: '100%', borderRadius: 6 }} />
          ) : editMode ? (
            <RichTextEditor
              content={content}
              onChange={(newContent) => onUpdate(title, newContent)}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      )}
    </div>
  );
};
