import type {
  Invoice,
  Concept,
  ConceptTax,
  TaxSummary,
  TaxItem,
  FiscalStamp,
  VoucherType,
} from '../types/invoice';
import {
  parseXmlString,
  findElementByLocalName,
  findElementsByLocalName,
  findDirectChildrenByLocalName,
  getAttributeValue,
  getNumericAttribute,
  getElementLocalName,
  SAT_NAMESPACES,
} from './xmlParser';
import {
  getVoucherTypeDesc,
  getPaymentMethodDesc,
  getPaymentFormDesc,
  getTaxRegimeDesc,
  getCfdiUseDesc,
  getTaxName,
  getRetencionDesc,
} from '../utils/satCatalogs';
import { isValidUUID } from '../utils/validation';
import { CfdiParseError } from './cfdiErrors';

/**
 * Parses raw XML text into an Invoice model.
 * Supports standard CFDIs (CFDI 3.3 and 4.0: Ingreso, Egreso, Traslado, Nómina, Pago)
 * as well as CFDI de Retenciones e Información de Pagos (Retenciones 1.0 and 2.0).
 *
 * Implements prefix-agnostic, namespace-aware traversal and fault-tolerant normalization.
 */
export function parseCfdiXml(
  xmlContent: string,
  fileName: string,
  fileSize: number
): Invoice {
  // 1. Parse XML to Document
  const doc = parseXmlString(xmlContent);

  // 2. Identify the root element and CFDI category
  const root = doc.documentElement;
  if (!root) {
    throw new CfdiParseError(
      'Identificación de tipo CFDI',
      'El documento XML no contiene un elemento raíz válido.',
      'NotACfdiError'
    );
  }

  const rootLocalName = getElementLocalName(root).toLowerCase();
  if (rootLocalName !== 'comprobante' && rootLocalName !== 'retenciones') {
    throw new CfdiParseError(
      'Identificación de tipo CFDI',
      `El archivo XML no corresponde a un CFDI del SAT. El elemento raíz es <${getElementLocalName(root)}>, pero se esperaba <Comprobante> o <Retenciones>.`,
      'NotACfdiError'
    );
  }

  // 3. Locate TimbreFiscalDigital
  // Search by localName TimbreFiscalDigital across the entire document
  const tfd = findElementByLocalName(doc, 'TimbreFiscalDigital', SAT_NAMESPACES.TFD) ||
    findElementByLocalName(doc, 'TimbreFiscalDigital');

  if (!tfd) {
    throw new CfdiParseError(
      'Extracción del Timbre Fiscal Digital',
      'No se encontró el elemento <TimbreFiscalDigital> del SAT en el comprobante.',
      'MissingFiscalStampError'
    );
  }

  const rawUuid = getAttributeValue(tfd, ['UUID', 'uuid']);
  if (!rawUuid) {
    throw new CfdiParseError(
      'Extracción del Timbre Fiscal Digital',
      'No se encontró el atributo Folio Fiscal (UUID) en el <TimbreFiscalDigital>.',
      'MissingFiscalStampError'
    );
  }

  const cleanUuid = rawUuid.trim().toUpperCase();
  if (!isValidUUID(cleanUuid)) {
    throw new CfdiParseError(
      'Extracción del Timbre Fiscal Digital',
      `El UUID ('${rawUuid}') no tiene un formato válido (debe ser formato 8-4-4-4-12 caracteres hexadecimales).`,
      'InvalidUUIDError'
    );
  }

  // Common Fiscal Stamp extraction
  const certificationDate = getAttributeValue(tfd, ['FechaTimbrado', 'fechatimbrado'], '');
  const pacRfc = getAttributeValue(tfd, ['RfcProvCertif', 'rfcprovcertif'], '—');
  const satCertNo = getAttributeValue(tfd, ['NoCertificadoSAT', 'nocertificadosat'], '—');
  const satSeal = getAttributeValue(tfd, ['SelloSAT', 'sellosat'], '—');
  const cfdiSeal = getAttributeValue(tfd, ['SelloCFD', 'SelloCFDI', 'sellocfd', 'sellocfdi'], '—');

  // 4. Branch normalization according to document root
  if (rootLocalName === 'comprobante') {
    return normalizeStandardCfdi(root, cleanUuid, fileName, fileSize, xmlContent, {
      certificationDate,
      pacRfc,
      satCertNo,
      satSeal,
      cfdiSeal,
    });
  }

  if (rootLocalName === 'retenciones') {
    return normalizeRetencionesCfdi(root, cleanUuid, fileName, fileSize, xmlContent, {
      certificationDate,
      pacRfc,
      satCertNo,
      satSeal,
      cfdiSeal,
    });
  }

  // If root is neither Comprobante nor Retenciones, raise descriptive NotACfdiError
  throw new CfdiParseError(
    'Identificación de tipo CFDI',
    `El archivo XML no corresponde a un CFDI del SAT. El elemento raíz es <${getElementLocalName(root)}>, pero se esperaba <Comprobante> o <Retenciones>.`,
    'NotACfdiError'
  );
}

