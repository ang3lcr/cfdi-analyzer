import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const isAll = pageSize >= totalItems && totalItems > 0;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = isAll ? totalItems : Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid rgba(114, 125, 115, 0.2)',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
      }}
    >
      {/* Items count summary */}
      <div>
        Mostrando <strong style={{ color: '#000000' }}>{startItem}</strong> a{' '}
        <strong style={{ color: '#000000' }}>{endItem}</strong> de{' '}
        <strong style={{ color: '#000000' }}>{totalItems}</strong> registros
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Page size selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span>Filas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={10000}>Todas</option>
          </select>
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            className="btn btn-ghost"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="Primera página"
            style={{ padding: '0.35rem', minWidth: '30px' }}
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Página anterior"
            style={{ padding: '0.35rem', minWidth: '30px' }}
          >
            <ChevronLeft size={16} />
          </button>

          <span
            style={{
              padding: '0.2rem 0.6rem',
              fontWeight: 600,
              color: '#000000',
            }}
          >
            Pág. {currentPage} de {totalPages}
          </span>

          <button
            className="btn btn-ghost"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Página siguiente"
            style={{ padding: '0.35rem', minWidth: '30px' }}
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Última página"
            style={{ padding: '0.35rem', minWidth: '30px' }}
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
