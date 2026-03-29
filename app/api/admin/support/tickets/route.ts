import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'
import { TicketFilterSchema } from '@/lib/validators/schemas/support.schema'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (admin instanceof Response) return admin

  try {
    const { searchParams } = new URL(request.url)

    if (searchParams.get('stats') === '1') {
      // TODO: support servisine getTicketStats metodu eklenecek
      return await callGateway('support', 'getTicketStats', {}, admin.id)
    }

    const filterParsed = TicketFilterSchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      priority: searchParams.get('priority') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    })

    const filters = filterParsed.success ? filterParsed.data : {}
    // TODO: support servisine getAllTickets metodu eklenecek
    return await callGateway('support', 'getAllTickets', { filters }, admin.id)
  } catch (error) {
    return errorResponse(error)
  }
}
