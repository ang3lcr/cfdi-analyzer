import type {
  Invoice,
  Concept,
  ConceptTax,
  TaxSummary,
  TaxItem,
  FiscalStamp,
} from '../types/invoice';
import {
  parseXmlString,
  findElementByLocalName,
  findElementsByLocalName,
  findDirectChildrenByLocalName,
  getAttributeValue,
  getNumericAttribute,
} from './xmlParser';
import {
  getVoucherTypeDesc,
  getPaymentMethodDesc,
  getPaymentFormDesc,
  getTaxRegimeDesc,
  getCfdiUseDesc,
  getTaxName,
} from '../utils/satCatalogs';
import { isValidUUID } from '../utils/validation';

/**
 * Parses raw XML text into an Invoice model.
 * Throws a descriptive Error if the structure is invalid or essential fields are missing.
 */
export function parseCfdiXml(
  xmlContent: string,
  fileName: string,
  fileSize: number
): Invoice {
  const doc = parseXmlString(xmlContent);

  // 1. Locate Comprobante
  const comprobante = findElementByLocalName(doc, 'Comprobante');
  if (!comprobante) {
    throw new Error('El archivo no contiene el elemento raíz <Comprobante> de un CFDI.');
  }

  // 2. Locate TimbreFiscalDigital
  const tfd = findElementByLocalName(doc, 'TimbreFiscalDigital');
  if (!tfd) {
    throw new Error('No se encontró el elemento <TimbreFiscalDigital> del SAT.');
  }

  const rawUuid = getAttributeValue(tfd, ['UUID', 'uuid']);
  if (!rawUuid) {
    throw new Error('No se encontró el Folio Fiscal (UUID) en el TimbreFiscalDigital.');
  }

  const cleanUuid = rawUuid.trim().toUpperCase();
  if (!isValidUUID(cleanUuid)) {
    throw new Error(`El UUID (${rawUuid}) no tiene un formato válido.`);
  }

  // 3. Comprobante attributes
  const version = getAttributeValue(comprobante, ['Version', 'version'], '4.0');
  const serie = getAttributeValue(comprobante, ['Serie', 'serie'], '—');
  const folio = getAttributeValue(comprobante, ['Folio', 'folio'], '—');
  const rawVoucherType = getAttributeValue(comprobante, ['TipoDeComprobante', 'tipodecomprobante'], 'I').toUpperCase();
  const voucherTypeDesc = getVoucherTypeDesc(rawVoucherType);
  const issueDate = getAttributeValue(comprobante, ['Fecha', 'fecha'], '');
  const expeditionPlace = getAttributeValue(comprobante, ['LugarExpedicion', 'lugarexpedicion'], '—');
  const exportation = getAttributeValue(comprobante, ['Exportacion', 'exportacion'], '01');
  const emitterCertNo = getAttributeValue(comprobante, ['NoCertificado', 'nocertificado'], '—');

  // Payment
  const paymentMethod = getAttributeValue(comprobante, ['MetodoPago', 'metodopago'], '—');
  const paymentForm = getAttributeValue(comprobante, ['FormaPago', 'formapago'], '—');
  const currency = getAttributeValue(comprobante, ['Moneda', 'moneda'], 'MXN');
  const exchangeRate = getNumericAttribute(comprobante, ['TipoCambio', 'tipocambio'], 1);
  const conditions = getAttributeValue(comprobante, ['CondicionesDePago', 'condicionesdepago'], '');

  // 4. Emitter
  const emisorEl = findElementByLocalName(comprobante, 'Emisor');
  const emitterRfc = getAttributeValue(emisorEl, ['Rfc', 'rfc'], '—').toUpperCase();
  const emitterName = getAttributeValue(emisorEl, ['Nombre', 'nombre'], '—');
  const emitterRegime = getAttributeValue(emisorEl, ['RegimenFiscal', 'regimenfiscal'], '—');

  // 5. Receiver
  const receptorEl = findElementByLocalName(comprobante, 'Receptor');
  const receiverRfc = getAttributeValue(receptorEl, ['Rfc', 'rfc'], '—').toUpperCase();
  const receiverName = getAttributeValue(receptorEl, ['Nombre', 'nombre'], '—');
  const receiverRegime = getAttributeValue(
    receptorEl,
    ['RegimenFiscalReceptor', 'RegimenFiscal', 'regimenfiscalreceptor'],
    '—'
  );
  // DomicilioFiscalReceptor (CFDI 4.0) or Domicilio child (CFDI 3.3)
  let receiverPostal = getAttributeValue(receptorEl, ['DomicilioFiscalReceptor', 'domiciliofiscalreceptor'], '');
  if (!receiverPostal) {
    const domicilioEl = findElementByLocalName(receptorEl, 'Domicilio');
    receiverPostal = getAttributeValue(domicilioEl, ['codigoPostal', 'CodigoPostal'], '—');
  }
  if (!receiverPostal) receiverPostal = '—';

  const receiverUse = getAttributeValue(receptorEl, ['UsoCFDI', 'usocfdi'], '—').toUpperCase();

  // 6. Amounts from Comprobante
  const subtotal = getNumericAttribute(comprobante, ['SubTotal', 'subtotal'], 0);
  const discount = getNumericAttribute(comprobante, ['Descuento', 'descuento'], 0);
  const total = getNumericAttribute(comprobante, ['Total', 'total'], 0);

  // 7. Concepts
  const conceptosContainer = findElementByLocalName(comprobante, 'Conceptos');
  const conceptoEls = conceptosContainer
    ? findDirectChildrenByLocalName(conceptosContainer, 'Concepto')
    : findElementsByLocalName(comprobante, 'Concepto');

  const concepts: Concept[] = conceptoEls.map((cEl, idx) => {
    const cTaxes: ConceptTax[] = [];

    // Concept level taxes
    const cImpuestos = findElementByLocalName(cEl, 'Impuestos');
    if (cImpuestos) {
      // Traslados
      const cTraslados = findElementsByLocalName(cImpuestos, 'Traslado');
      cTraslados.forEach((t) => {
        const taxCode = getAttributeValue(t, ['Impuesto', 'impuesto']);
        cTaxes.push({
          type: 'traslado',
          taxType: taxCode,
          taxName: getTaxName(taxCode),
          base: getNumericAttribute(t, ['Base', 'base'], 0),
          rateType: getAttributeValue(t, ['TipoFactor', 'tipofactor'], 'Tasa'),
          rate: getNumericAttribute(t, ['TasaOCuota', 'tasaocuota'], 0),
          amount: getNumericAttribute(t, ['Importe', 'importe'], 0),
        });
      });

      // Retenciones
      const cRetenciones = findElementsByLocalName(cImpuestos, 'Retencion');
      cRetenciones.forEach((r) => {
        const taxCode = getAttributeValue(r, ['Impuesto', 'impuesto']);
        cTaxes.push({
          type: 'retencion',
          taxType: taxCode,
          taxName: getTaxName(taxCode),
          base: getNumericAttribute(r, ['Base', 'base'], 0),
          rateType: getAttributeValue(r, ['TipoFactor', 'tipofactor'], 'Tasa'),
          rate: getNumericAttribute(r, ['TasaOCuota', 'tasaocuota'], 0),
          amount: getNumericAttribute(r, ['Importe', 'importe'], 0),
        });
      });
    }

    return {
      id: `${cleanUuid}-${idx}`,
      prodServKey: getAttributeValue(cEl, ['ClaveProdServ', 'claveprodserv'], '—'),
      identificationNo: getAttributeValue(cEl, ['NoIdentificacion', 'noidentificacion'], '—'),
      quantity: getNumericAttribute(cEl, ['Cantidad', 'cantidad'], 1),
      unitKey: getAttributeValue(cEl, ['ClaveUnidad', 'claveunidad'], '—'),
      unit: getAttributeValue(cEl, ['Unidad', 'unidad'], '—'),
      description: getAttributeValue(cEl, ['Descripcion', 'descripcion'], '—'),
      unitValue: getNumericAttribute(cEl, ['ValorUnitario', 'valorunitario'], 0),
      amount: getNumericAttribute(cEl, ['Importe', 'importe'], 0),
      discount: getNumericAttribute(cEl, ['Descuento', 'descuento'], 0),
      taxObject: getAttributeValue(cEl, ['ObjetoImp', 'objetoimp'], '—'),
      taxes: cTaxes,
    };
  });

  // 8. Taxes (Root level Impuestos)
  const rootImpuestos = findDirectChildrenByLocalName(comprobante, 'Impuestos')[0] ||
    findElementByLocalName(comprobante, 'Impuestos');

  const transferredList: TaxItem[] = [];
  const retainedList: TaxItem[] = [];

  let transferredIVA = 0;
  let retainedIVA = 0;
  let retainedISR = 0;
  let transferredIEPS = 0;
  let retainedIEPS = 0;
  let otherTransferred = 0;
  let otherRetained = 0;

  if (rootImpuestos) {
    const trasladosContainer = findElementByLocalName(rootImpuestos, 'Traslados');
    if (trasladosContainer) {
      const traslados = findElementsByLocalName(trasladosContainer, 'Traslado');
      traslados.forEach((t) => {
        const taxCode = getAttributeValue(t, ['Impuesto', 'impuesto']);
        const amount = getNumericAttribute(t, ['Importe', 'importe'], 0);
        const rate = getNumericAttribute(t, ['TasaOCuota', 'tasaocuota'], 0);
        const base = getNumericAttribute(t, ['Base', 'base'], 0);
        const rateType = getAttributeValue(t, ['TipoFactor', 'tipofactor'], 'Tasa');
        const taxName = getTaxName(taxCode);

        transferredList.push({
          taxType: taxCode,
          taxName,
          rateType,
          rate,
          amount,
          base,
        });

        if (taxCode === '002' || taxName === 'IVA') {
          transferredIVA += amount;
        } else if (taxCode === '003' || taxName === 'IEPS') {
          transferredIEPS += amount;
        } else {
          otherTransferred += amount;
        }
      });
    }

    const retencionesContainer = findElementByLocalName(rootImpuestos, 'Retenciones');
    if (retencionesContainer) {
      const retenciones = findElementsByLocalName(retencionesContainer, 'Retencion');
      retenciones.forEach((r) => {
        const taxCode = getAttributeValue(r, ['Impuesto', 'impuesto']);
        const amount = getNumericAttribute(r, ['Importe', 'importe'], 0);
        const rate = getNumericAttribute(r, ['TasaOCuota', 'tasaocuota'], 0);
        const base = getNumericAttribute(r, ['Base', 'base'], 0);
        const rateType = getAttributeValue(r, ['TipoFactor', 'tipofactor'], 'Tasa');
        const taxName = getTaxName(taxCode);

        retainedList.push({
          taxType: taxCode,
          taxName,
          rateType,
          rate,
          amount,
          base,
        });

        if (taxCode === '001' || taxName === 'ISR') {
          retainedISR += amount;
        } else if (taxCode === '002' || taxName === 'IVA') {
          retainedIVA += amount;
        } else if (taxCode === '003' || taxName === 'IEPS') {
          retainedIEPS += amount;
        } else {
          otherRetained += amount;
        }
      });
    }
  }

  // Fallback: if root impuestos was empty or zero, aggregate from concepts
  if (transferredList.length === 0 && retainedList.length === 0) {
    concepts.forEach((c) => {
      c.taxes.forEach((ct) => {
        if (ct.type === 'traslado') {
          if (ct.taxType === '002' || ct.taxName === 'IVA') {
            transferredIVA += ct.amount;
          } else if (ct.taxType === '003' || ct.taxName === 'IEPS') {
            transferredIEPS += ct.amount;
          } else {
            otherTransferred += ct.amount;
          }
          transferredList.push({
            taxType: ct.taxType,
            taxName: ct.taxName,
            rate: ct.rate,
            rateType: ct.rateType,
            amount: ct.amount,
            base: ct.base,
          });
        } else if (ct.type === 'retencion') {
          if (ct.taxType === '001' || ct.taxName === 'ISR') {
            retainedISR += ct.amount;
          } else if (ct.taxType === '002' || ct.taxName === 'IVA') {
            retainedIVA += ct.amount;
          } else if (ct.taxType === '003' || ct.taxName === 'IEPS') {
            retainedIEPS += ct.amount;
          } else {
            otherRetained += ct.amount;
          }
          retainedList.push({
            taxType: ct.taxType,
            taxName: ct.taxName,
            rate: ct.rate,
            rateType: ct.rateType,
            amount: ct.amount,
            base: ct.base,
          });
        }
      });
    });
  }

  const totalTransferred = transferredIVA + transferredIEPS + otherTransferred;
  const totalRetained = retainedISR + retainedIVA + retainedIEPS + otherRetained;

  const taxes: TaxSummary = {
    transferredIVA,
    retainedIVA,
    retainedISR,
    transferredIEPS,
    retainedIEPS,
    otherTransferred,
    otherRetained,
    totalTransferred,
    totalRetained,
    transferredList,
    retainedList,
  };

  // 9. Timbre fiscal digital
  const certificationDate = getAttributeValue(tfd, ['FechaTimbrado', 'fechatimbrado'], issueDate);
  const pacRfc = getAttributeValue(tfd, ['RfcProvCertif', 'rfcprovcertif'], '—');
  const satCertNo = getAttributeValue(tfd, ['NoCertificadoSAT', 'nocertificadosat'], '—');
  const satSeal = getAttributeValue(tfd, ['SelloSAT', 'sellosat'], '—');
  const cfdiSeal = getAttributeValue(tfd, ['SelloCFDI', 'sellocfdi'], getAttributeValue(comprobante, ['Sello', 'sello'], '—'));

  const fiscalStamp: FiscalStamp = {
    uuid: cleanUuid,
    stampDate: certificationDate,
    pacRfc,
    satCertNo,
    satSeal,
    cfdiSeal,
    emitterCertNo,
  };

  return {
    id: cleanUuid,
    fileName,
    fileSize,
    rawXml: xmlContent,
    version,
    uuid: cleanUuid,
    serie,
    folio,
    voucherType: rawVoucherType,
    voucherTypeDesc,
    issueDate,
    certificationDate,
    expeditionPlace,
    exportation,
    emitter: {
      rfc: emitterRfc,
      name: emitterName,
      taxRegime: emitterRegime,
      taxRegimeDesc: getTaxRegimeDesc(emitterRegime),
    },
    receiver: {
      rfc: receiverRfc,
      name: receiverName,
      taxRegime: receiverRegime,
      taxRegimeDesc: getTaxRegimeDesc(receiverRegime),
      postalCode: receiverPostal,
      cfdiUse: receiverUse,
      cfdiUseDesc: getCfdiUseDesc(receiverUse),
    },
    payment: {
      method: paymentMethod,
      methodDesc: getPaymentMethodDesc(paymentMethod),
      form: paymentForm,
      formDesc: getPaymentFormDesc(paymentForm),
      currency,
      exchangeRate,
      conditions,
    },
    amounts: {
      subtotal,
      discount,
      transferredIVA,
      otherTransferred: transferredIEPS + otherTransferred,
      retainedTaxes: totalRetained,
      total,
    },
    concepts,
    taxes,
    fiscalStamp,
    createdAt: Date.now(),
  };
}
