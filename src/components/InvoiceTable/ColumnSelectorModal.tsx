import React from 'react';
import type { TableColumnConfig } from '../../types/invoice';
import { X, CheckSquare, RotateCcw } from 'lucide-react';

interface ColumnSelectorModalProps {
  isOpen: boolean;
  columns: TableColumnConfig[];
  onToggleColumn: (columnId: string) => void;
  onResetDefaults: () => void;
  onSelectAll: () => void;
  onClose: () => void;
}

export const ColumnSelectorModal: React.FC<ColumnSelectorModalProps> = ({
  isOpen,
  columns,
  onToggleColumn,
  onResetDefaults,
  onSelectAll,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid rgba(114, 125, 115, 0.25)',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#000000' }}>
              Personalizar columnas visibles
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Selecciona las columnas que deseas mostrar en la tabla principal
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#727D73',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            fontSize: '0.8rem',
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={onSelectAll}
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
          >
            <CheckSquare size={14} /> Seleccionar todas
          </button>
          <button
            className="btn btn-ghost"
            onClick={onResetDefaults}
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
          >
            <RotateCcw size={14} /> Restablecer predeterminadas
          </button>
        </div>

        {/* Column items list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.5rem',
            padding: '0.25rem 0',
          }}
        >
          {columns.map((col) => (
            <label
              key={col.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: col.visible
                  ? 'rgba(208, 221, 208, 0.45)'
                  : 'rgba(114, 125, 115, 0.06)',
                border: `1px solid ${
                  col.visible
                    ? 'rgba(114, 125, 115, 0.4)'
                    : 'rgba(114, 125, 115, 0.15)'
                }`,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={col.visible}
                onChange={() => onToggleColumn(col.id)}
                style={{
                  accentColor: '#000000',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: col.visible ? 600 : 400,
                  color: col.visible ? '#000000' : 'var(--text-secondary)',
                }}
              >
                {col.label}
              </span>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid rgba(114, 125, 115, 0.25)',
          }}
        >
          <button className="btn btn-primary" onClick={onClose}>
            Guardar y cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
