import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseCfdiXml } from '../invoiceParser';
import { CfdiParseError } from '../cfdiErrors';
import { SAMPLE_CFDI_FILES } from '../sampleInvoices';

const CFDI_A_PATH = path.resolve(__dirname, '../../../CFDI A.xml');
const CFDI_B_PATH = path.resolve(__dirname, '../../../CFDI B.xml');

describe('Auditoría y Robustez del Parser CFDI', () => {
  // Test 1: CFDI A (CFDI 4.0 Ingreso estándar)
  it('Test 1: CFDI A debe procesarse correctamente y extraer todos sus campos', () => {
    const xml = fs.readFileSync(CFDI_A_PATH, 'utf-8');
    const invoice = parseCfdiXml(xml, 'CFDI A.xml', xml.length);

    expect(invoice).toBeDefined();
    expect(invoice.version).toBe('4.0');
    expect(invoice.voucherType).toBe('I');
    expect(invoice.uuid).toBe('0C28FCD8-C596-4017-A9B3-5F596EF7A100');
    expect(invoice.serie).toBe('FAC');
    expect(invoice.folio).toBe('933');
    expect(invoice.issueDate).toBe('2026-09-27T14:01:15');
    expect(invoice.certificationDate).toBe('2026-09-27T14:01:17');
    expect(invoice.emitter.rfc).toBe('RIBC900411JS6');
    expect(invoice.emitter.name).toBe('CONIN MICHEL RICO BIBIAN');
    expect(invoice.emitter.taxRegime).toBe('612');
    expect(invoice.receiver.rfc).toBe('RIAL680606K73');
    expect(invoice.receiver.name).toBe('LUIS ANTONIO RIVERA AGUIRRE');
    expect(invoice.receiver.postalCode).toBe('58115');
    expect(invoice.amounts.subtotal).toBe(526.5);
    expect(invoice.amounts.total).toBe(526.5);
    expect(invoice.concepts.length).toBe(1);
    expect(invoice.concepts[0].description).toBe('CARNE DE CERDO');
    expect(invoice.concepts[0].quantity).toBeCloseTo(9.933962);
    expect(invoice.fiscalStamp.pacRfc).toBe('TSP080724QW6');
    expect(invoice.fiscalStamp.satCertNo).toBe('00001000000723806214');
  });

  // Test 2: CFDI B (CFDI Retenciones 2.0 con plataformas tecnológicas)
  it('Test 2: CFDI B debe procesarse correctamente sin errores y normalizarse al modelo Invoice', () => {
    const xml = fs.readFileSync(CFDI_B_PATH, 'utf-8');
    const invoice = parseCfdiXml(xml, 'CFDI B.xml', xml.length);

    expect(invoice).toBeDefined();
    expect(invoice.version).toBe('2.0');
    expect(invoice.voucherType).toBe('R');
    expect(invoice.voucherTypeDesc).toBe('Retención e información de pagos');
    expect(invoice.uuid).toBe('B523B87D-F164-5A17-8CA2-14474BD43745');
    expect(invoice.folio).toBe('42721531');
    expect(invoice.issueDate).toBe('2026-09-03T16:59:22');
    expect(invoice.certificationDate).toBe('2026-09-03T16:59:23');
    expect(invoice.emitter.rfc).toBe('UPM191014S31');
    expect(invoice.emitter.name).toBe('UBER PORTIER MEXICO');
    expect(invoice.emitter.taxRegime).toBe('601');
    expect(invoice.receiver.rfc).toBe('CACE960404LL3');
    expect(invoice.receiver.name).toBe('EDUARDO NICOLAS CALDERON CHAVEZ');
    expect(invoice.receiver.postalCode).toBe('58020');
    expect(invoice.amounts.subtotal).toBe(6558.68);
    expect(invoice.amounts.retainedTaxes).toBe(688.65);
    expect(invoice.amounts.total).toBe(6558.68);

    // Impuestos retenidos detallados
    expect(invoice.taxes.retainedList.length).toBe(2);
    expect(invoice.taxes.retainedISR).toBeCloseTo(163.96);
    expect(invoice.taxes.retainedIVA).toBeCloseTo(524.69);
    expect(invoice.taxes.totalRetained).toBeCloseTo(688.65);

    // IVA Trasladado extraído del complemento de plataformas tecnológicas
    expect(invoice.taxes.transferredIVA).toBeCloseTo(1049.3888);

    // Timbre fiscal
    expect(invoice.fiscalStamp.uuid).toBe('B523B87D-F164-5A17-8CA2-14474BD43745');
    expect(invoice.fiscalStamp.pacRfc).toBe('CVD110412TF6');
    expect(invoice.fiscalStamp.satCertNo).toBe('00001000000707310321');
  });

  // Test 3: CFDI con diferentes prefijos XML (sat:, customtfd:)
  it('Test 3: CFDI con prefijos XML no convencionales debe funcionar correctamente', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sat:Comprobante xmlns:sat="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:customtfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="PREF" Folio="101" Fecha="2026-05-10T12:00:00" SubTotal="1000.00" Total="1160.00" TipoDeComprobante="I" Moneda="MXN">
  <sat:Emisor Rfc="AAA010101AAA" Nombre="EMPRESA CON PREFIJO SAT" RegimenFiscal="601"/>
  <sat:Receptor Rfc="BBB020202BBB" Nombre="CLIENTE RECEPTOR" DomicilioFiscalReceptor="01000" RegimenFiscalReceptor="601" UsoCFDI="G03"/>
  <sat:Conceptos>
    <sat:Concepto ClaveProdServ="10101010" Cantidad="1" ClaveUnidad="H87" Descripcion="Producto con prefijo alternativo" ValorUnitario="1000.00" Importe="1000.00"/>
  </sat:Conceptos>
  <sat:Impuestos TotalImpuestosTrasladados="160.00">
    <sat:Traslados>
      <sat:Traslado Base="1000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="160.00"/>
    </sat:Traslados>
  </sat:Impuestos>
  <sat:Complemento>
    <customtfd:TimbreFiscalDigital Version="1.1" UUID="A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D" FechaTimbrado="2026-05-10T12:05:00" RfcProvCertif="SAT970701NN3" NoCertificadoSAT="00001000000500000000"/>
  </sat:Complemento>
</sat:Comprobante>`;

    const invoice = parseCfdiXml(xml, 'prefijos_alternativos.xml', xml.length);
    expect(invoice.uuid).toBe('A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D');
    expect(invoice.emitter.name).toBe('EMPRESA CON PREFIJO SAT');
    expect(invoice.amounts.total).toBe(1160);
    expect(invoice.taxes.transferredIVA).toBe(160);
  });

  // Test 4: CFDI sin prefijos (default namespace xmlns="...")
  it('Test 4: CFDI sin prefijos (namespace por defecto) debe funcionar', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Comprobante xmlns="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="NOPREF" Folio="202" Fecha="2026-06-01T10:00:00" SubTotal="500.00" Total="580.00" TipoDeComprobante="I" Moneda="MXN">
  <Emisor Rfc="NOP010101000" Nombre="SIN PREFIJO SA DE CV" RegimenFiscal="601"/>
  <Receptor Rfc="REC020202000" Nombre="RECEPTOR SIN PREFIJO" DomicilioFiscalReceptor="06700" RegimenFiscalReceptor="601" UsoCFDI="G01"/>
  <Conceptos>
    <Concepto ClaveProdServ="20202020" Cantidad="2" ClaveUnidad="E48" Descripcion="Servicio sin prefijo" ValorUnitario="250.00" Importe="500.00"/>
  </Conceptos>
  <Impuestos TotalImpuestosTrasladados="80.00">
    <Traslados>
      <Traslado Base="500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="80.00"/>
    </Traslados>
  </Impuestos>
  <Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="11112222-3333-4444-5555-666677778888" FechaTimbrado="2026-06-01T10:02:00" RfcProvCertif="PAC000000000"/>
  </Complemento>
</Comprobante>`;

    const invoice = parseCfdiXml(xml, 'sin_prefijo.xml', xml.length);
    expect(invoice.uuid).toBe('11112222-3333-4444-5555-666677778888');
    expect(invoice.emitter.rfc).toBe('NOP010101000');
    expect(invoice.receiver.name).toBe('RECEPTOR SIN PREFIJO');
    expect(invoice.amounts.total).toBe(580);
    expect(invoice.concepts.length).toBe(1);
  });

  // Test 5: CFDI 3.3
  it('Test 5: CFDI 3.3 debe procesarse correctamente', () => {
    const sample33 = SAMPLE_CFDI_FILES.find((s) => s.name.includes('33'));
    expect(sample33).toBeDefined();

    const invoice = parseCfdiXml(sample33!.xml, sample33!.name, sample33!.xml.length);
    expect(invoice.version).toBe('3.3');
    expect(invoice.voucherType).toBe('I');
    expect(invoice.uuid).toBe('2C3D4E5F-6A7B-8C9D-0E1F-2A3B4C5D6E7F');
    expect(invoice.emitter.rfc).toBe('MARD850415AA2');
    expect(invoice.emitter.name).toBe('DRA. DANIELA MARTINEZ RAMIREZ');
    expect(invoice.receiver.rfc).toBe('PELJ901201KL5');
    expect(invoice.receiver.name).toBe('JUAN PEREZ LOPEZ');
    expect(invoice.receiver.postalCode).toBe('72000');
    expect(invoice.amounts.subtotal).toBe(1500);
    expect(invoice.amounts.total).toBe(1500);
  });

  // Test 6: CFDI 4.0
  it('Test 6: CFDI 4.0 debe procesarse correctamente', () => {
    const sample40 = SAMPLE_CFDI_FILES.find((s) => s.name.includes('CFDI40_Ingreso_Software'));
    expect(sample40).toBeDefined();

    const invoice = parseCfdiXml(sample40!.xml, sample40!.name, sample40!.xml.length);
    expect(invoice.version).toBe('4.0');
    expect(invoice.uuid).toBe('7F8B2E1C-4B9A-4E3D-9A2F-1C8E5B4A3D2F');
    expect(invoice.emitter.name).toBe('TECNOLOGIAS INTELIGENTES DE MEXICO SA DE CV');
    expect(invoice.amounts.subtotal).toBe(24500);
    expect(invoice.amounts.discount).toBe(500);
    expect(invoice.amounts.total).toBe(27840);
  });

  // Test 7: CFDI con múltiples conceptos
  it('Test 7: CFDI con múltiples conceptos debe procesar cada uno de forma independiente', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="MULTI" Folio="50" Fecha="2026-07-01T10:00:00" SubTotal="3000.00" Total="3480.00" TipoDeComprobante="I">
  <cfdi:Emisor Rfc="ABC010101ABC" Nombre="VENTAS MULTIPLES SA" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="XYZ010101XYZ" Nombre="CLIENTE" DomicilioFiscalReceptor="03000" RegimenFiscalReceptor="601" UsoCFDI="G01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="10000001" Cantidad="5" ClaveUnidad="H87" Descripcion="Artículo A" ValorUnitario="100.00" Importe="500.00"/>
    <cfdi:Concepto ClaveProdServ="10000002" Cantidad="10" ClaveUnidad="H87" Descripcion="Artículo B" ValorUnitario="150.00" Importe="1500.00"/>
    <cfdi:Concepto ClaveProdServ="10000003" Cantidad="2" ClaveUnidad="E48" Descripcion="Servicio C" ValorUnitario="500.00" Importe="1000.00"/>
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="AAAA1111-BBBB-2222-CCCC-333344445555" FechaTimbrado="2026-07-01T10:05:00" RfcProvCertif="PAC000000000"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    const invoice = parseCfdiXml(xml, 'multi_conceptos.xml', xml.length);
    expect(invoice.concepts.length).toBe(3);
    expect(invoice.concepts[0].description).toBe('Artículo A');
    expect(invoice.concepts[0].quantity).toBe(5);
    expect(invoice.concepts[1].description).toBe('Artículo B');
    expect(invoice.concepts[1].amount).toBe(1500);
    expect(invoice.concepts[2].description).toBe('Servicio C');
    expect(invoice.concepts[2].unitValue).toBe(500);
  });

  // Test 8: CFDI con impuestos (traslados IVA e IEPS)
  it('Test 8: CFDI con impuestos desglosados (IVA e IEPS) debe calcular y agrupar sumas', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Fecha="2026-07-02T10:00:00" SubTotal="1000.00" Total="1240.00" TipoDeComprobante="I">
  <cfdi:Emisor Rfc="IMP010101000" Nombre="DISTRIBUIDORA BEBIDAS" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="REC010101000" Nombre="TIENDA" DomicilioFiscalReceptor="01000" RegimenFiscalReceptor="601" UsoCFDI="G01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="50202200" Cantidad="1" Descripcion="Bebidas saborizadas" ValorUnitario="1000.00" Importe="1000.00"/>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="240.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="1000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="160.00"/>
      <cfdi:Traslado Base="1000.00" Impuesto="003" TipoFactor="Tasa" TasaOCuota="0.080000" Importe="80.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="BBBB2222-CCCC-3333-DDDD-444455556666" FechaTimbrado="2026-07-02T10:05:00" RfcProvCertif="PAC000000000"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    const invoice = parseCfdiXml(xml, 'impuestos_iva_ieps.xml', xml.length);
    expect(invoice.taxes.transferredIVA).toBe(160);
    expect(invoice.taxes.transferredIEPS).toBe(80);
    expect(invoice.taxes.totalTransferred).toBe(240);
  });

  // Test 9: CFDI con retenciones (retención IVA e ISR)
  it('Test 9: CFDI con retenciones debe calcular montos retenidos adecuadamente', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Fecha="2026-07-03T10:00:00" SubTotal="10000.00" Total="10533.33" TipoDeComprobante="I">
  <cfdi:Emisor Rfc="HON010101000" Nombre="PROFESIONAL INDEPENDIENTE" RegimenFiscal="612"/>
  <cfdi:Receptor Rfc="EMP010101000" Nombre="EMPRESA CONTRATANTE" DomicilioFiscalReceptor="03100" RegimenFiscalReceptor="601" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="80101500" Cantidad="1" Descripcion="Honorarios profesionales" ValorUnitario="10000.00" Importe="10000.00"/>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="1600.00" TotalImpuestosRetenidos="1066.67">
    <cfdi:Traslados>
      <cfdi:Traslado Base="10000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="1600.00"/>
    </cfdi:Traslados>
    <cfdi:Retenciones>
      <cfdi:Retencion Impuesto="001" Importe="1000.00"/>
      <cfdi:Retencion Impuesto="002" Importe="1066.67"/>
    </cfdi:Retenciones>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="CCCC3333-DDDD-4444-EEEE-555566667777" FechaTimbrado="2026-07-03T10:05:00" RfcProvCertif="PAC000000000"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    const invoice = parseCfdiXml(xml, 'retenciones.xml', xml.length);
    expect(invoice.taxes.retainedISR).toBe(1000);
    expect(invoice.taxes.retainedIVA).toBe(1066.67);
    expect(invoice.taxes.totalRetained).toBe(2066.67);
    expect(invoice.amounts.retainedTaxes).toBe(2066.67);
  });

  // Test 10: CFDI con complemento desconocido (no debe romper el parser)
  it('Test 10: CFDI con complemento desconocido debe tolerarlo sin invalidar el comprobante', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xmlns:desconocido="http://www.sat.gob.mx/ComplementoDesconocido" Version="4.0" Fecha="2026-07-04T10:00:00" SubTotal="2000.00" Total="2000.00" TipoDeComprobante="I">
  <cfdi:Emisor Rfc="DES010101000" Nombre="EMISOR COMPLEMENTO EXTRA" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="REC010101000" Nombre="RECEPTOR" DomicilioFiscalReceptor="01000" RegimenFiscalReceptor="601" UsoCFDI="G01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="10101010" Cantidad="1" Descripcion="Concepto regular" ValorUnitario="2000.00" Importe="2000.00"/>
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <desconocido:NodoInedito AtributoX="Valor1" AtributoY="Valor2">
      <desconocido:SubElemento Dato="Prueba de compatibilidad"/>
    </desconocido:NodoInedito>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="DDDD4444-EEEE-5555-FFFF-666677778888" FechaTimbrado="2026-07-04T10:05:00" RfcProvCertif="PAC000000000"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    const invoice = parseCfdiXml(xml, 'complemento_desconocido.xml', xml.length);
    expect(invoice.uuid).toBe('DDDD4444-EEEE-5555-FFFF-666677778888');
    expect(invoice.emitter.name).toBe('EMISOR COMPLEMENTO EXTRA');
    expect(invoice.amounts.total).toBe(2000);
  });

  // Test 11: XML mal formado (sintaxis XML rota)
  it('Test 11: XML mal formado debe producir un error estructurado XmlSyntaxError', () => {
    const brokenXml = `<cfdi:Comprobante Version="4.0"><cfdi:Emisor>No hay cierre</cfdi:Comprobante>`;

    expect(() => parseCfdiXml(brokenXml, 'mal_formado.xml', brokenXml.length)).toThrowError();

    try {
      parseCfdiXml(brokenXml, 'mal_formado.xml', brokenXml.length);
    } catch (err: any) {
      expect(err).toBeInstanceOf(CfdiParseError);
      expect(err.stage).toBe('Lectura y sintaxis XML');
      expect(err.errorType).toBe('XmlSyntaxError');
    }
  });

  // Test 12: XML que no es CFDI
  it('Test 12: XML bien formado que no es CFDI debe producir NotACfdiError controlado', () => {
    const nonCfdiXml = `<?xml version="1.0" encoding="UTF-8"?>
<CatalogoProductos>
  <Producto id="1">
    <Nombre>Laptop Gaming</Nombre>
    <Precio>25000</Precio>
  </Producto>
</CatalogoProductos>`;

    expect(() => parseCfdiXml(nonCfdiXml, 'catalogo.xml', nonCfdiXml.length)).toThrowError();

    try {
      parseCfdiXml(nonCfdiXml, 'catalogo.xml', nonCfdiXml.length);
    } catch (err: any) {
      expect(err).toBeInstanceOf(CfdiParseError);
      expect(err.stage).toBe('Identificación de tipo CFDI');
      expect(err.errorType).toBe('NotACfdiError');
      expect(err.message).toContain('no corresponde a un CFDI del SAT');
    }
  });

  // Test 13: CFDI sin TimbreFiscalDigital
  it('Test 13: Comprobante CFDI sin TimbreFiscalDigital debe producir MissingFiscalStampError', () => {
    const xmlSinTimbre = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" Version="4.0" Fecha="2026-07-05T10:00:00" SubTotal="100" Total="100" TipoDeComprobante="I">
  <cfdi:Emisor Rfc="AAA010101AAA" Nombre="EMISOR" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="BBB010101BBB" Nombre="RECEPTOR" DomicilioFiscalReceptor="01000" RegimenFiscalReceptor="601" UsoCFDI="G01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="10101010" Cantidad="1" Descripcion="Item" ValorUnitario="100" Importe="100"/>
  </cfdi:Conceptos>
</cfdi:Comprobante>`;

    try {
      parseCfdiXml(xmlSinTimbre, 'sin_timbre.xml', xmlSinTimbre.length);
      expect.unreachable('Debería haber lanzado error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(CfdiParseError);
      expect(err.stage).toBe('Extracción del Timbre Fiscal Digital');
      expect(err.errorType).toBe('MissingFiscalStampError');
    }
  });

  // Test 14: CFDI con UUID no válido
  it('Test 14: CFDI con UUID inválido debe producir InvalidUUIDError', () => {
    const xmlUuidInvalido = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Fecha="2026-07-05T10:00:00" SubTotal="100" Total="100" TipoDeComprobante="I">
  <cfdi:Emisor Rfc="AAA010101AAA" Nombre="EMISOR" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="BBB010101BBB" Nombre="RECEPTOR" DomicilioFiscalReceptor="01000" RegimenFiscalReceptor="601" UsoCFDI="G01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="10101010" Cantidad="1" Descripcion="Item" ValorUnitario="100" Importe="100"/>
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="UUID-TOTALMENTE-INVALIDO-123" FechaTimbrado="2026-07-05T10:05:00"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    try {
      parseCfdiXml(xmlUuidInvalido, 'uuid_invalido.xml', xmlUuidInvalido.length);
      expect.unreachable('Debería haber lanzado error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(CfdiParseError);
      expect(err.stage).toBe('Extracción del Timbre Fiscal Digital');
      expect(err.errorType).toBe('InvalidUUIDError');
    }
  });

  // Test 15: Regresión total de todas las facturas de ejemplo del sistema
  it('Test 15: Todas las facturas de ejemplo preconfiguradas deben procesarse sin error', () => {
    expect(SAMPLE_CFDI_FILES.length).toBeGreaterThan(0);
    for (const sample of SAMPLE_CFDI_FILES) {
      const inv = parseCfdiXml(sample.xml, sample.name, sample.xml.length);
      expect(inv.uuid).toBeDefined();
      expect(inv.emitter.rfc).toBeDefined();
      expect(inv.amounts.total).toBeGreaterThanOrEqual(0);
    }
  });
});
