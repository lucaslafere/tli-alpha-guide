import React from 'react';

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
      <div className={`item-head ${open ? 'open' : ''}`}>
        <div className="item-title" onClick={onToggle}>
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
        </div>
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
          <span className="chevron" onClick={onToggle}></span>
        </div>
      </div>
      {(editMode || open) && (
        <div className="item-body">
          {type === 'image' ? (
            <img src={content} alt={title} style={{ maxWidth: '100%', borderRadius: 6 }} />
          ) : editMode ? (
            <div className="editor-container">
              <div
                dangerouslySetInnerHTML={{ __html: content }}
                contentEditable
                onBlur={(e) => onUpdate(title, e.currentTarget.innerHTML)}
                style={{ outline: 'none' }}
              />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      )}
    </div>
  );
};
