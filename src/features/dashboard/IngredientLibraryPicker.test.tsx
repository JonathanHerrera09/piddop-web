import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IngredientLibraryPicker } from './IngredientLibraryPicker';

const cheese = { name: 'Queso', is_default: true, is_removable: true, usage_count: 3 };

describe('IngredientLibraryPicker', () => {
  it('allows selecting a saved ingredient and marks ingredients already added', () => {
    const onSelect = vi.fn();
    render(
      <IngredientLibraryPicker
        currentNames={['Tomate']}
        items={[cheese]}
        onCreate={vi.fn()}
        onQueryChange={vi.fn()}
        onSelect={onSelect}
        query="que"
      />
    );

    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: /queso/i }));
    expect(onSelect).toHaveBeenCalledWith(cheese);
  });

  it('does not render thousands of suggestions before the user searches', () => {
    render(
      <IngredientLibraryPicker
        currentNames={[]}
        items={[cheese]}
        onCreate={vi.fn()}
        onQueryChange={vi.fn()}
        onSelect={vi.fn()}
        query=""
      />
    );

    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('selects the highlighted autocomplete result with the keyboard', () => {
    const onSelect = vi.fn();
    render(
      <IngredientLibraryPicker
        currentNames={[]}
        items={[cheese]}
        onCreate={vi.fn()}
        onQueryChange={vi.fn()}
        onSelect={onSelect}
        query="queso"
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(cheese);
  });

  it('offers to create a searched ingredient only when it does not exist', () => {
    const onCreate = vi.fn();
    const { rerender } = render(
      <IngredientLibraryPicker
        currentNames={[]}
        items={[]}
        onCreate={onCreate}
        onQueryChange={vi.fn()}
        onSelect={vi.fn()}
        query="Pepinillos"
      />
    );

    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: /crear y agregar/i }));
    expect(onCreate).toHaveBeenCalledWith('Pepinillos');

    rerender(
      <IngredientLibraryPicker
        currentNames={[]}
        items={[{ ...cheese, name: 'Pepinillos' }]}
        onCreate={onCreate}
        onQueryChange={vi.fn()}
        onSelect={vi.fn()}
        query="pepinillos"
      />
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.queryByRole('button', { name: /crear y agregar/i })).not.toBeInTheDocument();
  });
});
