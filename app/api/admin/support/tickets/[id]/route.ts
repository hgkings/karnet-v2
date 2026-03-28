import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'
import { AdminReplySchema } from '@/lib/validators/schemas/support.schema'

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin
    const { id } = await params

    const body = await request.json()
    const parsed = AdminReplySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz cevap verisi.' },
        { status: 400 }
      )
    }

    return callGateway('support', 'replyToTicket', {
      ticketId: id,
      adminReply: parsed.data.admin_reply,
      newStatus: parsed.data.status ?? 'cevaplandi',
    }, admin.id)
  } catch (error) { return errorResponse(error) }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin
    const { id } = await params
    return callGateway('support', 'closeTicket', { ticketId: id }, admin.id)
  } catch (error) { return errorResponse(error) }
}
