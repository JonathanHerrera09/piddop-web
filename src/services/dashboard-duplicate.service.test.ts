import { afterEach, describe, expect, it, vi } from 'vitest';
import { duplicateCompanyProduct, duplicateCompanyVariant } from './dashboard.service';

function apiResponse(key: 'product' | 'variant', id: number) {
  return new Response(JSON.stringify({ success: true, message: 'ok', data: { [key]: { id, name: 'Copia' } } }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('dashboard duplication services', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses the protected copy endpoints for products and variants', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(apiResponse('product', 20))
      .mockResolvedValueOnce(apiResponse('variant', 30));
    vi.stubGlobal('fetch', fetchMock);

    await duplicateCompanyProduct('token', 7, 2);
    await duplicateCompanyVariant('token', 7, 3);

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/company\/products\/2\/duplicate$/);
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/company\/variants\/3\/duplicate$/);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST' });
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST' });
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ 'X-Company-Id': '7' });
  });
});
