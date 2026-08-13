import { Resend } from 'resend';

// Inicializa o Resend se a chave estiver presente no ambiente
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendVerificationEmail(toEmail: string, verificationToken: string, originUrl: string) {
  const confirmUrl = `${originUrl}/?verify=${verificationToken}`;
  const subject = 'Confirme seu e-mail — Simulador Chalé A-frame ICF';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #15803d;">Bem-vindo ao Simulador Chalé A-frame ICF!</h2>
      <p>Recebemos o seu cadastro na plataforma. Para confirmar seu e-mail e liberar o acesso completo ao simulador, clique no botão abaixo:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmUrl}" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirmar Meu E-mail</a>
      </div>
      <p style="font-size: 14px; color: #555;">Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:</p>
      <p style="font-size: 12px; color: #0284c7; word-break: break-all;">${confirmUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Se você não solicitou este cadastro, por favor ignore esta mensagem.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Simulador A-frame <onboarding@resend.dev>',
        to: [toEmail],
        subject,
        html,
      });
      console.log(`[Email] E-mail de verificação enviado via Resend para ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[Email] Falha ao enviar via Resend:', error);
    }
  }

  // Fallback seguro em log para diagnóstico no sandbox caso RESEND_API_KEY não esteja configurada
  console.log(`[Email Sandbox Fallback] Para: ${toEmail} | Link de Confirmação: ${confirmUrl}`);
  return false;
}

export async function sendPasswordResetEmail(toEmail: string, resetToken: string, originUrl: string) {
  const resetUrl = `${originUrl}/?reset=${resetToken}`;
  const subject = 'Redefinição de Senha — Simulador Chalé A-frame ICF';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #15803d;">Redefinição de Senha</h2>
      <p>Você solicitou a redefinição de senha para sua conta no Simulador Chalé A-frame ICF. Clique no botão abaixo para criar uma nova senha:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Senha</a>
      </div>
      <p style="font-size: 14px; color: #555;">Se o botão não funcionar, utilize o link:</p>
      <p style="font-size: 12px; color: #0284c7; word-break: break-all;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
    </div>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Simulador A-frame <onboarding@resend.dev>',
        to: [toEmail],
        subject,
        html,
      });
      console.log(`[Email] E-mail de redefinição enviado via Resend para ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[Email] Falha ao enviar via Resend:', error);
    }
  }

  console.log(`[Email Sandbox Fallback] Para: ${toEmail} | Link de Redefinição: ${resetUrl}`);
  return false;
}
