import { callGateway, getAuthUser, getIp, errorResponse } from '@/lib/api/helpers'
import { CreateCommentSchema } from '@/lib/validators/schemas/blog.schema'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (!slug) {
      return Response.json(
        { success: false, error: 'slug parametresi zorunludur.' },
        { status: 400 }
      )
    }
    // Blog yorumlari public — auth gerekmez
    return callGateway('blog', 'listComments', { slug }, 'anonymous')
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = CreateCommentSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'Geçersiz yorum verisi.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const ip = getIp(request)
    const user = await getAuthUser()

    // Blog yorumlari auth gerektirmez — comment rate limit IP bazli
    return callGateway(
      'blog',
      'createComment',
      { ...parsed.data, ip },
      user?.id ?? 'anonymous',
      { rateLimitType: 'comment', rateLimitIdentifier: ip }
    )
  } catch (error) { return errorResponse(error) }
}
