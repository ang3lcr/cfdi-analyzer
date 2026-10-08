export type VoucherType = 'I' | 'E' | 'T' | 'P' | 'N' | 'R' | string;

export interface ConceptTax {
  type: 'traslado' | 'retencion';
  taxType: string; // '001' (ISR), '002' (IVA), '003' (IEPS)
  taxName: string; // 'IVA', 'ISR', 'IEPS'
  base: number;
  rateType?: string; // 'Tasa', 'Cuota', 'Exento'
  rate?: number; // 0.160000, 0.080000
  amount: number;
}

export interface Concept {
  id: string;
  prodServKey: string; // ClaveProdServ
  identificationNo: string; // NoIdentificacion
  quantity: number; // Cantidad
  unitKey: string; // ClaveUnidad
  unit: string; // Unidad
  description: string; // Descripcion
  unitValue: number; // ValorUnitario
  amount: number; // Importe
  discount: number; // Descuento
  taxObject: string; // ObjetoImp ('01', '02', '03', '04')
  taxes: ConceptTax[];
}

export interface TaxItem {
  taxType: string; // '001' | '002' | '003'
  taxName: string; // 'ISR' | 'IVA' | 'IEPS' | 'Otro'
  rateType?: string; // 'Tasa', 'Cuota', 'Exento'
  rate?: number; // 0.16
  amount: number;
  base?: number;
}

export interface TaxSummary {
  transferredIVA: number;
  retainedIVA: number;
  retainedISR: number;
  transferredIEPS: number;
  retainedIEPS: number;
  otherTransferred: number;
  otherRetained: number;
  totalTransferred: number;
  totalRetained: number;
  transferredList: TaxItem[];
  retainedList: TaxItem[];
}

export interface FiscalStamp {
  uuid: string;
  stampDate: string; // FechaTimbrado
  pacRfc: string; // RfcProvCertif
  satCertNo: string; // NoCertificadoSAT
  satSeal: string; // SelloSAT
  cfdiSeal: string; // SelloCFDI
  emitterCertNo: string; // NoCertificado del Comprobante
}

export interface Emitter {
  rfc: string;
  name: string;
  taxRegime: string;
  taxRegimeDesc?: string;
}

export interface Receiver {
  rfc: string;
  name: string;
  taxRegime: string;
  taxRegimeDesc?: string;
  postalCode: string;
  cfdiUse: string;
  cfdiUseDesc?: string;
}

export interface PaymentInfo {
  method: string; // 'PUE' | 'PPD'
  methodDesc?: string;
  form: string; // '01', '03', etc.
  formDesc?: string;
  currency: string;
  exchangeRate: number;
  conditions?: string;
}

export interface InvoiceAmounts {
  subtotal: number;
  discount: number;
  transferredIVA: number;
  otherTransferred: number;
  retainedTaxes: number;
  total: number;
}

export interface Invoice {
  id: string; // unique internal ID or UUID
  fileName: string;
  fileSize: number;
  rawXml?: string;
  version: string; // "4.0" | "3.3"
  uuid: string; // Folio Fiscal
  serie: string;
  folio: string;
  voucherType: VoucherType;
  voucherTypeDesc: string;
  issueDate: string; // Fecha
  certificationDate: string; // FechaTimbrado
  expeditionPlace: string; // LugarExpedicion (CP)
  exportation: string; // Exportacion

  emitter: Emitter;
  receiver: Receiver;
  payment: PaymentInfo;
  amounts: InvoiceAmounts;

  concepts: Concept[];
  taxes: TaxSummary;
  fiscalStamp: FiscalStamp;

  // Extra metadata
  createdAt: number;
}

export interface InvoiceParseError {
  fileName: string;
  stage?: string;
  reason: string;
  errorType?: string;
  errorDetail?: string;
  timestamp: number;
}

export interface InvoiceFilters {
  searchTerm: string;
  voucherType: string;
  dateStart: string;
  dateEnd: string;
  paymentMethod: string;
  currency: string;
  emitterRfc: string;
  receiverRfc: string;
  minAmount?: number;
  maxAmount?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface TableColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  minWidth?: number;
  isDefault?: boolean;
}
