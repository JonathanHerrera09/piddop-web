import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailTemplatesPanel } from './EmailTemplatesPanel';
import { getEmailTemplates } from '@/services/email-template.service';

vi.mock('@/services/email-template.service', () => ({
  getEmailTemplates: vi.fn(),
  updateEmailTemplate: vi.fn(),
  sendEmailTemplateTest: vi.fn()
}));
vi.mock('@/services/toast.service', () => ({ showToast: vi.fn() }));

const templates = [
  { key: 'welcome', name: 'Bienvenida a Piddop', description: 'Saludo', subject: 'Hola {{name}}', html: '<h1>Hola {{name}}</h1>', enabled: false },
  { key: 'email_verification', name: 'Verificación de correo', description: 'Código', subject: '{{code}}', html: '<b>{{code}}</b>', enabled: false },
  { key: 'purchase_thanks', name: 'Gracias por tu compra', description: 'Compra', subject: 'Gracias', html: '<p>{{order_total}}</p>', enabled: false }
] as const;

describe('EmailTemplatesPanel SMTP readiness', () => {
  beforeEach(() => vi.clearAllMocks());

  it('explains that only the verified sender is missing', async () => {
    vi.mocked(getEmailTemplates).mockResolvedValue({
      templates: [...templates],
      status: { configured: false, transport_configured: true, sender_configured: false, automatic_sending_enabled: false, verification_code_ttl_seconds: 60 }
    });
    render(<EmailTemplatesPanel accessToken="token" />);
    expect(await screen.findByText('Credenciales de Brevo conectadas')).toBeInTheDocument();
    expect(screen.getByText(/Falta configurar SMTP_FROM/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar correo de prueba' })).toBeDisabled();
  });

  it('enables test delivery when transport and sender are configured', async () => {
    vi.mocked(getEmailTemplates).mockResolvedValue({
      templates: [...templates],
      status: { configured: true, transport_configured: true, sender_configured: true, automatic_sending_enabled: false, verification_code_ttl_seconds: 60 }
    });
    render(<EmailTemplatesPanel accessToken="token" />);
    expect(await screen.findByText('Ya puedes realizar envíos de prueba.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar correo de prueba' })).toBeEnabled();
  });
});
