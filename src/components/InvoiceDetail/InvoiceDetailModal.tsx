import React, { useState } from 'react';
import type { Invoice } from '../../types/invoice';
import { formatCurrency, formatRate } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Badge } from '../Common/Badge';
import {
  X,
  Copy,
  Check,
  FileText,
  User,
  Building,
  Package,
  Percent,
  Award,
  Code2,
  CreditCard,
  Download,
} from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onCopyUuid: (uuid: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  onClose,
  onCopyUuid,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'conceptos' | 'impuestos' | 'tecnico'>('general');
  const [copiedXml, setCopiedXml] = useState(false);

  if (!invoice) return null;

  const handleCopyXml = () => {
    if (!invoice.rawXml) return;
    navigator.clipboard.writeText(invoice.rawXml);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
  };

  const handleDownloadXml = () => {
    if (!invoice.rawXml) return;
    const blob = new Blob([invoice.rawXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = invoice.fileName || `${invoice.uuid}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card"
        style={{
          width: '94%',
          maxWidth: '1060px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          padding: 0,
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid rgba(114, 125, 115, 0.4)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: 'var(--surface-secondary)',
            borderBottom: '1px solid rgba(114, 125, 115, 0.3)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Badge type={invoice.voucherType} label={invoice.voucherTypeDesc} size="md" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#000000',
                    lineHeight: 1.2,
                  }}
                >
                  {invoice.serie && invoice.serie !== '—' ? `${invoice.serie}-` : ''}
                  {invoice.folio && invoice.folio !== '—' ? invoice.folio : 'Sin Folio'}
                </h2>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(114, 125, 115, 0.25)',
                  }}
                >
                  CFDI v{invoice.version}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  marginTop: '2px',
                  fontFamily: 'monospace',
                }}
              >
                UUID: {invoice.uuid}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => onCopyUuid(invoice.uuid)}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Copy size={14} color="#000000" />
              <span>Copiar UUID</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleDownloadXml}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Download size={14} color="#000000" />
              <span>Descargar XML</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#727D73',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(240, 240, 215, 0.35)',
            borderBottom: '1px solid rgba(114, 125, 115, 0.2)',
            padding: '0 1.75rem',
            gap: '0.5rem',
          }}
        >
          {[
            { id: 'general', label: 'Información General', icon: <FileText size={15} /> },
            { id: 'conceptos', label: `Conceptos (${invoice.concepts.length})`, icon: <Package size={15} /> },
            { id: 'impuestos', label: 'Desglose de Impuestos', icon: <Percent size={15} /> },
            { id: 'tecnico', label: 'Timbre & Técnico', icon: <Award size={15} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2.5px solid ${isActive ? '#000000' : 'transparent'}`,
                  color: isActive ? '#000000' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Amounts summary card */}
              <div
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'rgba(208, 221, 208, 0.3)',
                  border: '1px solid rgba(114, 125, 115, 0.35)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Subtotal
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#000000' }}>
                    {formatCurrency(invoice.amounts.subtotal, invoice.payment.currency)}
                  </div>
                </div>

                {invoice.amounts.discount > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Descuento
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#000000' }}>
                      -{formatCurrency(invoice.amounts.discount, invoice.payment.currency)}
                    </div>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    IVA Trasladado
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#000000' }}>
                    {formatCurrency(invoice.amounts.transferredIVA, invoice.payment.currency)}
                  </div>
                </div>

                {invoice.amounts.retainedTaxes > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Retenciones
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#000000' }}>
                      -{formatCurrency(invoice.amounts.retainedTaxes, invoice.payment.currency)}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(114, 125, 115, 0.3)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#000000', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total Comprobante
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#000000' }}>
                    {formatCurrency(invoice.amounts.total, invoice.payment.currency, true)}
                  </div>
                </div>
              </div>

              {/* Grid: Emitter & Receiver */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Emisor */}
                <div
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid rgba(114, 125, 115, 0.2)',
                    }}
                  >
                    <Building size={18} color="#000000" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#000000' }}>
                      Emisor
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>RFC:</span>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                        {invoice.emitter.rfc}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Nombre / Razón Social:</span>
                      <div style={{ fontWeight: 600 }}>{invoice.emitter.name || '—'}</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Régimen Fiscal:</span>
                      <div>{invoice.emitter.taxRegimeDesc || invoice.emitter.taxRegime || '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Receptor */}
                <div
                  className="card"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid rgba(114, 125, 115, 0.2)',
                    }}
                  >
                    <User size={18} color="#000000" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#000000' }}>
                      Receptor
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>RFC:</span>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                        {invoice.receiver.rfc}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Nombre / Razón Social:</span>
                      <div style={{ fontWeight: 600 }}>{invoice.receiver.name || '—'}</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Uso de CFDI:</span>
                      <div>{invoice.receiver.cfdiUseDesc || invoice.receiver.cfdiUse || '—'}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Código Postal:</span>
                        <div style={{ fontWeight: 600 }}>{invoice.receiver.postalCode || '—'}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Régimen Fiscal:</span>
                        <div>{invoice.receiver.taxRegimeDesc || invoice.receiver.taxRegime || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprobante & Pago details */}
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid rgba(114, 125, 115, 0.2)',
                  }}
                >
                  <CreditCard size={18} color="#000000" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#000000' }}>
                    Información del Comprobante y Pago
                  </h3>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.85rem',
                    fontSize: '0.84rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Fecha de Emisión:</span>
                    <div style={{ fontWeight: 600 }}>{formatDate(invoice.issueDate)}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Fecha de Certificación:</span>
                    <div style={{ fontWeight: 600 }}>{formatDate(invoice.certificationDate)}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Forma de Pago:</span>
                    <div style={{ fontWeight: 500 }}>{invoice.payment.formDesc || invoice.payment.form || '—'}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Método de Pago:</span>
                    <div style={{ fontWeight: 500 }}>{invoice.payment.methodDesc || invoice.payment.method || '—'}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Moneda / Tipo de Cambio:</span>
                    <div style={{ fontWeight: 600 }}>
                      {invoice.payment.currency} (TC: {invoice.payment.exchangeRate})
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Lugar de Expedición:</span>
                    <div>C.P. {invoice.expeditionPlace || '—'}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Exportación:</span>
                    <div>{invoice.exportation || '01 - No aplica'}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Archivo de origen:</span>
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={invoice.fileName}>
                      {invoice.fileName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONCEPTOS */}
          {activeTab === 'conceptos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>Total de conceptos en este comprobante: <strong>{invoice.concepts.length}</strong></span>
              </div>

              <div
                style={{
                  overflowX: 'auto',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                  }}
                >
                  <thead style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '2px solid rgba(114, 125, 115, 0.35)' }}>
                    <tr>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Clave Prod/Serv</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>No. Identificación</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Cant.</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Unidad</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Descripción</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Valor Unitario</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Descuento</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Importe</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Impuestos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.concepts.map((c, idx) => (
                      <tr
                        key={c.id || idx}
                        style={{
                          borderBottom: '1px solid rgba(114, 125, 115, 0.15)',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'rgba(240, 240, 215, 0.25)',
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                          {c.prodServKey}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace' }}>
                          {c.identificationNo || '—'}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>
                          {c.quantity}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          {c.unit || c.unitKey}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', maxWidth: '300px' }}>
                          {c.description}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatCurrency(c.unitValue, invoice.payment.currency)}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {c.discount > 0 ? formatCurrency(c.discount, invoice.payment.currency) : '—'}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700 }}>
                          {formatCurrency(c.amount, invoice.payment.currency)}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          {c.taxes.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {c.taxes.map((t, tidx) => (
                                <span
                                  key={tidx}
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    backgroundColor: t.type === 'traslado' ? 'rgba(170, 185, 154, 0.35)' : 'rgba(208, 221, 208, 0.6)',
                                    display: 'inline-block',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {t.type === 'traslado' ? 'Tras.' : 'Ret.'} {t.taxName}: {formatCurrency(t.amount, invoice.payment.currency)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>Sin desglose</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: IMPUESTOS */}
          {activeTab === 'impuestos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Summary cards for tax amounts */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div className="card" style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    IVA Trasladado
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000000' }}>
                    {formatCurrency(invoice.taxes.transferredIVA, invoice.payment.currency)}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    IVA Retenido
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000000' }}>
                    {formatCurrency(invoice.taxes.retainedIVA, invoice.payment.currency)}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    ISR Retenido
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000000' }}>
                    {formatCurrency(invoice.taxes.retainedISR, invoice.payment.currency)}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    IEPS Trasladado
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000000' }}>
                    {formatCurrency(invoice.taxes.transferredIEPS, invoice.payment.currency)}
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    IEPS Retenido
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000000' }}>
                    {formatCurrency(invoice.taxes.retainedIEPS, invoice.payment.currency)}
                  </div>
                </div>
              </div>

              {/* Transferred Taxes Details Table */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#000000' }}>
                  Impuestos Trasladados ({invoice.taxes.transferredList.length})
                </h4>
                {invoice.taxes.transferredList.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid rgba(114, 125, 115, 0.3)' }}>
                      <tr>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Impuesto</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Tipo Factor</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Tasa o Cuota</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Base</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.taxes.transferredList.map((t, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(114, 125, 115, 0.15)' }}>
                          <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{t.taxName} ({t.taxType})</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{t.rateType || 'Tasa'}</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{formatRate(t.rate)}</td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                            {t.base !== undefined ? formatCurrency(t.base, invoice.payment.currency) : '—'}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(t.amount, invoice.payment.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    No se registraron impuestos trasladados en esta factura.
                  </div>
                )}
              </div>

              {/* Retained Taxes Details Table */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#000000' }}>
                  Impuestos Retenidos ({invoice.taxes.retainedList.length})
                </h4>
                {invoice.taxes.retainedList.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid rgba(114, 125, 115, 0.3)' }}>
                      <tr>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Impuesto</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Tipo Factor</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Tasa o Cuota</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Base</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.taxes.retainedList.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(114, 125, 115, 0.15)' }}>
                          <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{r.taxName} ({r.taxType})</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{r.rateType || 'Tasa'}</td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{formatRate(r.rate)}</td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                            {r.base !== undefined ? formatCurrency(r.base, invoice.payment.currency) : '—'}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(r.amount, invoice.payment.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    No se registraron retenciones en esta factura.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TECNICO & TIMBRE */}
          {activeTab === 'tecnico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Fiscal stamp cards */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#000000' }}>
                  Datos del Timbre Fiscal Digital (SAT)
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '0.85rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>UUID / Folio Fiscal:</span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{invoice.fiscalStamp.uuid}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Fecha y hora de timbrado:</span>
                    <div>{formatDate(invoice.fiscalStamp.stampDate)}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>RFC Proveedor Certificación:</span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{invoice.fiscalStamp.pacRfc}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No. Certificado SAT:</span>
                    <div style={{ fontFamily: 'monospace' }}>{invoice.fiscalStamp.satCertNo}</div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No. Certificado Emisor:</span>
                    <div style={{ fontFamily: 'monospace' }}>{invoice.fiscalStamp.emitterCertNo}</div>
                  </div>
                </div>
              </div>

              {/* Digital Seals */}
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: '#000000' }}>
                  Sellos Digitales
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Sello Digital del CFDI:
                    </span>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        backgroundColor: 'rgba(240, 240, 215, 0.4)',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(114, 125, 115, 0.2)',
                        wordBreak: 'break-all',
                        marginTop: '0.2rem',
                      }}
                    >
                      {invoice.fiscalStamp.cfdiSeal || '—'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Sello Digital del SAT:
                    </span>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        backgroundColor: 'rgba(240, 240, 215, 0.4)',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(114, 125, 115, 0.2)',
                        wordBreak: 'break-all',
                        marginTop: '0.2rem',
                      }}
                    >
                      {invoice.fiscalStamp.satSeal || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw XML Viewer */}
              {invoice.rawXml && (
                <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Code2 size={16} color="#000000" />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#000000' }}>
                        Contenido XML Completo
                      </h4>
                    </div>

                    <button
                      className="btn btn-secondary"
                      onClick={handleCopyXml}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      {copiedXml ? (
                        <>
                          <Check size={14} color="#000000" /> XML Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={14} color="#000000" /> Copiar XML
                        </>
                      )}
                    </button>
                  </div>

                  <pre
                    style={{
                      maxHeight: '260px',
                      overflowY: 'auto',
                      backgroundColor: 'rgba(240, 240, 215, 0.4)',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(114, 125, 115, 0.25)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      color: '#000000',
                    }}
                  >
                    {invoice.rawXml}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            backgroundColor: 'var(--surface-secondary)',
            borderTop: '1px solid rgba(114, 125, 115, 0.25)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
