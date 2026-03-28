"use client"

import { useEffect, useState } from "react"
import { Check, X, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/client"

interface Comment {
  id: string
  post_slug: string
  author_name: string
  content: string
  created_at: string
  is_approved: boolean
}

export default function AdminCommentsPage() {
  const [pending, setPending] = useState<Comment[]>([])
  const [approved, setApproved] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchComments() {
    setLoading(true)
    try {
      const [pRes, aRes] = await Promise.all([
        apiClient.get<{ comments: Comment[] }>("/api/admin/blog-comments?approved=false"),
        apiClient.get<{ comments: Comment[] }>("/api/admin/blog-comments?approved=true"),
      ])
      setPending(((pRes.data as { comments: Comment[] } | undefined)?.comments ?? []))
      setApproved(((aRes.data as { comments: Comment[] } | undefined)?.comments ?? []))
    } catch {
      toast.error("Yorumlar yüklenirken hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  async function moderate(commentId: string, action: "approve" | "reject") {
    try {
      await apiClient.patch("/api/admin/blog-comments", { commentId, action })
      toast.success(action === "approve" ? "Yorum onaylandı." : "Yorum reddedildi.")
      void fetchComments()
    } catch {
      toast.error("İşlem başarısız oldu.")
    }
  }

  useEffect(() => { void fetchComments() }, [])

  function renderCommentList(comments: Comment[], showActions: boolean) {
    if (loading) {
      return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
    }

    if (comments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">Yorum bulunamadı.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-sm">{c.author_name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {c.post_slug} &middot; {c.created_at ? new Intl.DateTimeFormat("tr-TR").format(new Date(c.created_at)) : ""}
                </span>
              </div>
              {showActions && (
                <div className="flex gap-1">
                  <Button size="icon-xs" variant="ghost" className="text-green-600" onClick={() => moderate(c.id, "approve")}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon-xs" variant="ghost" className="text-red-600" onClick={() => moderate(c.id, "reject")}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm">{c.content}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Blog Yorumları</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yorum Moderasyonu</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Bekleyen ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Onaylanan ({approved.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              {renderCommentList(pending, true)}
            </TabsContent>
            <TabsContent value="approved" className="mt-4">
              {renderCommentList(approved, false)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
