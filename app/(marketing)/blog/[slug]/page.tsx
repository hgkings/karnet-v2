"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/layout/footer"
import { apiClient } from "@/lib/api/client"

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: number
  content: string
}

interface Comment {
  id: string
  author_name: string
  content: string
  created_at: string
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [authorName, setAuthorName] = useState("")
  const [commentContent, setCommentContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const postRes = await apiClient.get<BlogPost>(`/api/blog/comments?slug=${slug}&postOnly=true`)
        setPost((postRes.data ?? null) as BlogPost | null)
        const commentsRes = await apiClient.get<Comment[]>(`/api/blog/comments?slug=${slug}`)
        setComments((commentsRes.data ?? []) as Comment[])
      } catch {
        /* blog yazilarini gateway uzerinden cekemezse statik goster */
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [slug])

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await apiClient.post("/api/blog/comments", {
        slug,
        authorName,
        content: commentContent,
      })
      if (res.success) {
        toast.success("Yorumunuz alındı, incelendikten sonra yayınlanacak.")
        setAuthorName("")
        setCommentContent("")
      } else {
        toast.error(res.error ?? "Yorum gönderilemedi.")
      }
    } catch {
      toast.error("Yorum gönderilemedi. Lütfen tekrar deneyin.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 md:px-6">
          <Link href="/" className="font-bold text-lg text-primary">Kârnet</Link>
          <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground">Giriş Yap</Link>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Blog&apos;a Dön
          </Link>

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          )}

          {!loading && post && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{post.title}</h1>
              <p className="text-muted-foreground mb-4">{post.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Intl.DateTimeFormat("tr-TR").format(new Date(post.date))}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime} dk okuma
                </span>
              </div>
              {post.content && (
                <div className="prose prose-sm max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />
              )}
            </>
          )}

          {!loading && !post && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Yazı bulunamadı</h2>
              <p className="text-muted-foreground mb-4">Aradığınız blog yazısı mevcut değil.</p>
              <Link href="/blog"><Button variant="outline">Blog&apos;a Dön</Button></Link>
            </div>
          )}

          {/* Yorumlar */}
          <div className="border-t pt-8 mt-8">
            <h2 className="text-xl font-bold mb-6">Yorumlar ({comments.length})</h2>

            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground mb-6">Henüz yorum yok. İlk yorumu siz yazın!</p>
            )}

            {comments.map((c) => (
              <div key={c.id} className="border-b py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(c.created_at)) : ""}
                  </span>
                </div>
                <p className="text-sm">{c.content}</p>
              </div>
            ))}

            {/* Yorum formu */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Yorum Yazın</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">İsim <span className="text-destructive">*</span></Label>
                    <Input
                      id="authorName"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Adınız"
                      maxLength={100}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commentContent">Yorum <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="commentContent"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Yorumunuzu yazın..."
                      maxLength={2000}
                      rows={4}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Yorum Gönder
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
