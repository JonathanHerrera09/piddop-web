import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ApiError } from '@/services/http';
import { createAdminSettlement, downloadSettlementPdf, getAdminSettlementOverview, getCompanySettlementOverview, getSettlementDetail, markAdminSettlementPaid, previewAdminSettlement } from '@/services/dashboard.service';
import type { CompanySettlement, CompanySummary, SettlementOverview, SettlementPreview } from '@/types/dashboard';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' });
const today = new Date();
const isoDate = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

function ActionGlyph({ name }: { name: 'view' | 'download' | 'payment' }) {
  const paths = name === 'view'
    ? <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>
    : name === 'download'
      ? <><path d="M12 3v12M7 10l5 5 5-5M4 21h16" /></>
      : <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>;
  return <svg aria-hidden="true" className="action-glyph" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>;
}

export function SettlementsPanel({ accessToken, companies = [], companyId, settlements, onChanged }: { accessToken: string; companies?: CompanySummary[]; companyId?: number; settlements: CompanySettlement[]; onChanged: () => void }) {
  const isAdmin = !companyId;
  const eligibleCompanies = companies.filter((company) => company.type !== 'services');
  const [form, setForm] = useState<{ company_id: number; date_from: string; date_to: string; notes: string; closure_type: 'weekly' | 'monthly' | 'custom'; paid_now: boolean; payout_reference: string; payout_method: string; paid_at: string }>({
    company_id: eligibleCompanies[0]?.id || 0,
    date_from: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    date_to: isoDate(today),
    notes: '', closure_type: 'monthly', paid_now: false, payout_reference: '', payout_method: 'Transferencia bancaria', paid_at: isoDate(today)
  });
  const [preview, setPreview] = useState<SettlementPreview | null>(null);
  const [overview, setOverview] = useState<SettlementOverview | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [detail, setDetail] = useState<CompanySettlement | null>(null);
  const [payment, setPayment] = useState<{ id: number; amount: number; reference: string; method: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const fail = (cause: unknown, fallback: string) => setError(cause instanceof ApiError || cause instanceof Error ? cause.message : fallback);

  async function refreshOverview() {
    const selectedCompanyId = companyId || form.company_id;
    if (!selectedCompanyId || !/^\d{4}-\d{2}-\d{2}$/.test(form.date_from) || !/^\d{4}-\d{2}-\d{2}$/.test(form.date_to)) return;
    try {
      const result = companyId
        ? await getCompanySettlementOverview(accessToken, companyId, form.date_from, form.date_to)
        : await getAdminSettlementOverview(accessToken, selectedCompanyId, form.date_from, form.date_to);
      setOverview(result);
    } catch (cause) {
      fail(cause, 'No pudimos cargar el resumen financiero.');
    }
  }

  useEffect(() => {
    setOverview(null);
    setPreview(null);
    void refreshOverview();
  }, [accessToken, companyId, form.company_id, form.date_from, form.date_to]);

  async function handlePreview() {
    if (!form.company_id || !form.date_from || !form.date_to) return setError('Selecciona empresa y rango de fechas.');
    setPending(true); setError(null);
    try { setPreview(await previewAdminSettlement(accessToken, { company_id: form.company_id, date_from: form.date_from, date_to: form.date_to })); }
    catch (cause) { fail(cause, 'No pudimos calcular la liquidación.'); }
    finally { setPending(false); }
  }
  async function handleIssue() {
    if (form.paid_now && Number(preview?.totals.amount_payable || 0) > 0 && !form.payout_reference.trim()) return setError('Escribe la referencia del desembolso para cerrar como pagado.');
    setPending(true); setError(null);
    try { await createAdminSettlement(accessToken, { ...form, payout_reference: form.payout_reference.trim() || undefined }); setPreview(null); setIssueOpen(false); await refreshOverview(); onChanged(); }
    catch (cause) { fail(cause, 'No pudimos emitir la liquidación.'); }
    finally { setPending(false); }
  }
  async function handleDetail(item: CompanySettlement) {
    setPending(true); setError(null);
    try { setDetail(await getSettlementDetail(accessToken, item.id, companyId)); }
    catch (cause) { fail(cause, 'No pudimos cargar el detalle.'); }
    finally { setPending(false); }
  }
  async function handleDownload(item: CompanySettlement) {
    setPending(true); setError(null);
    try {
      const blob = await downloadSettlementPdf(accessToken, item.id, companyId); const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${item.settlement_number}.pdf`; link.click(); URL.revokeObjectURL(url);
    } catch (cause) { fail(cause, 'No pudimos descargar el PDF.'); } finally { setPending(false); }
  }
  async function handlePaid() {
    if (!payment || (payment.amount > 0 && !payment.reference.trim())) return setError('Escribe la referencia bancaria del pago.');
    setPending(true); setError(null);
    try { await markAdminSettlementPaid(accessToken, payment.id, { payout_reference: payment.reference.trim(), payout_method: payment.method }); setPayment(null); onChanged(); }
    catch (cause) { fail(cause, 'No pudimos registrar el pago.'); }
    finally { setPending(false); }
  }

  return <section className="settlements-panel">
    {isAdmin ? <section className={`settlement-form ${isFormCollapsed ? 'is-collapsed' : ''}`}>
      <div className="settlement-form__header"><div><h3>Nueva liquidación PSE</h3><p>El periodo usa la fecha efectiva del pago. Sólo incluye pedidos entregados, pagados por PSE y todavía no liquidados.</p></div><button className="settlement-form__toggle" type="button" aria-expanded={!isFormCollapsed} onClick={() => setIsFormCollapsed((collapsed) => !collapsed)}>{isFormCollapsed ? 'Mostrar formulario' : 'Ocultar formulario'}</button></div>
      <div className="settlement-form__body">
      <div className="settlement-form__fields">
        <label>Empresa<select value={form.company_id} onChange={(event) => setForm({ ...form, company_id: Number(event.target.value) })}><option value={0}>Seleccionar</option>{eligibleCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
        <label>Tipo de cierre<select value={form.closure_type} onChange={(event) => setForm({ ...form, closure_type: event.target.value as typeof form.closure_type })}><option value="weekly">Semanal</option><option value="monthly">Mensual</option><option value="custom">Personalizado</option></select></label>
        <label>Desde<input type="date" value={form.date_from} onChange={(event) => setForm({ ...form, date_from: event.target.value })} /></label>
        <label>Hasta<input type="date" value={form.date_to} onChange={(event) => setForm({ ...form, date_to: event.target.value })} /></label>
        <label className="settlement-paid-toggle"><input type="checkbox" checked={form.paid_now} onChange={(event) => setForm({ ...form, paid_now: event.target.checked })} /><span>Registrar este cierre como pagado</span></label>
        {form.paid_now ? <><label>Método del desembolso<input value={form.payout_method} maxLength={50} onChange={(event) => setForm({ ...form, payout_method: event.target.value })} /></label><label>Referencia del pago<input value={form.payout_reference} maxLength={191} onChange={(event) => setForm({ ...form, payout_reference: event.target.value })} /></label><label>Fecha del pago<input type="date" value={form.paid_at} onChange={(event) => setForm({ ...form, paid_at: event.target.value })} /></label></> : null}
        <label className="settlement-form__notes">Notas<textarea rows={2} maxLength={1000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
      </div><button className="primary-button" disabled={pending} type="button" onClick={() => void handlePreview()}>{pending ? 'Calculando…' : 'Calcular vista previa'}</button>
      </div>
    </section> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {overview ? <SettlementOverviewCards overview={overview} /> : null}
    {preview ? <section className="settlement-preview">
      <div className="panel-card__header panel-card__header--spread"><div><h3>Vista previa - {preview.company.name}</h3><p>{date.format(new Date(preview.period_start))} al {date.format(new Date(preview.period_end))}</p></div><button className="primary-button" type="button" onClick={() => setIssueOpen(true)}>Guardar cierre</button></div>
      <SettlementTotals settlement={{ ...preview.totals, delivery_fees: preview.totals.delivery_fees, customer_paid_total: preview.totals.customer_paid_total } as CompanySettlement} />
      <SettlementItems items={preview.items} />
    </section> : null}
    <section className="settlement-list">
      {settlements.map((item) => <article className="settlement-card" key={item.id}>
        <div><strong>{item.settlement_number}</strong><p>{item.company?.name} · {item.closure_type === 'weekly' ? 'Cierre semanal' : item.closure_type === 'monthly' ? 'Cierre mensual' : 'Cierre personalizado'} · {date.format(new Date(item.period_start))} - {date.format(new Date(item.period_end))}</p><small>Vendió {money.format(Number(item.period_total_sales || 0))} · Recargó {money.format(Number(item.period_topups || 0))} · PSE a pagar {money.format(Number(item.amount_payable))}</small></div>
        <span className={`status-badge status-badge--${item.status}`}>{item.status === 'paid' ? 'Pagado' : 'Pendiente de pago'}</span>
        <div className="settlement-card__actions"><button className="secondary-button inline-action action-with-icon" title="Ver detalle" type="button" onClick={() => void handleDetail(item)}><ActionGlyph name="view" /><span>Detalle</span></button><button className="secondary-button inline-action action-with-icon" title="Descargar PDF" type="button" onClick={() => void handleDownload(item)}><ActionGlyph name="download" /><span>PDF</span></button>{isAdmin && item.status === 'issued' ? <button className="primary-button inline-action action-with-icon" title="Registrar pago" type="button" onClick={() => setPayment({ id: item.id, amount: Number(item.amount_payable || 0), reference: '', method: 'Transferencia bancaria' })}><ActionGlyph name="payment" /><span>Registrar pago</span></button> : null}</div>
      </article>)}
      {!settlements.length ? <p className="empty-results">Todavía no hay liquidaciones para mostrar.</p> : null}
    </section>
    {detail ? <section className="settlement-preview"><div className="panel-card__header panel-card__header--spread"><div><h3>{detail.settlement_number}</h3><p>Huella: <code>{detail.document_hash}</code></p></div><button className="secondary-button" type="button" onClick={() => setDetail(null)}>Cerrar</button></div><ClosureSnapshot settlement={detail} /><SettlementTotals settlement={detail} /><SettlementItems items={detail.items || []} />{detail.status === 'paid' ? <p className="settlement-paid">Pago: {detail.payout_method} · {detail.payout_reference} · {detail.paid_at ? date.format(new Date(detail.paid_at)) : ''}</p> : null}</section> : null}
    {payment ? <section className="settlement-payment"><h3>Registrar pago realizado</h3><label>Método<input value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value })} /></label><label>Referencia bancaria<input value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} /></label><div className="form-actions"><button className="secondary-button" type="button" onClick={() => setPayment(null)}>Cancelar</button><button className="primary-button" disabled={pending} type="button" onClick={() => void handlePaid()}>Confirmar pago</button></div></section> : null}
    <ConfirmDialog open={issueOpen} title="Guardar cierre financiero" message={`Se guardará la fotografía del periodo y ${preview?.items.length || 0} pedidos PSE quedarán bloqueados para evitar pagos duplicados. Saldo PSE: ${money.format(Number(preview?.totals.amount_payable || 0))}. ¿Confirmas que revisaste el detalle y el estado de pago?`} confirmLabel="Guardar cierre" pending={pending} onCancel={() => !pending && setIssueOpen(false)} onConfirm={() => void handleIssue()} />
  </section>;
}

function ClosureSnapshot({ settlement }: { settlement: CompanySettlement }) {
  return <section className="closure-snapshot">
    <h4>Fotografía financiera guardada en el cierre</h4>
    <div className="settlement-overview__grid">
      <article><span>Ventas del periodo</span><strong>{money.format(Number(settlement.period_total_sales || 0))}</strong><small>{settlement.period_orders_count || 0} pedidos pagados</small></article>
      <article><span>Ventas PSE / efectivo</span><strong>{money.format(Number(settlement.period_pse_sales || 0))} / {money.format(Number(settlement.period_cash_sales || 0))}</strong></article>
      <article><span>Recargas / comisiones</span><strong>{money.format(Number(settlement.period_topups || 0))} / {money.format(Number(settlement.period_commissions || 0))}</strong></article>
      <article><span>Saldo inicial de cartera</span><strong>{money.format(Number(settlement.opening_wallet_balance || 0))}</strong></article>
      <article><span>Saldo final de cartera</span><strong>{money.format(Number(settlement.closing_wallet_balance || 0))}</strong></article>
      <article><span>Saldo PSE del cierre</span><strong>{money.format(Number(settlement.amount_payable || 0))}</strong><small>{settlement.status === 'paid' ? 'Pagado' : 'Pendiente de pago'}</small></article>
    </div>
  </section>;
}

function SettlementOverviewCards({ overview }: { overview: SettlementOverview }) {
  return <section className="settlement-overview" aria-label="Resumen financiero del periodo">
    <div className="settlement-overview__heading">
      <div><span className="eyebrow">Conciliación del periodo</span><h3>Ventas, recargas y dinero PSE</h3></div>
      <span className={`status-badge status-badge--${overview.wallet.status}`}>{overview.wallet.status === 'active' ? 'Cartera activa' : overview.wallet.status === 'low_balance' ? 'Saldo bajo' : 'Sin saldo'}</span>
    </div>
    <div className="settlement-overview__grid">
      <article><span>Ventas pagadas</span><strong>{money.format(Number(overview.sales.total_sales))}</strong><small>{overview.sales.orders} pedidos entregados</small></article>
      <article><span>Ventas por PSE</span><strong>{money.format(Number(overview.sales.pse_sales))}</strong><small>Venta de productos, sin domicilio</small></article>
      <article><span>Ventas en efectivo</span><strong>{money.format(Number(overview.sales.cash_sales))}</strong><small>No hacen parte del pago PSE</small></article>
      <article><span>Recargas del periodo</span><strong>{money.format(Number(overview.wallet.period.topups))}</strong><small>Saldo ingresado a la cartera</small></article>
      <article><span>Comisiones cobradas</span><strong>{money.format(Number(overview.wallet.period.commissions))}</strong><small>Descontadas de la cartera</small></article>
      <article><span>Saldo actual de cartera</span><strong>{money.format(Number(overview.wallet.balance))}</strong><small>Disponible para próximas comisiones</small></article>
    </div>
    <div className="settlement-reconciliation">
      <div><span>PSE total a favor de la empresa</span><strong>{money.format(Number(overview.pse.total_payable))}</strong></div>
      <span className="settlement-reconciliation__operator">=</span>
      <div><span>Ya incluido en liquidaciones</span><strong>{money.format(Number(overview.pse.already_settled))}</strong></div>
      <span className="settlement-reconciliation__operator">+</span>
      <div className="settlement-reconciliation__pending"><span>Pendiente por liquidar</span><strong>{money.format(Number(overview.pse.pending_payable))}</strong><small>{overview.pse.pending_orders} pedidos</small></div>
    </div>
    <p className="settlement-overview__note">Las recargas pertenecen a la cartera usada para pagar comisiones. No se suman al dinero PSE que la plataforma debe transferir a la empresa.</p>
  </section>;
}

function SettlementTotals({ settlement }: { settlement: CompanySettlement }) {
  return <div className="settlement-totals"><div><span>Venta bruta</span><strong>{money.format(Number(settlement.gross_sales))}</strong></div><div><span>Descuentos</span><strong>- {money.format(Number(settlement.discounts))}</strong></div><div><span>Venta neta</span><strong>{money.format(Number(settlement.net_product_sales))}</strong></div><div><span>Comisión</span><strong>- {money.format(Number(settlement.platform_commission))}</strong></div><div className="settlement-totals__payable"><span>A pagar a empresa</span><strong>{money.format(Number(settlement.amount_payable))}</strong></div><div><span>Domicilios informativos</span><strong>{money.format(Number(settlement.delivery_fees))}</strong></div></div>;
}
function SettlementItems({ items }: { items: SettlementPreview['items'] }) {
  return <div className="settlement-items"><div className="settlement-items__head"><span>Pedido / pago</span><span>Venta neta</span><span>Comisión</span><span>A pagar</span></div>{items.map((item) => <div className="settlement-items__row" key={item.order_id}><span data-label="Pedido / pago"><strong>{item.order_number}</strong><small>{date.format(new Date(item.paid_at))} · {item.payment_provider || 'PSE'} · {item.payment_reference || 'Sin referencia'}</small></span><span data-label="Venta neta">{money.format(Number(item.net_product_sale))}</span><span data-label="Comisión">{money.format(Number(item.commission_amount))}</span><strong data-label="A pagar">{money.format(Number(item.company_payable))}</strong></div>)}</div>;
}
