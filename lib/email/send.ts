import { getTransporter } from './smtp'

// ----------------------------------------------------------------
// sendEmail — genel amacli email gonderim fonksiyonu.
// Template'ler FAZ6/7'de eklenir. Bu fonksiyon HTML body alir.
// ----------------------------------------------------------------

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Email gonderir. Brevo SMTP uzerinden.
 * @param options - Alici, konu, HTML icerik
 * @returns Basari durumu ve messageId
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const fromAddress = process.env.EMAIL_FROM
  const fromName = process.env.EMAIL_FROM_NAME

  if (!fromAddress || !fromName) {
    throw new Error('EMAIL_FROM ve EMAIL_FROM_NAME tanimlanmamis')
  }

  try {
    const transporter = getTransporter()

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo ?? fromAddress,
    })

    return {
      success: true,
      messageId: info.messageId as string,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen email hatasi'
    throw new Error(`Email gonderilemedi: ${message}`, { cause: error })
  }
}
