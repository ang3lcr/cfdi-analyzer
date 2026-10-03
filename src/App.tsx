import React, { useState, useMemo, useCallback, useRef } from 'react';
import type {
  Invoice,
  InvoiceParseError,
  InvoiceFilters,
  SortConfig,
  TableColumnConfig,
} from './types/invoice';
import { parseCfdiXml } from './services/invoiceParser';
import { exportInvoicesToExcel } from './services/excelExporter';
import { SAMPLE_CFDI_FILES } from './services/sampleInvoices';
import { isDuplicateUUID, isXmlFile } from './utils/validation';

import { Header } from './components/Header/Header';
import { UploadZone } from './components/UploadZone/UploadZone';
import { Dashboard } from './components/Dashboard/Dashboard';
import { FilterBar } from './components/Filters/FilterBar';
import { InvoiceTable } from './components/InvoiceTable/InvoiceTable';
import { Pagination } from './components/InvoiceTable/Pagination';
import { InvoiceDetailModal } from './components/InvoiceDetail/InvoiceDetailModal';
import { ColumnSelectorModal } from './components/InvoiceTable/ColumnSelectorModal';
import { ErrorList } from './components/ErrorList/ErrorList';
import { EmptyState } from './components/EmptyState/EmptyState';
import { ConfirmDialog } from './components/Common/ConfirmDialog';
import { ToastContainer, type ToastMessage } from './components/Common/Toast';

const DEFAULT_COLUMNS: TableColumnConfig[] = [
  { id: 'voucherType', label: 'Tipo', visible: true, isDefault: true },
  { id: 'uuid', label: 'Folio Fiscal (UUID)', visible: true, isDefault: true },
  { id: 'folio', label: 'Folio', visible: true, isDefault: true },
  { id: 'serie', label: 'Serie', visible: false, isDefault: false },
  { id: 'issueDate', label: 'Fecha Emisión', visible: true, isDefault: true },
  { id: 'certificationDate', label: 'Fecha Certificación', visible: false, isDefault: false },
  { id: 'emitterRfc', label: 'RFC Emisor', visible: true, isDefault: true },
  { id: 'emitterName', label: 'Emisor', visible: true, isDefault: true },
  { id: 'emitterRegime', label: 'Régimen Emisor', visible: false, isDefault: false },
  { id: 'receiverRfc', label: 'RFC Receptor', visible: true, isDefault: true },
  { id: 'receiverName', label: 'Receptor', visible: true, isDefault: true },
  { id: 'receiverRegime', label: 'Régimen Receptor', visible: false, isDefault: false },
  { id: 'receiverPostal', label: 'CP Receptor', visible: false, isDefault: false },
  { id: 'cfdiUse', label: 'Uso CFDI', visible: false, isDefault: false },
  { id: 'paymentMethod', label: 'Método Pago', visible: true, isDefault: true },
  { id: 'paymentForm', label: 'Forma Pago', visible: false, isDefault: false },
  { id: 'currency', label: 'Moneda', visible: false, isDefault: false },
  { id: 'subtotal', label: 'Subtotal', visible: true, isDefault: true },
  { id: 'discount', label: 'Descuento', visible: false, isDefault: false },
  { id: 'iva', label: 'IVA', visible: true, isDefault: true },
  { id: 'otherTaxes', label: 'Otros Imp.', visible: false, isDefault: false },
  { id: 'retainedTaxes', label: 'Retenciones', visible: false, isDefault: false },
  { id: 'total', label: 'Total', visible: true, isDefault: true },
  { id: 'conceptsSummary', label: 'Conceptos', visible: true, isDefault: true },
  { id: 'expeditionPlace', label: 'Lugar Exp.', visible: false, isDefault: false },
  { id: 'version', label: 'Versión CFDI', visible: false, isDefault: false },
  { id: 'fileName', label: 'Archivo XML', visible: false, isDefault: false },
];

