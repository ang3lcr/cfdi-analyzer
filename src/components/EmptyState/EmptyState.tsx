import React from 'react';
import { FileUp, Sparkles, FolderArchive } from 'lucide-react';

interface EmptyStateProps {
  onLoadSamples: () => void;
  onImportClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onLoadSamples,
  onImportClick,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        border: '1px dashed var(--border-medium)',
        borderRadius: '16px',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(208, 221, 208, 0.5)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          border: '1px solid rgba(114, 125, 115, 0.3)',
        }}
      >
        <FolderArchive size={36} color="#000000" />
      </div>

      <h3
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: '#000000',
          marginBottom: '0.5rem',
        }}
      >
        No hay facturas cargadas
      </h3>

      <p
        style={{
          fontSize: '0.92rem',
          color: 'var(--text-secondary)',
          maxWidth: '460px',
          margin: '0 auto 1.75rem',
          lineHeight: 1.5,
        }}
      >
        Arrastra tus archivos XML en la zona superior o selecciona archivos desde tu equipo para comenzar a analizar tus comprobantes fiscales.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        <button className="btn btn-primary" onClick={onImportClick}>
          <FileUp size={16} />
          <span>Seleccionar archivos XML</span>
        </button>

        <button className="btn btn-secondary" onClick={onLoadSamples}>
          <Sparkles size={16} color="#000000" />
          <span>Cargar comprobantes de ejemplo</span>
        </button>
      </div>
    </div>
  );
};
