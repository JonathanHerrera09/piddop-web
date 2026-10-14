import { httpRequest } from '@/services/http';

export type EmailTemplateKey = 'welcome' | 'email_verification' | 'purchase_thanks';

export interface EmailTemplate {
  key: EmailTemplateKey;
  name: string;
  description: string;
  subject: string;
  html: string;
  enabled: boolean;
}

export interface EmailCenterStatus {
  configured: boolean;
  transport_configured: boolean;
  sender_configured: boolean;
  automatic_sending_enabled: boolean;
  verification_code_ttl_seconds: number;
}

export async function getEmailTemplates(accessToken: string) {
  const response = await httpRequest<{ templates: EmailTemplate[]; status: EmailCenterStatus }>({
    accessToken,
    path: '/admin/email-templates'
  });
  return response.data;
}

export async function updateEmailTemplate(accessToken: string, template: EmailTemplate) {
  const response = await httpRequest<{ template: EmailTemplate }>({
    accessToken,
    body: { subject: template.subject, html: template.html, enabled: template.enabled },
    method: 'PUT',
    path: `/admin/email-templates/${template.key}`
  });
  return response.data.template;
}

export async function sendEmailTemplateTest(accessToken: string, key: EmailTemplateKey, email: string) {
  const response = await httpRequest<{ delivery: { recipient: string; message_id: string | null; sent_at: string } }>({
    accessToken,
    body: { email },
    method: 'POST',
    path: `/admin/email-templates/${key}/test`
  });
  return response.data.delivery;
}
