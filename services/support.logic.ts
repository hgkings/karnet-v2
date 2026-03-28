// ----------------------------------------------------------------
// SupportLogic — Katman 6
// Destek talep yonetimi.
// KNOWLEDGE-BASE.md Section 12.
// v1 hata duzeltmesi: Admin cevabinda email gonder.
// ----------------------------------------------------------------

import { ServiceError } from '@/lib/gateway/types'
import { sendEmail } from '@/lib/email/send'

// ----------------------------------------------------------------
// Tipler
// ----------------------------------------------------------------

export type TicketStatus = 'acik' | 'inceleniyor' | 'cevaplandi' | 'kapali'
export type TicketPriority = 'dusuk' | 'normal' | 'yuksek' | 'acil'
export type TicketCategory = 'teknik' | 'odeme' | 'hesap' | 'oneri' | 'diger'

export interface Ticket {
  id: string
  userId: string
  userEmail: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  message: string
  adminReply: string | null
  adminRepliedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTicketPayload {
  subject: string
  category: TicketCategory
  priority: TicketPriority
  message: string
  userEmail: string
}

export interface ReplyPayload {
  ticketId: string
  adminReply: string
  newStatus?: TicketStatus
  userEmail: string
}

// ----------------------------------------------------------------
// Servis
// ----------------------------------------------------------------

export class SupportLogic {
  /**
   * Destek talebi olusturur.
   */
  async createTicket(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ ticketId: string }> {
    const input = payload as CreateTicketPayload

    if (!input.subject || input.subject.length > 200) {
      throw new ServiceError('Konu 1-200 karakter arasında olmalıdır', {
        code: 'INVALID_SUBJECT',
        statusCode: 400,
        traceId,
      })
    }

    if (!input.message || input.message.length < 20 || input.message.length > 5000) {
      throw new ServiceError('Mesaj 20-5000 karakter arasında olmalıdır', {
        code: 'INVALID_MESSAGE',
        statusCode: 400,
        traceId,
      })
    }

    // TODO(FAZ5): supportRepository.create({ userId, ...input, status: 'acik' })
    return { ticketId: 'placeholder' }
  }

  /**
   * Kullanici taleplerini listeler.
   * FAZ5'te repository baglanacak.
   */
  async listTickets(
    _traceId: string,
    _payload: unknown,
    _userId: string
  ): Promise<Ticket[]> {
    // TODO(FAZ5): supportRepository.findByUserId(userId)
    return []
  }

  /**
   * Tekil talep getirir.
   * FAZ5'te repository baglanacak.
   */
  async getTicket(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<Ticket | null> {
    const { ticketId } = payload as { ticketId: string }
    if (!ticketId) {
      throw new ServiceError('Talep ID\'si zorunludur', {
        code: 'MISSING_TICKET_ID',
        statusCode: 400,
        traceId,
      })
    }
    // TODO(FAZ5): supportRepository.findById(ticketId)
    return null
  }

  /**
   * Admin talebe cevap verir.
   * v1 hata duzeltmesi: Cevap sonrasi kullaniciya email gonderilir.
   */
  async replyToTicket(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ success: boolean; emailSent: boolean }> {
    const input = payload as ReplyPayload

    if (!input.ticketId) {
      throw new ServiceError('Talep ID\'si zorunludur', {
        code: 'MISSING_TICKET_ID',
        statusCode: 400,
        traceId,
      })
    }

    if (!input.adminReply || input.adminReply.trim().length === 0) {
      throw new ServiceError('Cevap boş olamaz', {
        code: 'EMPTY_REPLY',
        statusCode: 400,
        traceId,
      })
    }

    // TODO(FAZ5): supportRepository.updateReply(ticketId, {
    //   adminReply: input.adminReply,
    //   adminRepliedAt: new Date().toISOString(),
    //   status: input.newStatus ?? 'cevaplandi',
    // })

    // v1 hata duzeltmesi: Kullaniciya email gonder
    let emailSent = false
    if (input.userEmail) {
      try {
        await sendEmail({
          to: input.userEmail,
          subject: 'Destek Talebinize Cevap Verildi — Kârnet',
          html: `
            <h2>Destek Talebinize Cevap Verildi</h2>
            <p>Merhaba,</p>
            <p>Destek talebinize cevap verildi:</p>
            <blockquote style="border-left: 3px solid #0ea5e9; padding-left: 12px; color: #374151;">
              ${input.adminReply}
            </blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ''}/support">Taleplerinizi Görüntüleyin</a></p>
            <p>Kârnet Destek Ekibi</p>
          `,
        })
        emailSent = true
      } catch {
        // Email hatasi talep cevabini engellemez
      }
    }

    return { success: true, emailSent }
  }

  /**
   * Talebi kapatir.
   * FAZ5'te repository baglanacak.
   */
  async closeTicket(
    traceId: string,
    payload: unknown,
    _userId: string
  ): Promise<{ success: boolean }> {
    const { ticketId } = payload as { ticketId: string }
    if (!ticketId) {
      throw new ServiceError('Talep ID\'si zorunludur', {
        code: 'MISSING_TICKET_ID',
        statusCode: 400,
        traceId,
      })
    }
    // TODO(FAZ5): supportRepository.updateStatus(ticketId, 'kapali')
    return { success: true }
  }

  /**
   * Admin icin tum talepleri listeler (filtre + pagination).
   * FAZ5'te repository baglanacak.
   */
  async listAllTickets(
    _traceId: string,
    _payload: unknown,
    _userId: string
  ): Promise<{ tickets: Ticket[]; total: number }> {
    // TODO(FAZ5): supportRepository.findAll({ status, priority, category, search, page })
    return { tickets: [], total: 0 }
  }
}

export const supportLogic = new SupportLogic()
