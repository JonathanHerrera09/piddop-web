import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettlementsPanel } from './SettlementsPanel';
import type { CompanySettlement } from '@/types/dashboard';

describe('SettlementsPanel', () => {
  it('shows a company its payable amount and PDF action without admin actions', () => {
    const settlement = {
      id: 1,
      settlement_number: 'LIQ-2026-00000001',
      company_id: 9,
      period_start: '2026-09-01T05:00:00.000Z',
      period_end: '2026-09-08T04:59:59.999Z',
      status: 'issued',
      currency: 'COP',
      order_count: 3,
      gross_sales: 230000,
      discounts: 15000,
      net_product_sales: 215000,
      delivery_fees: 18000,
      customer_paid_total: 233000,
      platform_commission: 21500,
      amount_payable: 193500,
      notes: null,
      payout_method: null,
      payout_reference: null,
      paid_at: null,
      issued_at: '2026-09-07T15:00:00.000Z',
      document_hash: 'a'.repeat(64),
      company: { id: 9, name: 'Empresa Demo', type: 'products', logo: null, status: 'active' }
    } as CompanySettlement;

    render(<SettlementsPanel accessToken="token" companyId={9} settlements={[settlement]} onChanged={vi.fn()} />);

    expect(screen.getByText('LIQ-2026-00000001')).toBeInTheDocument();
    expect(screen.getByText(/PSE a pagar.*193\.500/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Registrar pago' })).not.toBeInTheDocument();
    expect(screen.queryByText('Nueva liquidación PSE')).not.toBeInTheDocument();
  });
});
