import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/services/http';
import { downloadSettlementPdf, getAdminSettlements, getEligibleSettlementOrders, invoiceSelectedOrders, sendSettlementToCompany } from '@/services/dashboard.service';
import type { EligibleSettlementOrder } from '@/services/dashboard.service';
import type { CompanySettlement } from '@/types/dashboard';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' });

export function InvoiceOrdersPanel({ accessToken, onChanged }: { accessToken: string; onChanged: () => void }) {
  const [tab, setTab] = useState<'pending' | 'invoiced'>('pending');
  const [orders, setOrders] = useState<EligibleSettlementOrder[]>([]);
  const [invoices, setInvoices] = useState<CompanySettlement[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [reference, setReference] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedOrders = useMemo(() => orders.filter((order) => selected.includes(order.order_id)), [orders, selected]);
  const selectedCompanyId = selectedOrders[0]?.company_id;
  const selectedTotal = selectedOrders.reduce((sum, order) => sum + Number(order.company_payable), 0);

  async function load() {
    setPending(true); setError(null);
    try {
      const [nextOrders, nextInvoices] = await Promise.all([getEligibleSettlementOrders(accessToken), getAdminSettlements(accessToken, { page_size: 100 })]);
      setOrders(nextOrders); setInvoices(nextInvoices);
      setSelected((current) => current.filter((id) => nextOrders.some((order) => order.order_id === id)));
    } catch (cause) { setError(cause instanceof ApiError || cause instanceof Error ? cause.message : 'No pudimos cargar las órdenes.'); }
    finally { setPending(false); }
  }
  useEffect(() => { void load(); }, [accessToken]);

  function toggle(order: EligibleSettlementOrder) {
    if (selected.includes(order.order_id)) return setSelected(selected.filter((id) => id !== order.order_id));
    if (selectedCompanyId && selectedCompanyId !== order.company_id) return setError(`Solo puedes seleccionar órdenes de ${selectedOrders[0].company.name}.`);
    setError(null); setSelected([...selected, order.order_id]);
  }
  async function invoice() {
    if (!reference.trim()) return setError('Ingresa la referencia de pago para continuar.');
    setPending(true); setError(null);
    try { await invoiceSelectedOrders(accessToken, { order_ids: selected, payout_reference: reference.trim() }); setSelected([]); setReference(''); setModalOpen(false); setTab('invoiced'); await load(); onChanged(); }
    catch (cause) { setError(cause instanceof ApiError || cause instanceof Error ? cause.message : 'No pudimos facturar las órdenes.'); }
    finally { setPending(false); }
  }
  async function download(invoice: CompanySettlement) {
    setPending(true); setError(null);
    try { const blob = await downloadSettlementPdf(accessToken, invoice.id); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${invoice.settlement_number}.pdf`; link.click(); URL.revokeObjectURL(url); }
    catch (cause) { setError(cause instanceof ApiError || cause instanceof Error ? cause.message : 'No pudimos descargar el PDF.'); }
    finally { setPending(false); }
  }
  async function send(invoice: CompanySettlement) {
    setPending(true); setError(null);
    try { const delivery = await sendSettlementToCompany(accessToken, invoice.id); setError(`PDF enviado a ${delivery.recipient}.`); }
    catch (cause) { setError(cause instanceof ApiError || cause instanceof Error ? cause.message : 'No pudimos enviar el PDF.'); }
    finally { setPending(false); }
  }

  return <section className="invoice-orders">
    <div className="invoice-orders__tabs" role="tablist"><button className={tab === 'pending' ? 'is-active' : ''} onClick={() => setTab('pending')} role="tab" type="button">Órdenes pendientes <span>{orders.length}</span></button><button className={tab === 'invoiced' ? 'is-active' : ''} onClick={() => setTab('invoiced')} role="tab" type="button">Facturadas <span>{invoices.length}</span></button></div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {tab === 'pending' ? <><div className="invoice-orders__heading"><div><h3>Órdenes disponibles para facturar</h3><p>El valor no incluye domicilio. Al seleccionar una empresa, las demás órdenes quedan bloqueadas.</p></div><button className="primary-button" disabled={!selected.length || pending} onClick={() => setModalOpen(true)} type="button">Facturar {selected.length ? `(${selected.length})` : ''}</button></div><div className="invoice-table-wrap"><table className="invoice-table"><thead><tr><th aria-label="Seleccionar" /><th>Número de orden</th><th>Empresa</th><th>Valor sin domicilio</th><th>Fecha</th></tr></thead><tbody>{orders.map((order) => { const disabled = Boolean(selectedCompanyId && selectedCompanyId !== order.company_id); return <tr className={disabled ? 'is-disabled' : ''} key={order.order_id}><td><input aria-label={`Seleccionar ${order.order_number}`} checked={selected.includes(order.order_id)} disabled={disabled} onChange={() => toggle(order)} type="checkbox" /></td><td><strong>{order.order_number}</strong></td><td>{order.company.name}</td><td>{money.format(Number(order.net_product_sale))}</td><td>{date.format(new Date(order.paid_at))}</td></tr>; })}</tbody></table>{!orders.length && !pending ? <p className="empty-results">No hay órdenes PSE pendientes por facturar.</p> : null}</div></> : <><div className="invoice-orders__heading"><div><h3>Facturas preparadas</h3><p>Descarga el PDF o envíalo al correo registrado de la empresa.</p></div><button className="secondary-button" disabled={pending} onClick={() => void load()} type="button">Actualizar</button></div><div className="invoice-cards">{invoices.map((invoice) => <article key={invoice.id}><div><strong>{invoice.settlement_number}</strong><p>{invoice.company?.name || 'Empresa'} · {invoice.order_count} órdenes</p><small>Referencia: {invoice.payout_reference || '—'} · Total: {money.format(Number(invoice.amount_payable))}</small></div><div><button className="secondary-button" disabled={pending} onClick={() => void download(invoice)} type="button">Descargar PDF</button><button className="primary-button" disabled={pending || !invoice.company?.email} onClick={() => void send(invoice)} title={invoice.company?.email ? `Enviar a ${invoice.company.email}` : 'La empresa no tiene correo'} type="button">Enviar a cliente</button></div></article>)}{!invoices.length && !pending ? <p className="empty-results">Todavía no hay facturas generadas.</p> : null}</div></>}
    {modalOpen ? <div aria-modal="true" className="invoice-modal-backdrop" role="dialog"><section className="invoice-modal"><h3>Confirmar facturación</h3><p>{selectedOrders.length} órdenes de <strong>{selectedOrders[0]?.company.name}</strong> por <strong>{money.format(selectedTotal)}</strong>.</p><label>Referencia de pago<input autoFocus maxLength={191} onChange={(event) => setReference(event.target.value)} placeholder="Ej. TRX-123456" value={reference} /></label><small>Las órdenes saldrán de pendientes y se agruparán en una factura PDF.</small><div><button className="secondary-button" disabled={pending} onClick={() => setModalOpen(false)} type="button">Cancelar</button><button className="primary-button" disabled={pending} onClick={() => void invoice()} type="button">{pending ? 'Facturando…' : 'Confirmar y facturar'}</button></div></section></div> : null}
  </section>;
}