export const App: React.FC = () => {
  // Main state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [errors, setErrors] = useState<InvoiceParseError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });

  // Table selection & detail modal
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filters & sorting
  const [filters, setFilters] = useState<InvoiceFilters>({
    searchTerm: '',
    voucherType: '',
    dateStart: '',
    dateEnd: '',
    paymentMethod: '',
    currency: '',
    emitterRfc: '',
    receiverRfc: '',
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'issueDate',
    direction: 'desc',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Column customization
  const [columns, setColumns] = useState<TableColumnConfig[]>(DEFAULT_COLUMNS);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  // Confirm dialogs & Toasts
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hidden file input for header action
  const headerFileInputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Process files in batches to keep UI responsive
  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setIsProcessing(true);
      setProgress({ current: 0, total: files.length, fileName: '' });

      const newInvoices: Invoice[] = [];
      const newErrors: InvoiceParseError[] = [];
      const existingUuids = new Set<string>(invoices.map((inv) => inv.uuid.toUpperCase()));

      // Read and process in batches of 15
      const BATCH_SIZE = 15;
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (file, batchIndex) => {
            const currentIndex = i + batchIndex + 1;
            setProgress({
              current: currentIndex,
              total: files.length,
              fileName: file.name,
            });

            // Validate extension / MIME
            if (!isXmlFile(file)) {
              newErrors.push({
                fileName: file.name,
                reason: 'El archivo no tiene extensión .xml o formato XML válido.',
                timestamp: Date.now(),
              });
              return;
            }

            try {
              const text = await file.text();
              const invoice = parseCfdiXml(text, file.name, file.size);

              // Check duplicates
              if (isDuplicateUUID(invoice.uuid, existingUuids)) {
                newErrors.push({
                  fileName: file.name,
                  reason: `Factura duplicada: El UUID (${invoice.uuid}) ya había sido importado previamente.`,
                  timestamp: Date.now(),
                });
                return;
              }

              existingUuids.add(invoice.uuid.toUpperCase());
              newInvoices.push(invoice);
            } catch (err: any) {
              newErrors.push({
                fileName: file.name,
                reason: err.message || 'Error desconocido al procesar el archivo XML.',
                timestamp: Date.now(),
              });
            }
          })
        );

        // Small micro-yield to keep animations smooth
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      setInvoices((prev) => [...newInvoices, ...prev]);
      if (newErrors.length > 0) {
        setErrors((prev) => [...newErrors, ...prev]);
      }

      setIsProcessing(false);
      setProgress({ current: 0, total: 0, fileName: '' });

      if (newInvoices.length > 0) {
        addToast(
          'success',
          `${newInvoices.length} factura${newInvoices.length > 1 ? 's' : ''} procesada${newInvoices.length > 1 ? 's' : ''} con éxito`,
          newErrors.length > 0 ? `${newErrors.length} archivo(s) tuvieron observaciones.` : undefined
        );
      } else if (newErrors.length > 0) {
        addToast('error', 'No se pudieron procesar los archivos', `${newErrors.length} archivo(s) con errores.`);
      }
    },
    [invoices, addToast]
  );

  // Load sample invoices
  const handleLoadSamples = useCallback(() => {
    setIsProcessing(true);
    const existingUuids = new Set<string>(invoices.map((inv) => inv.uuid.toUpperCase()));
    const newInvoices: Invoice[] = [];
    const newErrors: InvoiceParseError[] = [];

    SAMPLE_CFDI_FILES.forEach((sample) => {
      try {
        const inv = parseCfdiXml(sample.xml, sample.name, sample.xml.length);
        if (isDuplicateUUID(inv.uuid, existingUuids)) {
          newErrors.push({
            fileName: sample.name,
            reason: `UUID ya existente: ${inv.uuid}`,
            timestamp: Date.now(),
          });
          return;
        }
        existingUuids.add(inv.uuid.toUpperCase());
        newInvoices.push(inv);
      } catch (err: any) {
        newErrors.push({
          fileName: sample.name,
          reason: err.message,
          timestamp: Date.now(),
        });
      }
    });

    setInvoices((prev) => [...newInvoices, ...prev]);
    if (newErrors.length > 0) {
      setErrors((prev) => [...newErrors, ...prev]);
    }
    setIsProcessing(false);

    if (newInvoices.length > 0) {
      addToast(
        'success',
        `${newInvoices.length} facturas de ejemplo cargadas`,
        'Incluye CFDI 4.0 de Ingreso, Pagos REP, Egreso y CFDI 3.3.'
      );
    }
  }, [invoices, addToast]);

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    if (invoices.length === 0) return;
    try {
      exportInvoicesToExcel(invoices);
      addToast(
        'success',
        'Archivo Excel descargado',
        'Se generó el libro con las hojas Facturas, Conceptos e Impuestos.'
      );
    } catch (err: any) {
      addToast('error', 'Error al exportar a Excel', err.message);
    }
  }, [invoices, addToast]);

  // Clear all data
  const handleConfirmClear = useCallback(() => {
    setInvoices([]);
    setErrors([]);
    setSelectedIds(new Set());
    setSelectedInvoice(null);
    setIsConfirmClearOpen(false);
    addToast('info', 'Registros eliminados', 'Se han limpiado todas las facturas cargadas.');
  }, [addToast]);

  // Individual delete
  const handleDeleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    addToast('info', 'Comprobante eliminado');
  }, [addToast]);

  // Batch delete selected
  const handleDeleteSelected = useCallback(() => {
    const count = selectedIds.size;
    if (count === 0) return;
    setInvoices((prev) => prev.filter((inv) => !selectedIds.has(inv.id)));
    setSelectedIds(new Set());
    addToast('info', `${count} factura${count > 1 ? 's' : ''} eliminada${count > 1 ? 's' : ''}`);
  }, [selectedIds, addToast]);

  // Copy UUID
  const handleCopyUuid = useCallback(
    (uuid: string) => {
      navigator.clipboard.writeText(uuid);
      addToast('success', 'UUID copiado al portapapeles', uuid);
    },
    [addToast]
  );

  // Selection handlers
  const handleToggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map((inv) => inv.id)));
    }
  }, [selectedIds.size, invoices]);

  // Sorting
  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // Column toggling
  const handleToggleColumn = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, visible: !c.visible } : c))
    );
  }, []);

  const handleResetColumns = useCallback(() => {
    setColumns(DEFAULT_COLUMNS);
  }, []);

  const handleSelectAllColumns = useCallback(() => {
    setColumns((prev) => prev.map((c) => ({ ...c, visible: true })));
  }, []);

  // Available currencies for filter dropdown
  const availableCurrencies = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.payment.currency) set.add(inv.payment.currency);
    });
    return Array.from(set);
  }, [invoices]);

  // Filtered and Sorted Invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let result = invoices.filter((inv) => {
      // 1. Search term
      if (filters.searchTerm) {
        const query = filters.searchTerm.toLowerCase().trim();
        const matchesUuid = inv.uuid.toLowerCase().includes(query);
        const matchesFolio = inv.folio?.toLowerCase().includes(query);
        const matchesSerie = inv.serie?.toLowerCase().includes(query);
        const matchesEmitterRfc = inv.emitter.rfc.toLowerCase().includes(query);
        const matchesEmitterName = inv.emitter.name?.toLowerCase().includes(query);
        const matchesReceiverRfc = inv.receiver.rfc.toLowerCase().includes(query);
        const matchesReceiverName = inv.receiver.name?.toLowerCase().includes(query);
        const matchesConcept = inv.concepts.some((c) =>
          c.description.toLowerCase().includes(query)
        );

        if (
          !matchesUuid &&
          !matchesFolio &&
          !matchesSerie &&
          !matchesEmitterRfc &&
          !matchesEmitterName &&
          !matchesReceiverRfc &&
          !matchesReceiverName &&
          !matchesConcept
        ) {
          return false;
        }
      }

      // 2. Voucher Type
      if (filters.voucherType && inv.voucherType !== filters.voucherType) {
        return false;
      }

      // 3. Payment Method
      if (filters.paymentMethod && inv.payment.method !== filters.paymentMethod) {
        return false;
      }

      // 4. Currency
      if (filters.currency && inv.payment.currency !== filters.currency) {
        return false;
      }

      // 5. Date Start
      if (filters.dateStart) {
        const invDate = inv.issueDate.slice(0, 10);
        if (invDate < filters.dateStart) return false;
      }

      // 6. Date End
      if (filters.dateEnd) {
        const invDate = inv.issueDate.slice(0, 10);
        if (invDate > filters.dateEnd) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortConfig.key) {
        case 'voucherType':
          valA = a.voucherType;
          valB = b.voucherType;
          break;
        case 'uuid':
          valA = a.uuid;
          valB = b.uuid;
          break;
        case 'folio':
          valA = a.folio;
          valB = b.folio;
          break;
        case 'serie':
          valA = a.serie;
          valB = b.serie;
          break;
        case 'issueDate':
          valA = a.issueDate;
          valB = b.issueDate;
          break;
        case 'certificationDate':
          valA = a.certificationDate;
          valB = b.certificationDate;
          break;
        case 'emitterRfc':
          valA = a.emitter.rfc;
          valB = b.emitter.rfc;
          break;
        case 'emitterName':
          valA = a.emitter.name;
          valB = b.emitter.name;
          break;
        case 'receiverRfc':
          valA = a.receiver.rfc;
          valB = b.receiver.rfc;
          break;
        case 'receiverName':
          valA = a.receiver.name;
          valB = b.receiver.name;
          break;
        case 'subtotal':
          valA = a.amounts.subtotal;
          valB = b.amounts.subtotal;
          break;
        case 'iva':
          valA = a.amounts.transferredIVA;
          valB = b.amounts.transferredIVA;
          break;
        case 'total':
          valA = a.amounts.total;
          valB = b.amounts.total;
          break;
        case 'paymentMethod':
          valA = a.payment.method;
          valB = b.payment.method;
          break;
        default:
          valA = a.issueDate;
          valB = b.issueDate;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA || '');
      const strB = String(valB || '');
      const cmp = strA.localeCompare(strB);
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [invoices, filters, sortConfig]);

  // Paginated Slice
  const paginatedInvoices = useMemo(() => {
    if (pageSize >= filteredAndSortedInvoices.length) {
      return filteredAndSortedInvoices;
    }
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedInvoices.slice(start, start + pageSize);
  }, [filteredAndSortedInvoices, currentPage, pageSize]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hidden file input for header trigger */}
      <input
        ref={headerFileInputRef}
        type="file"
        multiple
        accept=".xml,text/xml,application/xml"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            processFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Main Header */}
      <Header
        invoiceCount={invoices.length}
        onImportClick={() => headerFileInputRef.current?.click()}
        onExportExcel={handleExportExcel}
        onClearClick={() => setIsConfirmClearOpen(true)}
        onLoadSamples={handleLoadSamples}
        isProcessing={isProcessing}
      />

      {/* Main Body */}
      <main className="container" style={{ flex: 1, padding: '1.75rem 1.5rem 3.5rem' }}>
        {/* Upload Zone (Compact when invoices exist, large when empty) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <UploadZone
            onFilesSelected={processFiles}
            isProcessing={isProcessing}
            progress={progress}
            compact={invoices.length > 0}
          />
        </div>

        {/* Error List Section */}
        <ErrorList
          errors={errors}
          onDismissError={(idx) => setErrors((prev) => prev.filter((_, i) => i !== idx))}
          onClearErrors={() => setErrors([])}
        />

        {/* When invoices exist: Dashboard & Main Table */}
        {invoices.length > 0 ? (
          <>
            {/* Top Dashboard Summary */}
            <Dashboard invoices={invoices} errorCount={errors.length} />

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={(f) => {
                setFilters(f);
                setCurrentPage(1);
              }}
              onOpenColumnSelector={() => setIsColumnSelectorOpen(true)}
              filteredCount={filteredAndSortedInvoices.length}
              totalCount={invoices.length}
              availableCurrencies={availableCurrencies}
            />

            {/* Main Table */}
            <InvoiceTable
              invoices={paginatedInvoices}
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              selectedIds={selectedIds}
              onToggleSelectRow={handleToggleSelectRow}
              onToggleSelectAll={handleToggleSelectAll}
              onViewInvoice={(inv) => setSelectedInvoice(inv)}
              onDeleteInvoice={handleDeleteInvoice}
              onCopyUuid={handleCopyUuid}
              onDeleteSelected={handleDeleteSelected}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredAndSortedInvoices.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </>
        ) : (
          !isProcessing && (
            <EmptyState
              onImportClick={() => headerFileInputRef.current?.click()}
              onLoadSamples={handleLoadSamples}
            />
          )
        )}
      </main>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onCopyUuid={handleCopyUuid}
      />

      {/* Column Selector Modal */}
      <ColumnSelectorModal
        isOpen={isColumnSelectorOpen}
        columns={columns}
        onToggleColumn={handleToggleColumn}
        onResetDefaults={handleResetColumns}
        onSelectAll={handleSelectAllColumns}
        onClose={() => setIsColumnSelectorOpen(false)}
      />

      {/* Confirm Clear Data Dialog */}
      <ConfirmDialog
        isOpen={isConfirmClearOpen}
        title="¿Limpiar todas las facturas?"
        message="Esta acción eliminará de la sesión actual todas las facturas XML importadas y sus estadísticas. No se puede deshacer."
        confirmLabel="Sí, limpiar todo"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmClear}
        onCancel={() => setIsConfirmClearOpen(false)}
      />

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
