import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductVariantPricingEditor } from './DashboardWorkspace';

describe('ProductVariantPricingEditor', () => {
  it('edits root and nested option prices for the current product', () => {
    const onPriceChange = vi.fn();
    render(
      <ProductVariantPricingEditor
        onPriceChange={onPriceChange}
        prices={{ 10: '8000', 20: '3000' }}
        variant={{
          id: 1,
          name: 'Presentación',
          selection_type: 'single',
          required: true,
          min_selections: 1,
          max_selections: 1,
          status: 'active',
          options: [{
            id: 10,
            name: 'Combo',
            status: 'active',
            childVariants: [{
              id: 2,
              name: 'Bebida',
              selection_type: 'single',
              required: true,
              min_selections: 1,
              max_selections: 1,
              status: 'active',
              options: [{ id: 20, name: 'Jugo natural', status: 'active' }]
            }]
          }]
        }}
      />
    );

    expect(screen.getByLabelText('Precio adicional de Combo')).toHaveValue(8000);
    expect(screen.getByLabelText('Precio adicional de Jugo natural')).toHaveValue(3000);
    fireEvent.change(screen.getByLabelText('Precio adicional de Combo'), { target: { value: '9500' } });
    expect(onPriceChange).toHaveBeenCalledWith(10, '9500');
  });
});
