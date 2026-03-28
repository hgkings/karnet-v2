import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// ----------------------------------------------------------------
// Brevo SMTP Transport
// Host: smtp-relay.brevo.com | Port: 587 (TLS)
// Credentials: env'den okunur, hardcoded yasak
// ----------------------------------------------------------------

let transporter: Transporter | null = null

/**
 * Singleton SMTP transporter dondurur.
 * Ilk cagirida olusturur, sonraki cagrilarda ayni instance'i kullanir.
 */
export function getTransporter(): Transporter {
  if (transporter) return transporter

  const user = process.env.BREVO_SMTP_USER
  const pass = process.env.BREVO_SMTP_KEY

  if (!user || !pass) {
    throw new Error('BREVO_SMTP_USER ve BREVO_SMTP_KEY tanimlanmamis')
  }

  transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  })

  return transporter
}
