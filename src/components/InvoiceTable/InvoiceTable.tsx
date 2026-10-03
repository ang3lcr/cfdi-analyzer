import React, { useMemo } from 'react';
import type {
  Invoice,
  SortConfig,
  TableColumnConfig,
} from '../../types/invoice';
import { formatCurrency } from '../../utils/currency';
import { formatDateShort } from '../../utils/dates';
import { Badge } from '../Common/Badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Trash2,
  Copy,
} from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
  columns: TableColumnConfig[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  selectedIds: Set<string>;
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onCopyUuid: (uuid: string) => void;
  onDeleteSelected: () => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  columns,
  sortConfig,
  onSort,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onViewInvoice,
  onDeleteInvoice,
  onCopyUuid,
  onDeleteSelected,
}) => {
  const visibleColumns = useMemo(
    () => columns.filter((c) => c.visible),
    [columns]
  );

  const allSelected =
    invoices.length > 0 && invoices.every((inv) => selectedIds.has(inv.id));
  const someSelected =
    invoices.some((inv) => selectedIds.has(inv.id)) && !allSelected;

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={13} color="#727D73" style={{ opacity: 0.6 }} />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={13} color="#000000" />
    ) : (
      <ArrowDown size={13} color="#000000" />
    );
  };

  const renderCellContent = (inv: Invoice, columnId: string) => {
    switch (columnId) {
      case 'voucherType':
        return <Badge type={inv.voucherType} label={inv.voucherTypeDesc} size="sm" />;
      case 'uuid':
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: '#000000',
              fontWeight: 600,
            }}
          >
            <span>{inv.uuid.slice(0, 13)}...</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyUuid(inv.uuid);
              }}
              title="Copiar UUID completo"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                color: '#727D73',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Copy size={13} />
            </button>
          </div>
        );
      case 'fileName':
        return (
          <span
            title={inv.fileName}
            style={{
              maxWidth: '160px',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.8rem',
            }}
          >
            {inv.fileName}
          </span>
        );
      case 'serie':
        return inv.serie || '—';
      case 'folio':
        return inv.folio || '—';
      case 'issueDate':
        return formatDateShort(inv.issueDate);
      case 'certificationDate':
        return formatDateShort(inv.certificationDate || inv.fiscalStamp?.stampDate);
      case 'emitterRfc':
        return <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.emitter.rfc}</span>;
      case 'emitterName':
        return (
          <span
            title={inv.emitter.name}
            style={{
              maxWidth: '180px',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {inv.emitter.name}
          </span>
        );
      case 'emitterRegime':
        return inv.emitter.taxRegime || '—';
      case 'receiverRfc':
        return <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.receiver.rfc}</span>;
      case 'receiverName':
        return (
          <span
            title={inv.receiver.name}
            style={{
              maxWidth: '180px',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {inv.receiver.name}
          </span>
        );
      case 'receiverRegime':
        return inv.receiver.taxRegime || '—';
      case 'receiverPostal':
        return inv.receiver.postalCode || '—';
      case 'cfdiUse':
        return inv.receiver.cfdiUse || '—';
      case 'paymentMethod':
        return inv.payment.method || '—';
      case 'paymentForm':
        return inv.payment.form || '—';
      case 'currency':
        return inv.payment.currency || 'MXN';
      case 'exchangeRate':
        return inv.payment.exchangeRate;
      case 'subtotal':
        return formatCurrency(inv.amounts.subtotal, inv.payment.currency);
      case 'discount':
        return inv.amounts.discount > 0
          ? formatCurrency(inv.amounts.discount, inv.payment.currency)
          : '—';
      case 'iva':
        return formatCurrency(inv.amounts.transferredIVA, inv.payment.currency);
      case 'otherTaxes':
        return inv.amounts.otherTransferred > 0
          ? formatCurrency(inv.amounts.otherTransferred, inv.payment.currency)
          : '—';
      case 'retainedTaxes':
        return inv.amounts.retainedTaxes > 0
          ? formatCurrency(inv.amounts.retainedTaxes, inv.payment.currency)
          : '—';
      case 'total':
        return (
          <strong style={{ color: '#000000', fontWeight: 700 }}>
            {formatCurrency(inv.amounts.total, inv.payment.currency, true)}
          </strong>
        );
      case 'conceptsSummary':
        return (
          <span
            title={inv.concepts[0]?.description || ''}
            style={{
              maxWidth: '180px',
              display: 'inline-block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            {inv.concepts.length} concepto{inv.concepts.length !== 1 ? 's' : ''}:{' '}
            {inv.concepts[0]?.description || ''}
          </span>
        );
      case 'expeditionPlace':
        return inv.expeditionPlace || '—';
      case 'exportation':
        return inv.exportation || '—';
      case 'version':
        return inv.version;
      default:
        return '—';
    }
  };

  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        border: '1px solid var(--border-medium)',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Batch actions bar if rows are selected */}
      {selectedIds.size > 0 && (
        <div
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: 'rgba(208, 221, 208, 0.45)',
            borderBottom: '1px solid rgba(114, 125, 115, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.84rem',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 600, color: '#000000' }}>
              {selectedIds.size} factura{selectedIds.size > 1 ? 's' : ''} seleccionada{selectedIds.size > 1 ? 's' : ''}
            </span>
          </div>

          <button
            className="btn btn-secondary"
            onClick={onDeleteSelected}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              color: '#000000',
              border: '1px solid rgba(114, 125, 115, 0.4)',
            }}
          >
            <Trash2 size={14} />
            <span>Eliminar seleccionadas</span>
          </button>
        </div>
      )}

      {/* Main Table with sticky header and horizontal scroll */}
      <div style={{ overflowX: 'auto', maxHeight: '68vh' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.84rem',
          }}
        >
          {/* Header */}
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'var(--surface-secondary)',
              borderBottom: '2px solid rgba(114, 125, 115, 0.35)',
            }}
          >
            <tr>
              {/* Checkbox column */}
              <th
                style={{
                  padding: '0.75rem 0.65rem 0.75rem 1rem',
                  width: '40px',
                  textAlign: 'center',
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  style={{
                    accentColor: '#000000',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
              </th>

              {/* Dynamic Columns */}
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  onClick={() => onSort(col.id)}
                  style={{
                    padding: '0.75rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#000000',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid rgba(114, 125, 115, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{col.label}</span>
                    {renderSortIcon(col.id)}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
              <th
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#000000',
                  textAlign: 'center',
                  width: '90px',
                  position: 'sticky',
                  right: 0,
                  backgroundColor: 'var(--surface-secondary)',
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {invoices.map((inv, idx) => {
              const isSelected = selectedIds.has(inv.id);
              return (
                <tr
                  key={inv.id}
                  onClick={() => onViewInvoice(inv)}
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(208, 221, 208, 0.35)'
                      : idx % 2 === 0
                      ? '#FFFFFF'
                      : 'rgba(240, 240, 215, 0.25)',
                    borderBottom: '1px solid rgba(114, 125, 115, 0.15)',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(208, 221, 208, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor =
                        idx % 2 === 0 ? '#FFFFFF' : 'rgba(240, 240, 215, 0.25)';
                    }
                  }}
                >
                  {/* Row Checkbox */}
                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectRow(inv.id);
                    }}
                    style={{
                      padding: '0.65rem 0.65rem 0.65rem 1rem',
                      textAlign: 'center',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRow(inv.id)}
                      style={{
                        accentColor: '#000000',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                  </td>

                  {/* Dynamic Visible Cells */}
                  {visibleColumns.map((col) => (
                    <td
                      key={col.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        whiteSpace: 'nowrap',
                        color: '#000000',
                        borderRight: '1px solid rgba(114, 125, 115, 0.08)',
                      }}
                    >
                      {renderCellContent(inv, col.id)}
                    </td>
                  ))}

                  {/* Actions Buttons */}
                  <td
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '0.55rem 0.75rem',
                      textAlign: 'center',
                      position: 'sticky',
                      right: 0,
                      backgroundColor: isSelected
                        ? 'rgba(208, 221, 208, 0.5)'
                        : '#FFFFFF',
                      boxShadow: '-3px 0 6px -2px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <button
                        onClick={() => onViewInvoice(inv)}
                        title="Ver detalle del CFDI"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#000000',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => onDeleteInvoice(inv.id)}
                        title="Eliminar comprobante"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#727D73',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