/**
 * Normalizes CFDI 3.3 and 4.0 Comprobante structures into the unified Invoice model.
 */
function normalizeStandardCfdi(
  comprobante: Element,
  uuid: string,
  fileName: string,
  fileSize: number,
  rawXml: string,
  stampBase: {
    certificationDate: string;
    pacRfc: string;
    satCertNo: string;
    satSeal: string;
    cfdiSeal: string;
  }
): Invoice {
  // Comprobante attributes
  const version = getAttributeValue(comprobante, ['Version', 'version'], '4.0');
  const serie = getAttributeValue(comprobante, ['Serie', 'serie'], '—');
  const folio = getAttributeValue(comprobante, ['Folio', 'folio'], '—');
  const rawVoucherType = (
    getAttributeValue(comprobante, ['TipoDeComprobante', 'tipodecomprobante'], 'I') || 'I'
  ).toUpperCase();
  const voucherTypeDesc = getVoucherTypeDesc(rawVoucherType);
  const issueDate = getAttributeValue(comprobante, ['Fecha', 'fecha'], '');
  const expeditionPlace = getAttributeValue(comprobante, ['LugarExpedicion', 'lugarexpedicion'], '—');
  const exportation = getAttributeValue(comprobante, ['Exportacion', 'exportacion'], '01');
  const emitterCertNo = getAttributeValue(comprobante, ['NoCertificado', 'nocertificado'], '—');

  // Payment info
  const paymentMethod = getAttributeValue(comprobante, ['MetodoPago', 'metodopago'], '—');
  const paymentForm = getAttributeValue(comprobante, ['FormaPago', 'formapago'], '—');
  const currency = getAttributeValue(comprobante, ['Moneda', 'moneda'], 'MXN');
  const exchangeRate = getNumericAttribute(comprobante, ['TipoCambio', 'tipocambio'], 1);
  const conditions = getAttributeValue(comprobante, ['CondicionesDePago', 'condicionesdepago'], '');

  // Emitter
  const emisorEl = findElementByLocalName(comprobante, 'Emisor');
  const emitterRfc = getAttributeValue(emisorEl, ['Rfc', 'rfc'], '—').toUpperCase();
  const emitterName = getAttributeValue(emisorEl, ['Nombre', 'nombre'], '—');
  const emitterRegime = getAttributeValue(emisorEl, ['RegimenFiscal', 'regimenfiscal'], '—');

  // Receiver
  const receptorEl = findElementByLocalName(comprobante, 'Receptor');
  const receiverRfc = getAttributeValue(receptorEl, ['Rfc', 'rfc'], '—').toUpperCase();
  const receiverName = getAttributeValue(receptorEl, ['Nombre', 'nombre'], '—');
  const receiverRegime = getAttributeValue(
    receptorEl,
    ['RegimenFiscalReceptor', 'RegimenFiscal', 'regimenfiscalreceptor'],
    '—'
  );

  // Receiver Postal Code (CFDI 4.0: DomicilioFiscalReceptor, CFDI 3.3: Domicilio child)
  let receiverPostal = getAttributeValue(receptorEl, ['DomicilioFiscalReceptor', 'domiciliofiscalreceptor'], '');
  if (!receiverPostal && receptorEl) {
    const domicilioEl = findElementByLocalName(receptorEl, 'Domicilio');
    receiverPostal = getAttributeValue(domicilioEl, ['codigoPostal', 'CodigoPostal'], '—');
  }
  if (!receiverPostal) receiverPostal = '—';

  const receiverUse = getAttributeValue(receptorEl, ['UsoCFDI', 'usocfdi'], '—').toUpperCase();

  // Amounts
  const subtotal = getNumericAttribute(comprobante, ['SubTotal', 'subtotal'], 0);
  const discount = getNumericAttribute(comprobante, ['Descuento', 'descuento'], 0);
  const total = getNumericAttribute(comprobante, ['Total', 'total'], 0);

  // Concepts
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
      id: `${uuid}-${idx}`,
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

  // Global taxes (Root level Impuestos)
  const rootImpuestos =
    findDirectChildrenByLocalName(comprobante, 'Impuestos')[0] ||
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

  // Fallback: If root impuestos was empty, aggregate from concept taxes
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

  const finalCfdiSeal =
    stampBase.cfdiSeal !== '—'
      ? stampBase.cfdiSeal
      : getAttributeValue(comprobante, ['Sello', 'sello'], '—');

  const fiscalStamp: FiscalStamp = {
    uuid,
    stampDate: stampBase.certificationDate || issueDate,
    pacRfc: stampBase.pacRfc,
    satCertNo: stampBase.satCertNo,
    satSeal: stampBase.satSeal,
    cfdiSeal: finalCfdiSeal,
    emitterCertNo,
  };

  return {
    id: uuid,
    fileName,
    fileSize,
    rawXml,
    version,
    uuid,
    serie,
    folio,
    voucherType: rawVoucherType as VoucherType,
    voucherTypeDesc,
    issueDate,
    certificationDate: stampBase.certificationDate || issueDate,
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

/**
 * Normalizes CFDI de Retenciones e Información de Pagos (Retenciones 1.0 and 2.0)
 * into the unified Invoice model.
 */
function normalizeRetencionesCfdi(
  retenciones: Element,
  uuid: string,
  fileName: string,
  fileSize: number,
  rawXml: string,
  stampBase: {
    certificationDate: string;
    pacRfc: string;
    satCertNo: string;
    satSeal: string;
    cfdiSeal: string;
  }
): Invoice {
  // Retenciones root attributes
  const version = getAttributeValue(retenciones, ['Version', 'version'], '2.0');
  const folio = getAttributeValue(retenciones, ['FolioInt', 'folioint', 'Folio', 'folio'], '—');
  const serie = getAttributeValue(retenciones, ['Serie', 'serie'], '—');
  const cveRetenc = getAttributeValue(retenciones, ['CveRetenc', 'cveretenc'], '');
  const issueDate = getAttributeValue(retenciones, ['FechaExp', 'fechaexp', 'Fecha', 'fecha'], '');
  const expeditionPlace = getAttributeValue(
    retenciones,
    ['LugarExpRetenc', 'lugarexpretenc', 'LugarExpedicion', 'lugarexpedicion'],
    '—'
  );
  const emitterCertNo = getAttributeValue(retenciones, ['NoCertificado', 'nocertificado'], '—');

  // Emitter in Retenciones uses RfcE, NomDenRazSocE, RegimenFiscalE
  const emisorEl = findElementByLocalName(retenciones, 'Emisor');
  const emitterRfc = getAttributeValue(
    emisorEl,
    ['RfcE', 'rfce', 'Rfc', 'rfc'],
    '—'
  ).toUpperCase();
  const emitterName = getAttributeValue(
    emisorEl,
    ['NomDenRazSocE', 'nomdenrazsoce', 'Nombre', 'nombre'],
    '—'
  );
  const emitterRegime = getAttributeValue(
    emisorEl,
    ['RegimenFiscalE', 'regimenfiscale', 'RegimenFiscal', 'regimenfiscal'],
    '—'
  );

  // Receiver in Retenciones has Nacional or Extranjero child
  const receptorEl = findElementByLocalName(retenciones, 'Receptor');
  const nacionalEl = receptorEl ? findElementByLocalName(receptorEl, 'Nacional') : null;
  const extranjeroEl = receptorEl ? findElementByLocalName(receptorEl, 'Extranjero') : null;

  const receiverTarget = nacionalEl || extranjeroEl || receptorEl;
  const receiverRfc = getAttributeValue(
    receiverTarget,
    ['RfcR', 'rfcr', 'NumRegIdTrib', 'numregidtrib', 'Rfc', 'rfc'],
    '—'
  ).toUpperCase();
  const receiverName = getAttributeValue(
    receiverTarget,
    ['NomDenRazSocR', 'nomdenrazsocr', 'Nombre', 'nombre'],
    '—'
  );
  const receiverPostal = getAttributeValue(
    receiverTarget,
    ['DomicilioFiscalR', 'domiciliofiscalr', 'DomicilioFiscalReceptor', 'domiciliofiscalreceptor'],
    '—'
  );

  // Totales in Retenciones
  const totalesEl = findElementByLocalName(retenciones, 'Totales');
  const subtotal = getNumericAttribute(
    totalesEl,
    ['MontoTotOperacion', 'montototoperacion', 'SubTotal', 'subtotal'],
    0
  );
  const totalRetainedFromTotales = getNumericAttribute(
    totalesEl,
    ['MontoTotRet', 'montototret', 'TotalRetenido', 'totalretenido'],
    0
  );

  // Retenciones desglosadas (ImpRetenidos)
  const impRetenidosEls = totalesEl
    ? findElementsByLocalName(totalesEl, 'ImpRetenidos')
    : findElementsByLocalName(retenciones, 'ImpRetenidos');

  const retainedList: TaxItem[] = [];
  const transferredList: TaxItem[] = [];

  let retainedISR = 0;
  let retainedIVA = 0;
  let retainedIEPS = 0;
  let otherRetained = 0;
  let transferredIVA = 0;

  impRetenidosEls.forEach((impEl) => {
    const taxCode = getAttributeValue(impEl, ['ImpuestoRet', 'impuestoret', 'Impuesto', 'impuesto']);
    const amount = getNumericAttribute(impEl, ['MontoRet', 'montoret', 'Importe', 'importe'], 0);
    const base = getNumericAttribute(impEl, ['BaseRet', 'baseret', 'Base', 'base'], 0);
    const taxName = getTaxName(taxCode);

    retainedList.push({
      taxType: taxCode,
      taxName,
      rateType: 'Tasa',
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

  // Extract from known Retenciones Complements (e.g. Plataformas Tecnológicas)
  const conceptos: Concept[] = [];
  const complementosEl = findElementByLocalName(retenciones, 'Complemento');

  if (complementosEl) {
    // 1. Complemento de Plataformas Tecnologicas
    const platTecEl = findElementByLocalName(complementosEl, 'ServiciosPlataformasTecnologicas');
    if (platTecEl) {
      const platIvaTrans = getNumericAttribute(
        platTecEl,
        ['TotalIVATrasladado', 'totalivatrasladado'],
        0
      );
      if (platIvaTrans > 0) {
        transferredIVA += platIvaTrans;
        transferredList.push({
          taxType: '002',
          taxName: 'IVA',
          rateType: 'Tasa',
          rate: 0.16,
          amount: platIvaTrans,
          base: subtotal,
        });
      }

      // Check detailed services in DetallesDelServicio
      const serviciosDet = findElementsByLocalName(platTecEl, 'DetallesDelServicio');
      serviciosDet.forEach((servEl, sIdx) => {
        const precioSinIva = getNumericAttribute(
          servEl,
          ['PrecioServSinIVA', 'precioservsiniva'],
          0
        );
        const fechaServ = getAttributeValue(servEl, ['FechaServ', 'fechaserv'], '');
        const desc = `Servicio plataforma tecnológica${fechaServ ? ` (${fechaServ})` : ''}`;

        conceptos.push({
          id: `${uuid}-s-${sIdx}`,
          prodServKey: '—',
          identificationNo: `SERV-${sIdx + 1}`,
          quantity: 1,
          unitKey: 'E48',
          unit: 'Servicio',
          description: desc,
          unitValue: precioSinIva,
          amount: precioSinIva,
          discount: 0,
          taxObject: '02',
          taxes: [],
        });
      });
    }
  }

  // If no concepts were extracted from complements, synthesize a representative concept
  if (conceptos.length === 0) {
    const retDesc = getRetencionDesc(cveRetenc);
    const conceptTaxes: ConceptTax[] = retainedList.map((r) => ({
      type: 'retencion',
      taxType: r.taxType,
      taxName: r.taxName,
      base: r.base || subtotal,
      rateType: 'Tasa',
      amount: r.amount,
    }));

    conceptos.push({
      id: `${uuid}-0`,
      prodServKey: '—',
      identificationNo: cveRetenc ? `RET-${cveRetenc}` : 'RET-01',
      quantity: 1,
      unitKey: 'ACT',
      unit: 'Actividad',
      description: `Retención SAT: ${retDesc}`,
      unitValue: subtotal,
      amount: subtotal,
      discount: 0,
      taxObject: '02',
      taxes: conceptTaxes,
    });
  }

  const calculatedRetained = retainedISR + retainedIVA + retainedIEPS + otherRetained;
  const finalTotalRetained =
    totalRetainedFromTotales > 0 ? totalRetainedFromTotales : calculatedRetained;

  const taxes: TaxSummary = {
    transferredIVA,
    retainedIVA,
    retainedISR,
    transferredIEPS: 0,
    retainedIEPS,
    otherTransferred: 0,
    otherRetained,
    totalTransferred: transferredIVA,
    totalRetained: finalTotalRetained,
    transferredList,
    retainedList,
  };

  const finalCfdiSeal =
    stampBase.cfdiSeal !== '—'
      ? stampBase.cfdiSeal
      : getAttributeValue(retenciones, ['Sello', 'sello'], '—');

  const fiscalStamp: FiscalStamp = {
    uuid,
    stampDate: stampBase.certificationDate || issueDate,
    pacRfc: stampBase.pacRfc,
    satCertNo: stampBase.satCertNo,
    satSeal: stampBase.satSeal,
    cfdiSeal: finalCfdiSeal,
    emitterCertNo,
  };

  return {
    id: uuid,
    fileName,
    fileSize,
    rawXml,
    version,
    uuid,
    serie,
    folio,
    voucherType: 'R',
    voucherTypeDesc: getVoucherTypeDesc('R'),
    issueDate,
    certificationDate: stampBase.certificationDate || issueDate,
    expeditionPlace,
    exportation: '01',
    emitter: {
      rfc: emitterRfc,
      name: emitterName,
      taxRegime: emitterRegime,
      taxRegimeDesc: getTaxRegimeDesc(emitterRegime),
    },
    receiver: {
      rfc: receiverRfc,
      name: receiverName,
      taxRegime: '—',
      taxRegimeDesc: '—',
      postalCode: receiverPostal,
      cfdiUse: '—',
      cfdiUseDesc: '—',
    },
    payment: {
      method: '—',
      methodDesc: '—',
      form: '—',
      formDesc: '—',
      currency: 'MXN',
      exchangeRate: 1,
      conditions: '',
    },
    amounts: {
      subtotal,
      discount: 0,
      transferredIVA,
      otherTransferred: 0,
      retainedTaxes: finalTotalRetained,
      total: subtotal,
    },
    concepts: conceptos,
    taxes,
    fiscalStamp,
    createdAt: Date.now(),
  };
}
