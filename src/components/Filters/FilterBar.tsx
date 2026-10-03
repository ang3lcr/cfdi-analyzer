import React from 'react';
import type { InvoiceFilters } from '../../types/invoice';
import {
  Search,
  X,
  Columns,
  RotateCcw,
} from 'lucide-react';

interface FilterBarProps {
  filters: InvoiceFilters;
  onFilterChange: (filters: InvoiceFilters) => void;
  onOpenColumnSelector: () => void;
  filteredCount: number;
  totalCount: number;
  availableCurrencies: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onOpenColumnSelector,
  filteredCount,
  totalCount,
  availableCurrencies,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchTerm: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, voucherType: e.target.value });
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, paymentMethod: e.target.value });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, currency: e.target.value });
  };

  const handleDateStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, dateStart: e.target.value });
  };

  const handleDateEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, dateEnd: e.target.value });
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchTerm: '',
      voucherType: '',
      dateStart: '',
      dateEnd: '',
      paymentMethod: '',
      currency: '',
      emitterRfc: '',
      receiverRfc: '',
    });
  };

  const hasActiveFilters =
    Boolean(filters.searchTerm) ||
    Boolean(filters.voucherType) ||
    Boolean(filters.paymentMethod) ||
    Boolean(filters.currency) ||
    Boolean(filters.dateStart) ||
    Boolean(filters.dateEnd);

  return (
    <div
      className="card"
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.85rem',
        }}
      >
        {/* Global Search */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 280px',
            minWidth: '240px',
          }}
        >
          <Search
            size={16}
            color="#727D73"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por UUID, RFC, razón social, folio o concepto..."
            style={{
              width: '100%',
              padding: '0.55rem 2rem 0.55rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#000000';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-medium)';
            }}
          />
          {filters.searchTerm && (
            <button
              onClick={() => onFilterChange({ ...filters, searchTerm: '' })}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#727D73',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Tipo de Comprobante */}
          <select
            value={filters.voucherType}
            onChange={handleTypeChange}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontSize: '0.82rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="">Tipo: Todos</option>
            <option value="I">Ingreso (I)</option>
            <option value="E">Egreso (E)</option>
            <option value="P">Pago (P)</option>
            <option value="N">Nómina (N)</option>
            <option value="T">Traslado (T)</option>
          </select>

          {/* Método de Pago */}
          <select
            value={filters.paymentMethod}
            onChange={handleMethodChange}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontSize: '0.82rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="">Método: Todos</option>
            <option value="PUE">PUE (Una exhibición)</option>
            <option value="PPD">PPD (Parcialidades/Diferido)</option>
          </select>

          {/* Moneda */}
          {availableCurrencies.length > 1 && (
            <select
              value={filters.currency}
              onChange={handleCurrencyChange}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: '0.82rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              <option value="">Moneda: Todas</option>
              {availableCurrencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          )}

          {/* Fecha Inicio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>De:</span>
            <input
              type="date"
              value={filters.dateStart}
              onChange={handleDateStartChange}
              style={{
                padding: '0.45rem 0.55rem',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Fecha Fin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>A:</span>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={handleDateEndChange}
              style={{
                padding: '0.45rem 0.55rem',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              className="btn btn-ghost"
              onClick={handleResetFilters}
              title="Restablecer todos los filtros"
              style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem' }}
            >
              <RotateCcw size={14} />
              <span>Limpiar filtros</span>
            </button>
          )}

          {/* Columns Selector Button */}
          <button
            className="btn btn-secondary"
            onClick={onOpenColumnSelector}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            title="Personalizar columnas visibles"
          >
            <Columns size={15} color="#000000" />
            <span>Columnas</span>
          </button>
        </div>
      </div>

      {/* Filter status row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.65rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(114, 125, 115, 0.15)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div>
          Mostrando <strong>{filteredCount}</strong> de <strong>{totalCount}</strong> facturas
          {hasActiveFilters && ' (con filtros activos)'}
        </div>
        {hasActiveFilters && (
          <span style={{ fontStyle: 'italic' }}>
            Filtros aplicados para refinar resultados
          </span>
        )}
      </div>
    </div>
  );
};
