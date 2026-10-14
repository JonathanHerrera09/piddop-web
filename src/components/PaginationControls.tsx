import type { PaginationMeta } from '@/services/dashboard.service';

interface Props {
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationControls({ pagination, onPageChange, onPageSizeChange }: Props) {
  if (!pagination || pagination.total_items === 0) return null;
  const first = (pagination.page - 1) * pagination.page_size + 1;
  const last = Math.min(pagination.page * pagination.page_size, pagination.total_items);
  return (
    <div className="pagination-controls" aria-label="Paginación">
      <span>{first}–{last} de {pagination.total_items}</span>
      <div className="pagination-controls__actions">
        <label htmlFor="page-size" className="sr-only">Elementos por página</label>
        <select id="page-size" value={pagination.page_size} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="pagination-controls__select">
          {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}/página</option>)}
        </select>
        <button type="button" disabled={!pagination.has_previous} onClick={() => onPageChange(pagination.page - 1)} className="pagination-controls__button">Anterior</button>
        <span aria-live="polite">Página {pagination.page} de {pagination.total_pages || 1}</span>
        <button type="button" disabled={!pagination.has_next} onClick={() => onPageChange(pagination.page + 1)} className="pagination-controls__button">Siguiente</button>
      </div>
    </div>
  );
}
