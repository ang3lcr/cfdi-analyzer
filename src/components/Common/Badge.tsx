import React from 'react';
import type { VoucherType } from '../../types/invoice';

interface BadgeProps {
  type?: VoucherType;
  label?: string;
  variant?: 'voucher' | 'neutral' | 'accent' | 'warning';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  label,
  variant = 'voucher',
  size = 'md',
}) => {
  let text = label;
  let bg = 'rgba(208, 221, 208, 0.4)';
  let color = '#000000';
  let border = 'rgba(114, 125, 115, 0.3)';

  if (variant === 'voucher' && type) {
    const code = type.toUpperCase();
    switch (code) {
      case 'I':
        text = text || 'Ingreso';
        bg = 'rgba(170, 185, 154, 0.4)'; // accent tint
        color = '#000000';
        border = 'rgba(114, 125, 115, 0.5)';
        break;
      case 'E':
        text = text || 'Egreso';
        bg = 'rgba(208, 221, 208, 0.6)';
        color = '#252e25';
        border = 'rgba(114, 125, 115, 0.4)';
        break;
      case 'P':
        text = text || 'Pago';
        bg = 'rgba(230, 235, 217, 0.9)';
        color = '#222222';
        border = 'rgba(114, 125, 115, 0.4)';
        break;
      case 'N':
        text = text || 'Nómina';
        bg = 'rgba(170, 185, 154, 0.25)';
        color = '#1f291f';
        border = 'rgba(114, 125, 115, 0.35)';
        break;
      case 'T':
        text = text || 'Traslado';
        bg = 'rgba(114, 125, 115, 0.15)';
        color = '#000000';
        border = 'rgba(114, 125, 115, 0.3)';
        break;
      case 'R':
        text = text || 'Retención';
        bg = 'rgba(114, 125, 115, 0.28)';
        color = '#152015';
        border = 'rgba(114, 125, 115, 0.45)';
        break;
      default:
        text = text || type;
        bg = 'rgba(208, 221, 208, 0.35)';
        color = '#000000';
        border = 'rgba(114, 125, 115, 0.25)';
    }
  } else if (variant === 'accent') {
    bg = 'rgba(170, 185, 154, 0.5)';
    color = '#000000';
    border = 'rgba(114, 125, 115, 0.4)';
  } else if (variant === 'warning') {
    bg = 'rgba(208, 221, 208, 0.5)';
    color = '#432a10';
    border = 'rgba(114, 125, 115, 0.5)';
  }

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: '6px',
        padding: isSmall ? '0.1rem 0.45rem' : '0.2rem 0.65rem',
        fontSize: isSmall ? '0.72rem' : '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.015em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};
