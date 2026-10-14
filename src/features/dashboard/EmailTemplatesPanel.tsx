import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/services/http';
import {
  EmailCenterStatus,
  EmailTemplate,
  EmailTemplateKey,
  getEmailTemplates,
  sendEmailTemplateTest,
  updateEmailTemplate
} from '@/services/email-template.service';
import { showToast } from '@/services/toast.service';

const previewVariables: Record<string, string> = {
  name: 'Valentina', code: '483921', expires_in: '60', app_url: '#', order_number: '#ALL-1024',
  company_name: 'Café del Parque', order_total: '$ 48.900', order_url: '#'
};

const templateHints: Record<EmailTemplateKey, { icon: string; accent: string; moment: string }> = {
  welcome: { icon: '✨', accent: 'Naranja', moment: 'Después del registro' },
  email_verification: { icon: '🔐', accent: 'Seguridad', moment: 'Antes de validar la cuenta' },
  purchase_thanks: { icon: '🧡', accent: 'Conversión', moment: 'Después de la compra' }
};

function renderPreview(html: string) {
  return html.replace(/{{\s*([a-z_]+)\s*}}/gi, (_match, key) => previewVariables[key] ?? `{{${key}}}`);
}

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'No pudimos completar la operación.';
}

export function EmailTemplatesPanel({ accessToken }: { accessToken: string }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeKey, setActiveKey] = useState<EmailTemplateKey>('welcome');
  const [status, setStatus] = useState<EmailCenterStatus | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    getEmailTemplates(accessToken)
      .then((result) => { if (mounted) { setTemplates(result.templates); setStatus(result.status); } })
      .catch((error) => showToast({ title: 'No pudimos cargar las plantillas', message: errorMessage(error), kind: 'error' }))
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [accessToken]);

  const activeTemplate = templates.find((template) => template.key === activeKey);
  const preview = useMemo(() => renderPreview(activeTemplate?.html || ''), [activeTemplate?.html]);

  function edit(field: 'subject' | 'html', value: string) {
    setTemplates((current) => current.map((template) => template.key === activeKey ? { ...template, [field]: value } : template));
  }

  async function save() {
    if (!activeTemplate?.subject.trim() || !activeTemplate.html.trim()) {
      showToast({ title: 'Revisa la plantilla', message: 'El asunto y el contenido no pueden estar vacíos.', kind: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const saved = await updateEmailTemplate(accessToken, activeTemplate);
      setTemplates((current) => current.map((template) => template.key === saved.key ? saved : template));
      showToast({ title: 'Plantilla guardada', kind: 'success' });
    } catch (error) {
      showToast({ title: 'No pudimos guardar', message: errorMessage(error), kind: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function sendTest(event: React.FormEvent) {
    event.preventDefault();
    if (!activeTemplate || !/^\S+@\S+\.\S+$/.test(testEmail.trim())) {
      showToast({ title: 'Correo no válido', message: 'Escribe un correo válido para hacer la prueba.', kind: 'error' });
      return;
    }
    setIsSending(true);
    try {
      await sendEmailTemplateTest(accessToken, activeTemplate.key, testEmail.trim());
      showToast({ title: 'Prueba enviada', message: `Revisa la bandeja de ${testEmail.trim()}.`, kind: 'success' });
    } catch (error) {
      showToast({ title: 'No pudimos enviar la prueba', message: errorMessage(error), kind: 'error' });
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) return <div className="email-center-loading">Preparando tus plantillas...</div>;
  if (!activeTemplate) return <div className="workspace-state workspace-state--error"><p>No fue posible cargar las plantillas.</p></div>;

  return (
    <div className="email-center">
      <section className="email-center__status" aria-label="Estado del centro de correo">
        <div><span className={`email-status-dot ${status?.transport_configured ? 'is-ready' : ''}`} /><strong>{status?.transport_configured ? 'Credenciales de Brevo conectadas' : 'Faltan las credenciales SMTP'}</strong><small>{status?.configured ? 'Ya puedes realizar envíos de prueba.' : status?.transport_configured ? 'Falta definir un remitente verificado en Brevo.' : 'Completa las variables SMTP del backend para enviar.'}</small></div>
        <div><span className="email-status-pill email-status-pill--ready">Automatización activa</span><small>Verificación, bienvenida y compra conectadas a la app.</small></div>
        <div><strong>60 segundos</strong><small>Vigencia del código de verificación.</small></div>
      </section>

      <div className="email-center__tabs" role="tablist" aria-label="Plantillas disponibles">
        {templates.map((template) => (
          <button className={`email-template-tab ${template.key === activeKey ? 'is-active' : ''}`} key={template.key} onClick={() => setActiveKey(template.key)} role="tab" type="button">
            <span>{templateHints[template.key].icon}</span><span><strong>{template.name}</strong><small>{templateHints[template.key].moment}</small></span>
          </button>
        ))}
      </div>

      <div className="email-center__workspace">
        <section className="email-editor-card">
          <header><div><span className="eyebrow">EDITOR DE PLANTILLA</span><h3>{activeTemplate.name}</h3><p>{activeTemplate.description}</p></div><span className="email-template-chip">{templateHints[activeTemplate.key].accent}</span></header>
          <label className="email-field"><span>Asunto del correo</span><input maxLength={191} onChange={(event) => edit('subject', event.target.value)} value={activeTemplate.subject} /></label>
          <label className="email-field"><span>Contenido HTML</span><textarea className="email-code-editor" onChange={(event) => edit('html', event.target.value)} rows={18} value={activeTemplate.html} /></label>
          <div className="email-editor-help"><strong>Variables disponibles</strong><div>{['{{name}}', '{{code}}', '{{expires_in}}', '{{app_url}}', '{{order_number}}', '{{company_name}}', '{{order_total}}', '{{order_url}}'].map((token) => <code key={token}>{token}</code>)}</div></div>
          <div className="email-editor-actions"><span>Los cambios se guardan para futuros envíos.</span><button className="primary-button" disabled={isSaving} onClick={() => void save()} type="button">{isSaving ? 'Guardando...' : 'Guardar cambios'}</button></div>
        </section>

        <aside className="email-preview-column">
          <section className="email-preview-card"><header><div><span className="eyebrow">VISTA PREVIA</span><strong>Así lo verá el cliente</strong></div><span>Escritorio</span></header><iframe sandbox="" srcDoc={preview} title={`Vista previa de ${activeTemplate.name}`} /></section>
          <form className="email-test-card" onSubmit={sendTest}><div className="email-test-card__icon">✈</div><div><h3>Haz una prueba real</h3><p>Guarda primero tus cambios y envía esta plantilla a cualquier correo.</p></div><label className="email-field"><span>Correo de prueba</span><input autoComplete="email" onChange={(event) => setTestEmail(event.target.value)} placeholder="tu@correo.com" type="email" value={testEmail} /></label><button className="secondary-button" disabled={isSending || !status?.configured} type="submit">{isSending ? 'Enviando...' : 'Enviar correo de prueba'}</button>{!status?.configured ? <small className="email-test-note">{status?.transport_configured ? 'Brevo está conectado. Falta configurar SMTP_FROM con un remitente verificado.' : 'Faltan las credenciales de conexión SMTP.'}</small> : null}</form>
        </aside>
      </div>
    </div>
  );
}
