import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        maxWidth: '400px',
        width: 'calc(100vw - 3rem)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={18} color="#000000" />,
    error: <AlertCircle size={18} color="#000000" />,
    info: <Info size={18} color="#000000" />,
  };

  return (
    <div
      style={{
        pointerEvents: 'auto',
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(114, 125, 115, 0.35)',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        boxShadow: '0 8px 20px -3px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{ marginTop: '2px', flexShrink: 0 }}>{icons[toast.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#000000' }}>
          {toast.title}
        </div>
        {toast.message && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#727D73',
              marginTop: '0.2rem',
              wordBreak: 'break-word',
            }}
          >
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#727D73',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};
