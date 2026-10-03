import * as XLSX from 'xlsx';
import type { Invoice } from '../types/invoice';
import { getFileDateString } from '../utils/dates';

/**
 * Generates and downloads a complete Excel workbook (.xlsx) containing:
 * - Sheet 1: Facturas (one row per invoice)
 * - Sheet 2: Conceptos (detailed line items)
 * - Sheet 3: Impuestos (tax breakdown per invoice)
 */
export function exportInvoicesToExcel(invoices: Invoice[], customFileName?: string): void {
  if (!invoices || invoices.length === 0) {
    throw new Error('No hay facturas para exportar.');
  }

  const wb = XLSX.utils.book_new();

  // ----------------------------------------------------
  // SHEET 1: Facturas
  // ----------------------------------------------------
  const facturasHeaders = [
    'Archivo',
    'UUID',
    'Serie',
    'Folio',
    'Fecha emisión',
    'Fecha certificación',
    'Tipo comprobante',
    'RFC emisor',
    'Nombre emisor',
    'Régimen emisor',
    'RFC receptor',
    'Nombre receptor',
    'Régimen receptor',
    'Código postal receptor',
    'Uso CFDI',
    'Forma pago',
    'Método pago',
    'Moneda',
    'Tipo cambio',
    'Subtotal',
    'Descuento',
    'IVA',
    'Otros impuestos',
    'Retenciones',
    'Total',
    'Lugar expedición',
    'Versión CFDI',
  ];

  const facturasRows = invoices.map((inv) => [
    inv.fileName,
    inv.uuid,
    inv.serie || '—',
    inv.folio || '—',
    inv.issueDate,
    inv.certificationDate || inv.fiscalStamp?.stampDate || '—',
    inv.voucherTypeDesc || inv.voucherType,
    inv.emitter.rfc,
    inv.emitter.name,
    inv.emitter.taxRegimeDesc || inv.emitter.taxRegime,
    inv.receiver.rfc,
    inv.receiver.name,
    inv.receiver.taxRegimeDesc || inv.receiver.taxRegime,
    inv.receiver.postalCode,
    inv.receiver.cfdiUseDesc || inv.receiver.cfdiUse,
    inv.payment.formDesc || inv.payment.form,
    inv.payment.methodDesc || inv.payment.method,
    inv.payment.currency,
    inv.payment.exchangeRate,
    inv.amounts.subtotal,
    inv.amounts.discount,
    inv.amounts.transferredIVA,
    inv.amounts.otherTransferred,
    inv.amounts.retainedTaxes,
    inv.amounts.total,
    inv.expeditionPlace,
    inv.version,
  ]);

  const wsFacturas = XLSX.utils.aoa_to_sheet([facturasHeaders, ...facturasRows]);

  // Set column widths for Sheet 1
  wsFacturas['!cols'] = [
    { wch: 25 }, // Archivo
    { wch: 38 }, // UUID
    { wch: 10 }, // Serie
    { wch: 12 }, // Folio
    { wch: 22 }, // Fecha emisión
    { wch: 22 }, // Fecha certificación
    { wch: 18 }, // Tipo comprobante
    { wch: 15 }, // RFC emisor
    { wch: 35 }, // Nombre emisor
    { wch: 35 }, // Régimen emisor
    { wch: 15 }, // RFC receptor
    { wch: 35 }, // Nombre receptor
    { wch: 35 }, // Régimen receptor
    { wch: 12 }, // CP receptor
    { wch: 30 }, // Uso CFDI
    { wch: 25 }, // Forma pago
    { wch: 25 }, // Método pago
    { wch: 10 }, // Moneda
    { wch: 12 }, // Tipo cambio
    { wch: 15 }, // Subtotal
    { wch: 12 }, // Descuento
    { wch: 15 }, // IVA
    { wch: 15 }, // Otros impuestos
    { wch: 15 }, // Retenciones
    { wch: 16 }, // Total
    { wch: 16 }, // Lugar expedición
    { wch: 12 }, // Versión CFDI
  ];

  // Auto-filter and freeze first row
  wsFacturas['!autofilter'] = { ref: `A1:AA${facturasRows.length + 1}` };
  wsFacturas['!views'] = [{ state: 'frozen', ySplit: 1 }];

  XLSX.utils.book_append_sheet(wb, wsFacturas, 'Facturas');

  // ----------------------------------------------------
  // SHEET 2: Conceptos
  // ----------------------------------------------------
  const conceptosHeaders = [
    'UUID',
    'Folio',
    'Clave producto/servicio',
    'No. identificación',
    'Cantidad',
    'Clave unidad',
    'Unidad',
    'Descripción',
    'Valor unitario',
    'Importe',
    'Descuento',
    'Objeto impuesto',
  ];

  const conceptosRows: (string | number)[][] = [];
  invoices.forEach((inv) => {
    inv.concepts.forEach((c) => {
      conceptosRows.push([
        inv.uuid,
        inv.folio || '—',
        c.prodServKey,
        c.identificationNo,
        c.quantity,
        c.unitKey,
        c.unit,
        c.description,
        c.unitValue,
        c.amount,
        c.discount,
        c.taxObject,
      ]);
    });
  });

  const wsConceptos = XLSX.utils.aoa_to_sheet([conceptosHeaders, ...conceptosRows]);
  wsConceptos['!cols'] = [
    { wch: 38 }, // UUID
    { wch: 12 }, // Folio
    { wch: 16 }, // Clave Prod/Serv
    { wch: 18 }, // No. Identificación
    { wch: 10 }, // Cantidad
    { wch: 12 }, // Clave unidad
    { wch: 14 }, // Unidad
    { wch: 45 }, // Descripción
    { wch: 14 }, // Valor Unitario
    { wch: 14 }, // Importe
    { wch: 12 }, // Descuento
    { wch: 20 }, // Objeto impuesto
  ];

  if (conceptosRows.length > 0) {
    wsConceptos['!autofilter'] = { ref: `A1:L${conceptosRows.length + 1}` };
  }
  wsConceptos['!views'] = [{ state: 'frozen', ySplit: 1 }];
  XLSX.utils.book_append_sheet(wb, wsConceptos, 'Conceptos');

  // ----------------------------------------------------
  // SHEET 3: Impuestos
  // ----------------------------------------------------
  const impuestosHeaders = [
    'UUID',
    'Folio',
    'Tipo',
    'Impuesto',
    'Clave Impuesto',
    'Base',
    'Tipo Factor',
    'Tasa o Cuota',
    'Importe',
  ];

  const impuestosRows: (string | number)[][] = [];
  invoices.forEach((inv) => {
    // Transferred taxes
    inv.taxes.transferredList.forEach((t) => {
      impuestosRows.push([
        inv.uuid,
        inv.folio || '—',
        'Traslado',
        t.taxName,
        t.taxType,
        t.base !== undefined ? t.base : '—',
        t.rateType || 'Tasa',
        t.rate !== undefined ? t.rate : '—',
        t.amount,
      ]);
    });

    // Retained taxes
    inv.taxes.retainedList.forEach((r) => {
      impuestosRows.push([
        inv.uuid,
        inv.folio || '—',
        'Retención',
        r.taxName,
        r.taxType,
        r.base !== undefined ? r.base : '—',
        r.rateType || 'Tasa',
        r.rate !== undefined ? r.rate : '—',
        r.amount,
      ]);
    });
  });

  const wsImpuestos = XLSX.utils.aoa_to_sheet([impuestosHeaders, ...impuestosRows]);
  wsImpuestos['!cols'] = [
    { wch: 38 }, // UUID
    { wch: 12 }, // Folio
    { wch: 14 }, // Tipo
    { wch: 14 }, // Impuesto
    { wch: 14 }, // Clave Impuesto
    { wch: 14 }, // Base
    { wch: 14 }, // Tipo Factor
    { wch: 14 }, // Tasa o Cuota
    { wch: 15 }, // Importe
  ];

  if (impuestosRows.length > 0) {
    wsImpuestos['!autofilter'] = { ref: `A1:I${impuestosRows.length + 1}` };
  }
  wsImpuestos['!views'] = [{ state: 'frozen', ySplit: 1 }];
  XLSX.utils.book_append_sheet(wb, wsImpuestos, 'Impuestos');

  // Trigger download
  const dateStr = getFileDateString();
  const fileName = customFileName || `facturas_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
