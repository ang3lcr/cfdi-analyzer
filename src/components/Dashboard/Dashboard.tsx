import React, { useMemo } from 'react';
import type { Invoice } from '../../types/invoice';
import { formatCurrency } from '../../utils/currency';
import {
  FileText,
  DollarSign,
  Receipt,
  Scale,
  Percent,
  CheckCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Badge } from '../Common/Badge';

interface DashboardProps {
  invoices: Invoice[];
  errorCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, errorCount }) => {
  const stats = useMemo(() => {
    let subtotal = 0;
    let iva = 0;
    let total = 0;
    let totalTaxes = 0;
    const uuidSet = new Set<string>();
    const byType: Record<string, number> = {};
    const currencies: Record<string, number> = {};

    invoices.forEach((inv) => {
      subtotal += inv.amounts.subtotal;
      iva += inv.amounts.transferredIVA;
      total += inv.amounts.total;
      totalTaxes +=
        inv.amounts.transferredIVA +
        inv.amounts.otherTransferred +
        inv.amounts.retainedTaxes;

      if (inv.uuid) uuidSet.add(inv.uuid);

      const typeKey = inv.voucherType || 'I';
      byType[typeKey] = (byType[typeKey] || 0) + 1;

      const currKey = inv.payment.currency || 'MXN';
      currencies[currKey] = (currencies[currKey] || 0) + 1;
    });

    return {
      count: invoices.length,
      subtotal,
      iva,
      total,
      totalTaxes,
      uniqueUuids: uuidSet.size,
      byType,
      currencies,
    };
  }, [invoices]);

  const cards = [
    {
      title: 'Facturas importadas',
      value: stats.count.toLocaleString('es-MX'),
      subtitle: `${stats.uniqueUuids} UUIDs únicos`,
      icon: <FileText size={20} color="#000000" />,
      highlight: false,
    },
    {
      title: 'Subtotal acumulado',
      value: formatCurrency(stats.subtotal),
      subtitle: 'Antes de impuestos y desc.',
      icon: <DollarSign size={20} color="#000000" />,
      highlight: false,
    },
    {
      title: 'IVA trasladado',
      value: formatCurrency(stats.iva),
      subtitle: 'Tasa 16% y 8%',
      icon: <Percent size={20} color="#000000" />,
      highlight: false,
    },
    {
      title: 'Total de impuestos',
      value: formatCurrency(stats.totalTaxes),
      subtitle: 'Traslados + Retenciones',
      icon: <Receipt size={20} color="#000000" />,
      highlight: false,
    },
    {
      title: 'Gran Total',
      value: formatCurrency(stats.total),
      subtitle: 'Importe neto facturado',
      icon: <Scale size={20} color="#000000" />,
      highlight: true,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      {/* 5 Main KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {cards.map((c, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: c.highlight ? 'rgba(208, 221, 208, 0.45)' : '#FFFFFF',
              border: c.highlight
                ? '1px solid rgba(114, 125, 115, 0.5)'
                : '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.65rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {c.title}
              </span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: c.highlight
                    ? 'var(--accent-primary)'
                    : 'rgba(208, 221, 208, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(114, 125, 115, 0.25)',
                }}
              >
                {c.icon}
              </div>
            </div>

            <div
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#000000',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '0.25rem',
              }}
            >
              {c.value}
            </div>

            <div
              style={{
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              {c.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary pills row: Type Breakdown & Health status */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          backgroundColor: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
        }}
      >
        {/* By voucher type */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={14} color="#727D73" /> Por tipo:
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Badge type="I" label={`Ingreso: ${stats.byType['I'] || 0}`} size="sm" />
          </span>

          {stats.byType['E'] ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Badge type="E" label={`Egreso: ${stats.byType['E']}`} size="sm" />
            </span>
          ) : null}

          {stats.byType['P'] ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Badge type="P" label={`Pago: ${stats.byType['P']}`} size="sm" />
            </span>
          ) : null}

          {stats.byType['N'] ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Badge type="N" label={`Nómina: ${stats.byType['N']}`} size="sm" />
            </span>
          ) : null}

          {stats.byType['T'] ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Badge type="T" label={`Traslado: ${stats.byType['T']}`} size="sm" />
            </span>
          ) : null}
        </div>

        {/* Status validation counts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#000000', fontWeight: 600 }}>
            <CheckCircle size={15} color="#000000" />
            <span>{stats.count} XMLs válidos</span>
          </div>

          {errorCount > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#000000', fontWeight: 600 }}>
              <AlertTriangle size={15} color="#000000" />
              <span>{errorCount} con observaciones</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
