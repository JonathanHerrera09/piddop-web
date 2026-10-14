import { useCallback, useState } from 'react';
import type { ListOptions } from '@/services/dashboard.service';

export function usePagination(initial: ListOptions = {}) {
  const [options, setOptions] = useState<ListOptions>({ page: 1, page_size: 20, ...initial });
  const update = useCallback((changes: Partial<ListOptions>) => setOptions((current) => ({ ...current, ...changes, ...('search' in changes || 'status' in changes || 'type' in changes ? { page: 1 } : {}) })), []);
  return { options, setOptions, update, reset: () => setOptions({ page: 1, page_size: options.page_size || 20 }) };
}
