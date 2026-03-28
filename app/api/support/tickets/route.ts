import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'
import { CreateTicketSchema } from '@/lib/validators/schemas/support.schema'

export async function GET() {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    return callGateway('support', 'listTickets', {}, user.id)
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    const parsed = CreateTicketSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz talep verisi.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    return callGateway('support', 'createTicket', {
      ...parsed.data,
      userEmail: user.email,
    }, user.id)
  } catch (error) { return errorResponse(error) }
}
