import { requireAuth, callGateway, errorResponse } from '@/lib/api/helpers'
import { UpdateProfileSchema } from '@/lib/validators/schemas/user.schema'

export async function GET() {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user
    return callGateway('user', 'getProfile', {}, user.id)
  } catch (error) { return errorResponse(error) }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth()
    if (user instanceof Response) return user

    const body = await request.json()
    const parsed = UpdateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz profil verisi.' },
        { status: 400 }
      )
    }

    return callGateway('user', 'updateProfile', parsed.data, user.id)
  } catch (error) { return errorResponse(error) }
}
