/**
 * Realistic sample CFDI XMLs for quick testing and demonstration.
 * Includes:
 * 1. CFDI 4.0 - Factura de Ingreso (Servicios de software con IVA e ISR retenido)
 * 2. CFDI 4.0 - Factura de Ingreso (Venta de productos tangibles con IVA 16%)
 * 3. CFDI 4.0 - Nota de Crédito / Egreso (Bonificación de servicios)
 * 4. CFDI 3.3 - Factura de Ingreso tradicional (Arrendamiento con retenciones)
 * 5. CFDI 4.0 - Recibo Electrónico de Pago (Complemento de Pagos 2.0)
 */

export interface SampleXmlFile {
  name: string;
  xml: string;
}

export const SAMPLE_CFDI_FILES: SampleXmlFile[] = [
  {
    name: 'CFDI40_Ingreso_Software_Tech_SA.xml',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="4.0" Serie="F" Folio="18492" Fecha="2024-02-15T10:14:22" Sello="dGhpcy1pcy1hLXRlc3Qtc2VsbG8tY2ZkaS00MC1leGFtcGxl" FormaPago="03" NoCertificado="00001000000508492134" Certificado="TUlJRXB6Q0NBNEVnQXdJQkFnSVVNREF3TURFd01EQXdNREV3TkRneU1UTTBNQ0NRU0lsM" SubTotal="24500.00" Descuento="500.00" Moneda="MXN" TipoCambio="1" Total="27840.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="06600">
  <cfdi:Emisor Rfc="TEC180420AA1" Nombre="TECNOLOGIAS INTELIGENTES DE MEXICO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="SOL150812XYZ" Nombre="SOLUCIONES CORPORATIVAS DEL NORTE SA DE CV" DomicilioFiscalReceptor="64000" RegimenFiscalReceptor="601" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="81112200" NoIdentificacion="SRV-CLOUD-01" Cantidad="1" ClaveUnidad="E48" Unidad="Servicio" Descripcion="Licencia anual suscripción plataforma Cloud Enterprise y soporte técnico dedicado" ValorUnitario="18000.00" Importe="18000.00" Descuento="500.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="17500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="2800.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
    <cfdi:Concepto ClaveProdServ="80101500" NoIdentificacion="SRV-CONS-02" Cantidad="10" ClaveUnidad="E48" Unidad="Hora" Descripcion="Consultoría especializada en migración y arquitectura de microservicios" ValorUnitario="650.00" Importe="6500.00" Descuento="0.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="6500.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="1040.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="3840.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="24000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="3840.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="7F8B2E1C-4B9A-4E3D-9A2F-1C8E5B4A3D2F" FechaTimbrado="2024-02-15T10:15:30" RfcProvCertif="SAT970701NN3" SelloCFDI="c2VsbG9jZmRpLXRlc3QtNDAtZGF0YQ==" NoCertificadoSAT="00001000000504465028" SelloSAT="c2VsbG9zYXQtdGVzdC00MC1kYXRh"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },
  {
    name: 'CFDI40_Ingreso_Logistica_Express.xml',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="TRA" Folio="5421" Fecha="2024-03-01T14:22:10" Sello="dGhpcy1zZWxsby1leHByZXNzLXRyYW5zcG9ydGU=" FormaPago="04" NoCertificado="00001000000511223344" Certificado="TUlJRnpEQ0NBMStnQXdJQkFnSVVNREF3TURFd01EQXdNREV4TWpjek16UTBNQ0NRU0lsM" SubTotal="12800.00" Descuento="0.00" Moneda="MXN" TipoCambio="1" Total="14336.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="44100">
  <cfdi:Emisor Rfc="LME091104K82" Nombre="LOGISTICA Y MENSAJERIA EXPRESS DE OCCIDENTE SA DE CV" RegimenFiscal="624"/>
  <cfdi:Receptor Rfc="COM850101XYZ" Nombre="COMERCIALIZADORA NACIONAL DE ALIMENTOS SA DE CV" DomicilioFiscalReceptor="03100" RegimenFiscalReceptor="601" UsoCFDI="G01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="78101800" NoIdentificacion="FLETE-001" Cantidad="1" ClaveUnidad="E48" Unidad="Servicio" Descripcion="Servicio de flete y transportación terrestre consolidada Guadalajara - CDMX" ValorUnitario="12800.00" Importe="12800.00" Descuento="0.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="12800.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="2048.00"/>
        </cfdi:Traslados>
        <cfdi:Retenciones>
          <cfdi:Retencion Base="12800.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.040000" Importe="512.00"/>
        </cfdi:Retenciones>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="2048.00" TotalImpuestosRetenidos="512.00">
    <cfdi:Retenciones>
      <cfdi:Retencion Impuesto="002" Importe="512.00"/>
    </cfdi:Retenciones>
    <cfdi:Traslados>
      <cfdi:Traslado Base="12800.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="2048.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="9B1C3D4E-5F6A-7B8C-9D0E-1F2A3B4C5D6E" FechaTimbrado="2024-03-01T14:24:00" RfcProvCertif="PAC080808NN1" SelloCFDI="c2VsbG9jZmRpLXRyYW5zcG9ydGU=" NoCertificadoSAT="00001000000502000001" SelloSAT="c2VsbG9zYXQtdHJhbnNwb3J0ZQ=="/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },
  {
    name: 'CFDI40_Egreso_NotaCredito.xml',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="NC" Folio="302" Fecha="2024-03-05T09:30:15" Sello="c2VsbG8tbm90YS1kZS1jcmVkaXRv" FormaPago="17" NoCertificado="00001000000508492134" Certificado="TUlJRXB6Q0NBNEVnQXdJQkFnSVVNREF3TURFd01EQXdNREV3TkRneU1UTTBNQ0NRU0lsM" SubTotal="3000.00" Descuento="0.00" Moneda="MXN" TipoCambio="1" Total="3480.00" TipoDeComprobante="E" Exportacion="01" MetodoPago="PUE" LugarExpedicion="06600">
  <cfdi:Emisor Rfc="TEC180420AA1" Nombre="TECNOLOGIAS INTELIGENTES DE MEXICO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="SOL150812XYZ" Nombre="SOLUCIONES CORPORATIVAS DEL NORTE SA DE CV" DomicilioFiscalReceptor="64000" RegimenFiscalReceptor="601" UsoCFDI="G02"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111506" NoIdentificacion="NC-DESC-01" Cantidad="1" ClaveUnidad="ACT" Unidad="Actividad" Descripcion="Descuento comercial por pronto pago sobre factura F-18492" ValorUnitario="3000.00" Importe="3000.00" Descuento="0.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="3000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="480.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="480.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="3000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="480.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="3A4B5C6D-7E8F-9A0B-1C2D-3E4F5A6B7C8D" FechaTimbrado="2024-03-05T09:32:00" RfcProvCertif="SAT970701NN3" SelloCFDI="c2VsbG9jZmRpLW5j" NoCertificadoSAT="00001000000504465028" SelloSAT="c2VsbG9zYXQtbmM="/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },
  {
    name: 'CFDI33_Ingreso_Honorarios_Medicos.xml',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="3.3" Serie="MED" Folio="982" Fecha="2023-11-20T16:45:00" Sello="c2VsbG8tY2ZkaS0zMy1leGFtcGxl" FormaPago="01" NoCertificado="00001000000401234567" Certificado="TUlJRUF6Q0NBbXVnQXdJQkFnSVVNREF3TURFd01EQXdNREV3TVRNME5UWTNNQ0NRU0lsM" SubTotal="1500.00" Moneda="MXN" Total="1500.00" TipoDeComprobante="I" MetodoPago="PUE" LugarExpedicion="72000">
  <cfdi:Emisor Rfc="MARD850415AA2" Nombre="DRA. DANIELA MARTINEZ RAMIREZ" RegimenFiscal="612"/>
  <cfdi:Receptor Rfc="PELJ901201KL5" Nombre="JUAN PEREZ LOPEZ" UsoCFDI="D01">
    <cfdi:Domicilio codigoPostal="72000"/>
  </cfdi:Receptor>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="85121600" NoIdentificacion="CONS-001" Cantidad="1" ClaveUnidad="E48" Unidad="Consulta" Descripcion="Consulta médica de especialidad dermatológica presencial" ValorUnitario="1500.00" Importe="1500.00">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="1500.00" Impuesto="002" TipoFactor="Exento"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="2C3D4E5F-6A7B-8C9D-0E1F-2A3B4C5D6E7F" FechaTimbrado="2023-11-20T16:46:12" RfcProvCertif="PAC900101NN0" SelloCFDI="c2VsbG9jZmRpLTMz" NoCertificadoSAT="00001000000501112233" SelloSAT="c2VsbG9zYXQtMzM="/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },
  {
    name: 'CFDI40_Pago_Complemento_REP.xml',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:pago20="http://www.sat.gob.mx/Pagos20" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="PAG" Folio="450" Fecha="2024-03-10T12:00:00" Sello="c2VsbG8tcGFnb3MyMC1leGFtcGxl" NoCertificado="00001000000508492134" Certificado="TUlJRXB6Q0NBNEVnQXdJQkFnSVVNREF3TURFd01EQXdNREV3TkRneU1UTTBNQ0NRU0lsM" SubTotal="0" Moneda="XXX" Total="0" TipoDeComprobante="P" Exportacion="01" LugarExpedicion="06600">
  <cfdi:Emisor Rfc="TEC180420AA1" Nombre="TECNOLOGIAS INTELIGENTES DE MEXICO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="SOL150812XYZ" Nombre="SOLUCIONES CORPORATIVAS DEL NORTE SA DE CV" DomicilioFiscalReceptor="64000" RegimenFiscalReceptor="601" UsoCFDI="CP01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT" Descripcion="Pago" ValorUnitario="0" Importe="0" ObjetoImp="01"/>
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <pago20:Pagos Version="2.0">
      <pago20:Totales MontoTotalPagos="27840.00" TotalTrasladosBaseIVA16="24000.00" TotalTrasladosImpuestoIVA16="3840.00"/>
      <pago20:Pago FechaPago="2024-03-09T18:30:00" FormaDePagoP="03" MonedaP="MXN" TipoCambioP="1" Monto="27840.00">
        <pago20:DoctoRelacionado IdDocumento="7F8B2E1C-4B9A-4E3D-9A2F-1C8E5B4A3D2F" Serie="F" Folio="18492" MonedaDR="MXN" NumParcialidad="1" ImpSaldoAnt="27840.00" ImpPagado="27840.00" ImpSaldoInsoluto="0.00" ObjetoImpDR="02"/>
      </pago20:Pago>
    </pago20:Pagos>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="5D6E7F8A-9B0C-1D2E-3F4A-5B6C7D8E9F0A" FechaTimbrado="2024-03-10T12:02:15" RfcProvCertif="SAT970701NN3" SelloCFDI="c2VsbG9jZmRpLXBhZ28=" NoCertificadoSAT="00001000000504465028" SelloSAT="c2VsbG9zYXQtcGFnbw=="/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },
];
