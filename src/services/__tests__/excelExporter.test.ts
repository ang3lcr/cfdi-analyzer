import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseCfdiXml } from '../invoiceParser';

const CFDI_A_PATH = path.resolve(__dirname, '../../../CFDI A.xml');
const CFDI_B_PATH = path.resolve(__dirname, '../../../CFDI B.xml');

// Mock XLSX using vi.mock
const writtenFiles: { wb: any; fileName: string }[] = [];

vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('xlsx')>();
  return {
    ...actual,
    writeFile: (wb: any, fileName: string) => {
      writtenFiles.push({ wb, fileName });
    },
  };
});

// Import after mock
import { exportInvoicesToExcel } from '../excelExporter';
import * as XLSX from 'xlsx';

describe('Prueba de Exportación a Excel con CFDI A y CFDI B', () => {
  it('Debe exportar exitosamente a Excel un lote mixto que incluye CFDI A y CFDI B', () => {
    const xmlA = fs.readFileSync(CFDI_A_PATH, 'utf-8');
    const xmlB = fs.readFileSync(CFDI_B_PATH, 'utf-8');

    const invA = parseCfdiXml(xmlA, 'CFDI A.xml', xmlA.length);
    const invB = parseCfdiXml(xmlB, 'CFDI B.xml', xmlB.length);

    expect(() => exportInvoicesToExcel([invA, invB], 'test_export.xlsx')).not.toThrow();
    expect(writtenFiles.length).toBe(1);

    const { wb, fileName } = writtenFiles[0];
    expect(fileName).toBe('test_export.xlsx');
    expect(wb.SheetNames).toEqual(['Facturas', 'Conceptos', 'Impuestos']);

    // Check Facturas sheet has 2 data rows
    const facturasSheet = wb.Sheets['Facturas'];
    const facturasData = XLSX.utils.sheet_to_json(facturasSheet);
    expect(facturasData.length).toBe(2);

    // Check Conceptos sheet has items from both
    const conceptosSheet = wb.Sheets['Conceptos'];
    const conceptosData = XLSX.utils.sheet_to_json(conceptosSheet);
    expect(conceptosData.length).toBeGreaterThanOrEqual(2);

    // Check Impuestos sheet has tax items from both
    const impuestosSheet = wb.Sheets['Impuestos'];
    const impuestosData = XLSX.utils.sheet_to_json(impuestosSheet);
    expect(impuestosData.length).toBeGreaterThanOrEqual(2);
  });
});
