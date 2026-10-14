import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PaginationControls } from './PaginationControls';

describe('PaginationControls', () => {
  it('shows range and emits page and page-size changes', () => {
    const onPageChange = vi.fn(); const onPageSizeChange = vi.fn();
    const { container } = render(<PaginationControls pagination={{ page: 2, page_size: 10, total_items: 25, total_pages: 3, has_previous: true, has_next: true }} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />);
    expect(container.querySelector('.pagination-controls')).toBeInTheDocument();
    expect(screen.getByText('11–20 de 25')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); fireEvent.change(screen.getByLabelText('Elementos por página'), { target: { value: '50' } });
    expect(onPageChange).toHaveBeenCalledWith(3); expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
