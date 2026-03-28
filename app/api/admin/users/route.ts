import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'
import { AdminUpdateUserSchema } from '@/lib/validators/schemas/user.schema'

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') ?? '1', 10)

    return callGateway('user', 'getProfile', {
      adminList: true,
      plan: plan ?? undefined,
      search: search ?? undefined,
      page,
    }, admin.id)
  } catch (error) { return errorResponse(error) }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const body = await request.json()
    const parsed = AdminUpdateUserSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz kullanıcı verisi.' },
        { status: 400 }
      )
    }

    return callGateway('user', 'updateProfile', {
      adminAction: true,
      targetUserId: parsed.data.userId,
      plan: parsed.data.plan,
    }, admin.id)
  } catch (error) { return errorResponse(error) }
}
