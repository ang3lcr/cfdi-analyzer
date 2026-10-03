import React from 'react';
import {
  FileSpreadsheet,
  Upload,
  Trash2,
  ShieldCheck,
  Sparkles,
  FileCode,
} from 'lucide-react';

interface HeaderProps {
  invoiceCount: number;
  onImportClick: () => void;
  onExportExcel: () => void;
  onClearClick: () => void;
  onLoadSamples: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  invoiceCount,
  onImportClick,
  onExportExcel,
  onClearClick,
  onLoadSamples,
  isProcessing,
}) => {
  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(114, 125, 115, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="container" style={{ padding: '0.9rem 1.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(114, 125, 115, 0.4)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
              }}
            >
              <FileCode size={24} color="#000000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#000000',
                    lineHeight: 1.2,
                  }}
                >
                  CFDI Analyzer
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(208, 221, 208, 0.6)',
                    color: '#000000',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(114, 125, 115, 0.3)',
                  }}
                >
                  v4.0 & 3.3
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  marginTop: '1px',
                }}
              >
                Importa, consulta y analiza tus facturas XML
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {/* Quick Sample Button */}
            <button
              className="btn btn-secondary"
              onClick={onLoadSamples}
              disabled={isProcessing}
              title="Cargar 5 comprobantes XML de demostración"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
            >
              <Sparkles size={16} color="#000000" />
              <span>Ejemplos</span>
            </button>

            {/* Import XML Button */}
            <button
              className="btn btn-primary"
              onClick={onImportClick}
              disabled={isProcessing}
              style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            >
              <Upload size={16} />
              <span>Importar XML</span>
            </button>

            {/* Export to Excel Button */}
            <button
              className="btn btn-accent"
              onClick={onExportExcel}
              disabled={invoiceCount === 0 || isProcessing}
              title={invoiceCount === 0 ? 'Carga facturas para exportar' : 'Exportar a Excel (.xlsx)'}
              style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            >
              <FileSpreadsheet size={16} color="#000000" />
              <span>Exportar Excel</span>
              {invoiceCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#000000',
                    color: '#F0F0D7',
                    borderRadius: '12px',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginLeft: '0.2rem',
                  }}
                >
                  {invoiceCount}
                </span>
              )}
            </button>

            {/* Clear Button */}
            <button
              className="btn btn-ghost"
              onClick={onClearClick}
              disabled={invoiceCount === 0 || isProcessing}
              title="Limpiar todos los registros importados"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
            >
              <Trash2 size={16} />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Privacy banner notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '0.5rem',
            paddingTop: '0.4rem',
            borderTop: '1px solid rgba(208, 221, 208, 0.4)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <ShieldCheck size={14} color="#727D73" />
          <span>
            <strong>Privacidad garantizada:</strong> Tus archivos se procesan exclusivamente de forma local en tu navegador y <strong>no se envían a ningún servidor</strong>.
          </span>
        </div>
      </div>
    </header>
  );
};
