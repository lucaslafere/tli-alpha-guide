import React, { useCallback, useState } from 'react';
import '../styles.css';

interface DragDropUploadProps {
  onUpload: (file: File) => Promise<{ url: string }>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  accept?: string;
  className?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onUpload,
  onSuccess,
  onError,
  accept = 'image/*',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith('image/')) {
        onError?.(new Error('Only image files are allowed'));
        return;
      }

      try {
        setIsUploading(true);
        const { url } = await onUpload(file);
        onSuccess?.(url);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Upload failed'));
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onSuccess, onError]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const file = files[0];
      try {
        setIsUploading(true);
        const { url } = await onUpload(file);
        onSuccess?.(url);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Upload failed'));
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onSuccess, onError]
  );

  return (
    <div
      className={`drag-drop-upload ${isDragging ? 'dragging' : ''} ${
        isUploading ? 'uploading' : ''
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload" className="upload-label">
        {isUploading ? (
          <span>Uploading...</span>
        ) : (
          <>
            <span>Drag and drop an image here</span>
            <span>or click to select a file</span>
          </>
        )}
      </label>
    </div>
  );
};
