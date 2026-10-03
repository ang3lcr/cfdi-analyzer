import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode2, CheckCircle2 } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  isProcessing: boolean;
  progress: {
    current: number;
    total: number;
    fileName?: string;
  };
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  isProcessing,
  progress,
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!isProcessing) fileInputRef.current?.click();
      }}
      style={{
        position: 'relative',
        cursor: isProcessing ? 'wait' : 'pointer',
        border: `2px dashed ${
          isDragOver
            ? 'var(--text-primary)'
            : 'rgba(114, 125, 115, 0.4)'
        }`,
        backgroundColor: isDragOver
          ? 'rgba(208, 221, 208, 0.5)'
          : compact
          ? '#FFFFFF'
          : 'rgba(208, 221, 208, 0.25)',
        borderRadius: '16px',
        padding: compact ? '1.25rem 1.5rem' : '2.5rem 2rem',
        textAlign: 'center',
        transition: 'all 0.22s ease-in-out',
        transform: isDragOver ? 'scale(1.008)' : 'scale(1)',
        boxShadow: isDragOver
          ? '0 10px 25px -5px rgba(114, 125, 115, 0.2)'
          : 'var(--shadow-subtle)',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".xml,text/xml,application/xml"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={isProcessing}
      />

      {isProcessing ? (
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.8rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(170, 185, 154, 0.35)',
              marginBottom: '0.85rem',
              animation: 'spin 2s linear infinite',
            }}
          >
            <UploadCloud size={compact ? 28 : 36} color="#000000" />
          </div>

          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#000000',
              marginBottom: '0.3rem',
            }}
          >
            Procesando facturas... ({progress.current} de {progress.total})
          </h3>

          {progress.fileName && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              Leyendo: {progress.fileName}
            </p>
          )}

          {/* Progress bar */}
          <div
            style={{
              height: '8px',
              backgroundColor: 'rgba(114, 125, 115, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '0.5rem 0',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percent}%`,
                backgroundColor: 'var(--accent-primary)',
                transition: 'width 0.15s ease-out',
              }}
            />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            {percent}% completado
          </span>
        </div>
      ) : (
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: compact ? '48px' : '64px',
              height: compact ? '48px' : '64px',
              borderRadius: '50%',
              backgroundColor: isDragOver
                ? 'var(--accent-primary)'
                : 'rgba(208, 221, 208, 0.55)',
              border: '1px solid rgba(114, 125, 115, 0.3)',
              marginBottom: compact ? '0.6rem' : '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <FileCode2 size={compact ? 24 : 32} color="#000000" />
          </div>

          <h3
            style={{
              fontSize: compact ? '1rem' : '1.25rem',
              fontWeight: 700,
              color: '#000000',
              marginBottom: '0.35rem',
            }}
          >
            {isDragOver
              ? 'Suelta los archivos aquí para importar'
              : 'Arrastra tus archivos XML aquí'}
          </h3>

          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              marginBottom: compact ? '0.75rem' : '1.15rem',
            }}
          >
            o{' '}
            <span
              style={{
                color: '#000000',
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              Seleccionar archivos
            </span>{' '}
            desde tu dispositivo (N archivos simultáneos)
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="#727D73" /> Compatible con CFDI 4.0 & 3.3
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="#727D73" /> Validación automática de duplicados
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} color="#727D73" /> 100% privado en navegador
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
