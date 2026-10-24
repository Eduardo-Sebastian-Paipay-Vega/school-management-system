import nodemailer from 'nodemailer';

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass || !process.env.SMTP_FROM) {
    throw new Error('SMTP no está configurado.');
  }
  const port = Number(process.env.SMTP_PORT ?? '587');
  return nodemailer.createTransport({ host, port, secure: port === 465,
    requireTLS: port !== 465, auth: { user, pass } });
}

export async function sendAccessLink(email: string, code: string, token: string,
  purpose: 'ACTIVACION' | 'RECUPERACION'): Promise<void> {
  const origin = process.env.PUBLIC_APP_URL;
  if (!origin) throw new Error('PUBLIC_APP_URL no está configurado.');
  const url = new URL(purpose === 'ACTIVACION' ? '/activar-cuenta' : '/restablecer-clave', origin);
  url.searchParams.set('codigo', code);
  url.searchParams.set('token', token);
  await transporter().sendMail({
    from: process.env.SMTP_FROM, to: email,
    subject: purpose === 'ACTIVACION' ? 'Active su cuenta escolar' : 'Restablezca su contraseña escolar',
    text: `Abra este enlace de un solo uso para ${purpose === 'ACTIVACION' ? 'activar su cuenta' : 'restablecer su contraseña'}:\n${url.toString()}\n\nSi no solicitó este mensaje, ignórelo.`,
  });
}

export async function sendGuardianLink(email: string, code: string, token: string): Promise<void> {
  const origin = process.env.PUBLIC_APP_URL;
  if (!origin) throw new Error('PUBLIC_APP_URL no está configurado.');
  const url = new URL('/activar-apoderado', origin);
  url.searchParams.set('codigo', code);
  url.searchParams.set('token', token);
  await transporter().sendMail({ from: process.env.SMTP_FROM, to: email,
    subject: 'Active su acceso como apoderado',
    text: `Abra este enlace de un solo uso, defina su contraseña y acepte el consentimiento de datos:\n${url.toString()}\n\nEl enlace vence en 72 horas.`,
  });
}

export async function sendNotificationEmail(email: string, title: string, message: string): Promise<void> {
  await transporter().sendMail({ from: process.env.SMTP_FROM, to: email,
    subject: title, text: message });
}
