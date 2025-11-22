import React, { useState, useRef, useEffect } from 'react';

interface VideoDropzoneProps {
  value: {
    source: 'upload' | 'url';
    name: string;
    size: number;
    mimeType: string;
    previewUrl?: string;
    file?: File | null;
  } | null;
  onChange: (asset: VideoDropzoneProps['value']) => void;
}

const humanFileSize = (size: number) => {
  if (!size) return '0 B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB'];
  return `${(size / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({ value, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [manualUrl, setManualUrl] = useState(value?.source === 'url' ? value.name : '');
  const inputId = useRef(`video-upload-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    setManualUrl(value?.source === 'url' ? value.name : '');
  }, [value]);

  useEffect(() => {
    return () => {
      if (value?.previewUrl && value.source === 'upload') {
        URL.revokeObjectURL(value.previewUrl);
      }
    };
  }, [value]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Lütfen video formatı seçin (mp4, webm, mov).');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      alert('Video 200MB sınırını aşmamalıdır.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onChange({
      source: 'upload',
      name: file.name,
      size: file.size,
      mimeType: file.type,
      previewUrl,
      file,
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600 hover:border-primary'
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        onClick={() => document.getElementById(inputId.current)?.click()}
      >
        <input
          id={inputId.current}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />
        <p className="font-semibold text-text-light dark:text-text-dark">Video yükle veya sürükle-bırak</p>
        <p className="text-xs text-subtext-light dark:text-subtext-dark">MP4, MOV ya da WebM · max 200MB</p>
        {value?.source === 'upload' && value.previewUrl && (
          <div className="mt-3 text-sm text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="font-semibold">{value.name}</p>
            <p className="text-xs text-subtext-light dark:text-subtext-dark">{humanFileSize(value.size)}</p>
            <video src={value.previewUrl} controls className="mt-2 rounded-lg" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Veya video bağlantısı ekle</label>
        <input
          type="url"
          value={manualUrl}
          placeholder="https://youtu.be/..."
          className="form-input w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm h-10 px-3"
          onChange={(e) => {
            setManualUrl(e.target.value);
            onChange(
              e.target.value
                ? {
                    source: 'url',
                    name: e.target.value,
                    size: 0,
                    mimeType: 'text/url',
                    file: null,
                    previewUrl: undefined,
                  }
                : null
            );
          }}
        />
        {value && (
          <button
            type="button"
            className="text-xs text-red-500 hover:text-red-600"
            onClick={() => {
              if (value?.previewUrl && value.source === 'upload') {
                URL.revokeObjectURL(value.previewUrl);
              }
              setManualUrl('');
              onChange(null);
            }}
          >
            Temizle
          </button>
        )}
      </div>
    </div>
  );
};
