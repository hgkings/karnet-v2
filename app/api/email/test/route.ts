import { requireAdmin, errorResponse } from '@/lib/api/helpers'
import { sendEmail } from '@/lib/email/send'

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const result = await sendEmail({
      to: admin.email,
      subject: 'Kârnet Email Testi',
      html: '<h2>Email sistemi çalışıyor!</h2><p>Bu bir test mesajıdır.</p>',
    })

    return Response.json({
      success: true,
      data: { messageId: result.messageId },
    })
  } catch (error) { return errorResponse(error) }
}
