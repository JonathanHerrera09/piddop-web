import { FormEvent, useEffect, useState } from 'react';
import { updateAdminWompiSettings } from '@/services/dashboard.service';
import { showToast } from '@/services/toast.service';
import type { WompiSettings } from '@/types/dashboard';

interface Props {
  accessToken: string;
  settings: WompiSettings;
  onChanged: (settings: WompiSettings) => void;
}

export function WompiSettingsPanel({ accessToken, onChanged, settings }: Props) {
  const [form, setForm] = useState({
    enabled: settings.enabled,
    environment: settings.environment,
    public_key: settings.public_key || '',
    private_key: '',
    events_secret: '',
    integrity_secret: '',
    public_base_url: settings.public_base_url || ''
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      enabled: settings.enabled,
      environment: settings.environment,
      public_key: settings.public_key || '',
      public_base_url: settings.public_base_url || '',
      private_key: '',
      events_secret: '',
      integrity_secret: ''
    });
  }, [settings]);

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      setPending(true);
      setError(null);
      const updated = await updateAdminWompiSettings(accessToken, form);
      onChanged(updated);
      showToast({ kind: 'success', title: 'Wompi actualizado', message: 'Las nuevas credenciales ya se usan para los próximos pagos.' });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No pudimos guardar la configuracion de Wompi.');
    } finally {
      setPending(false);
    }
  }

  const secretHint = (configured: boolean, hint: string | null) => configured
    ? `Credencial activa: ${hint || '••••'}. Déjalo vacío para conservarla.`
    : 'Aún no configurada.';

  return (
    <form className="wompi-settings" onSubmit={save}>
      <section className="wompi-settings__status">
        <div>
          <span className="settings-section-kicker">Estado del medio de pago</span>
          <h3>PSE con Wompi</h3>
          <p>El checkout se abre en Wompi y el pedido solo queda disponible para el negocio después de un pago aprobado.</p>
        </div>
        <label className="wompi-switch">
          <input checked={form.enabled} onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} type="checkbox" />
          <span>{form.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
        </label>
      </section>

      <div className="wompi-settings__grid">
        <label>Ambiente<select value={form.environment} onChange={(event) => setForm((current) => ({ ...current, environment: event.target.value as WompiSettings['environment'] }))}><option value="sandbox">Pruebas (Sandbox)</option><option value="production">Producción</option></select></label>
        <label>URL pública del backend<input onChange={(event) => setForm((current) => ({ ...current, public_base_url: event.target.value }))} placeholder="https://api.tudominio.com" type="url" value={form.public_base_url} /><small>Sin la ruta /api/v1; el sistema construye la URL de eventos.</small></label>
        <label className="wompi-settings__wide">Llave pública<input autoComplete="off" onChange={(event) => setForm((current) => ({ ...current, public_key: event.target.value }))} placeholder={form.environment === 'production' ? 'pub_prod_...' : 'pub_test_...'} value={form.public_key} /></label>
        <label>Llave privada<input autoComplete="new-password" onChange={(event) => setForm((current) => ({ ...current, private_key: event.target.value }))} placeholder={form.environment === 'production' ? 'prv_prod_...' : 'prv_test_...'} type="password" value={form.private_key} /><small>{secretHint(settings.private_key_configured, settings.private_key_hint)}</small></label>
        <label>Secreto de eventos<input autoComplete="new-password" onChange={(event) => setForm((current) => ({ ...current, events_secret: event.target.value }))} placeholder={form.environment === 'production' ? 'prod_events_...' : 'test_events_...'} type="password" value={form.events_secret} /><small>{secretHint(settings.events_secret_configured, settings.events_secret_hint)}</small></label>
        <label className="wompi-settings__wide">Secreto de integridad<input autoComplete="new-password" onChange={(event) => setForm((current) => ({ ...current, integrity_secret: event.target.value }))} placeholder={form.environment === 'production' ? 'prod_integrity_...' : 'test_integrity_...'} type="password" value={form.integrity_secret} /><small>{secretHint(settings.integrity_secret_configured, settings.integrity_secret_hint)}</small></label>
      </div>

      <section className="wompi-settings__webhook">
        <div><span>URL de eventos para copiar en Wompi</span><strong>{settings.webhook_url || 'Completa primero la URL pública.'}</strong></div>
        {settings.webhook_url ? <button onClick={() => void navigator.clipboard.writeText(settings.webhook_url)} type="button">Copiar URL</button> : null}
      </section>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="primary-button" disabled={pending} type="submit">{pending ? 'Guardando...' : 'Guardar configuración'}</button>
      <p className="wompi-settings__security">Las credenciales secretas se cifran antes de guardarse y nunca regresan al navegador.</p>
    </form>
  );
}
