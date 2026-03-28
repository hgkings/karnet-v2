import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'
import { ConnectMarketplaceSchema, DisconnectMarketplaceSchema } from '@/lib/validators/schemas/marketplace.schema'

export async function GET() {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    return callGateway('marketplace', 'getStatus', { marketplace: 'trendyol' }, user.id)
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    const parsed = ConnectMarketplaceSchema.safeParse({ ...body, marketplace: 'trendyol' })
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz bağlantı bilgileri.' },
        { status: 400 }
      )
    }

    return callGateway('marketplace', 'connect', parsed.data, user.id, {
      rateLimitType: 'sync',
      rateLimitIdentifier: `sync:${user.id}`,
    })
  } catch (error) { return errorResponse(error) }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    const parsed = DisconnectMarketplaceSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz bağlantı ID.' },
        { status: 400 }
      )
    }

    return callGateway('marketplace', 'disconnect', parsed.data, user.id)
  } catch (error) { return errorResponse(error) }
}
