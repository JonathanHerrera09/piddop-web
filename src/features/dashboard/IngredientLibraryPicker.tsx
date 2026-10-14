import { useId, useState } from 'react';
import type { IngredientLibraryItem } from '@/types/dashboard';

interface IngredientLibraryPickerProps {
  currentNames: string[];
  disabled?: boolean;
  items: IngredientLibraryItem[];
  loading?: boolean;
  onCreate: (name: string) => void;
  onQueryChange: (query: string) => void;
  onSelect: (ingredient: IngredientLibraryItem) => void;
  query: string;
}

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
}

export function IngredientLibraryPicker({
  currentNames,
  disabled = false,
  items,
  loading = false,
  onCreate,
  onQueryChange,
  onSelect,
  query
}: IngredientLibraryPickerProps) {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const current = new Set(currentNames.map(normalized));
  const exactMatch = items.some((item) => normalized(item.name) === normalized(query));
  const canSearch = query.trim().length >= 2;
  const canCreate = canSearch && !exactMatch && !current.has(normalized(query));
  const options = [
    ...items.map((item) => ({ kind: 'saved' as const, item })),
    ...(canCreate ? [{ kind: 'create' as const, name: query.trim() }] : [])
  ];
  const showDropdown = isOpen && canSearch;

  function choose(index: number) {
    const option = options[index];
    if (!option || disabled) return;
    if (option.kind === 'saved') {
      if (current.has(normalized(option.item.name))) return;
      onSelect(option.item);
    }
    else onCreate(option.name);
    setIsOpen(false);
  }

  return (
    <section className="ingredient-library" aria-label="Ingredientes guardados">
      <div className="ingredient-library__heading">
        <strong>Agregar un ingrediente guardado</strong>
        <p>Escribe al menos 2 letras para buscar o crear uno nuevo.</p>
      </div>
      <div className="ingredient-combobox">
        <label className="field ingredient-library__search">
          <span>Ingrediente</span>
          <input
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={showDropdown}
            autoComplete="off"
            onBlur={() => setIsOpen(false)}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setHighlightedIndex(0);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && options.length) {
                event.preventDefault();
                setIsOpen(true);
                setHighlightedIndex((currentIndex) => (currentIndex + 1) % options.length);
              } else if (event.key === 'ArrowUp' && options.length) {
                event.preventDefault();
                setHighlightedIndex((currentIndex) => (currentIndex - 1 + options.length) % options.length);
              } else if (event.key === 'Enter' && showDropdown && options.length) {
                event.preventDefault();
                choose(highlightedIndex);
              } else if (event.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            placeholder="Buscar ingrediente..."
            role="combobox"
            type="search"
            value={query}
          />
        </label>

        {showDropdown ? (
          <div className="ingredient-combobox__menu" id={listboxId} role="listbox">
            {loading ? <p className="ingredient-library__status">Buscando...</p> : null}
            {!loading && options.map((option, index) => {
              if (option.kind === 'create') {
                return (
                  <button
                    aria-selected={highlightedIndex === index}
                    className="ingredient-combobox__option ingredient-combobox__option--create"
                    disabled={disabled}
                    key={`create-${normalized(option.name)}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => choose(index)}
                    role="option"
                    type="button"
                  >
                    <span>Crear “{option.name}”</span>
                    <strong>Crear y agregar</strong>
                  </button>
                );
              }

              const isAdded = current.has(normalized(option.item.name));
              return (
                <button
                  aria-selected={highlightedIndex === index}
                  className="ingredient-combobox__option"
                  disabled={disabled || isAdded}
                  key={normalized(option.item.name)}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => choose(index)}
                  role="option"
                  type="button"
                >
                  <span>
                    <strong>{option.item.name}</strong>
                    <small>{option.item.usage_count === 1 ? 'Usado en 1 producto' : `Usado en ${option.item.usage_count} productos`}</small>
                  </span>
                  <b>{isAdded ? 'Agregado' : 'Seleccionar'}</b>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
