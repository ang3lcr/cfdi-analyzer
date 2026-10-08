import React, { useState } from 'react';
import type { InvoiceParseError } from '../../types/invoice';
import { AlertCircle, ChevronDown, ChevronUp, X, FileWarning } from 'lucide-react';

interface ErrorListProps {
  errors: InvoiceParseError[];
  onDismissError: (index: number) => void;
  onClearErrors: () => void;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  onDismissError,
  onClearErrors,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (errors.length === 0) return null;

  return (
    <div
      className="card"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(114, 125, 115, 0.45)',
        borderRadius: '12px',
        marginBottom: '1.25rem',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(208, 221, 208, 0.4)',
          borderBottom: isExpanded ? '1px solid rgba(114, 125, 115, 0.25)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={18} color="#000000" />
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#000000' }}>
            {errors.length} archivo{errors.length > 1 ? 's' : ''} requiere{errors.length > 1 ? 'n' : ''} atención
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={15} /> Ocultar
              </>
            ) : (
              <>
                <ChevronDown size={15} /> Mostrar
              </>
            )}
          </button>

          <button
            className="btn btn-ghost"
            onClick={onClearErrors}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
            title="Descartar todas las alertas"
          >
            <X size={15} /> Descartar todas
          </button>
        </div>
      </div>

      {/* Errors list */}
      {isExpanded && (
        <div
          style={{
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          {errors.map((err, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(240, 240, 215, 0.35)',
                border: '1px solid rgba(114, 125, 115, 0.2)',
                borderRadius: '8px',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', minWidth: 0 }}>
                <FileWarning size={16} color="#727D73" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ wordBreak: 'break-word', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#000000' }}>{err.fileName}</strong>
                    {err.stage && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: 'rgba(114, 125, 115, 0.2)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          color: '#2b332c',
                          fontWeight: 600,
                        }}
                      >
                        Etapa: {err.stage}
                      </span>
                    )}
                    {err.errorType && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(215, 120, 110, 0.15)',
                          color: '#7a201b',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {err.errorType}
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#444444', marginTop: '3px' }}>
                    → {err.reason}
                  </div>
                  {err.errorDetail && (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '0.75rem',
                        color: '#666666',
                        fontFamily: 'monospace',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(114, 125, 115, 0.15)',
                        maxWidth: '100%',
                        overflowX: 'auto',
                      }}
                    >
                      {err.errorDetail}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDismissError(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#727D73',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
                title="Descartar esta alerta"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
