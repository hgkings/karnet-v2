import { requireAdmin, callGateway, errorResponse } from '@/lib/api/helpers'
import { ModerateCommentSchema } from '@/lib/validators/schemas/blog.schema'

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const { searchParams } = new URL(request.url)
    const isApproved = searchParams.get('approved')

    return callGateway('blog', 'listAllComments', {
      isApproved: isApproved === 'true' ? true : isApproved === 'false' ? false : undefined,
    }, admin.id)
  } catch (error) { return errorResponse(error) }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    if (admin instanceof Response) return admin

    const body = await request.json()
    const parsed = ModerateCommentSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz moderasyon verisi.' },
        { status: 400 }
      )
    }

    return callGateway('blog', 'moderateComment', parsed.data, admin.id)
  } catch (error) { return errorResponse(error) }
}
