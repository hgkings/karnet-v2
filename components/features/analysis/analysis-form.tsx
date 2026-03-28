"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api/client"

const MARKETPLACES = [
  { value: "trendyol", label: "Trendyol" },
  { value: "hepsiburada", label: "Hepsiburada" },
  { value: "n11", label: "n11" },
  { value: "amazon_tr", label: "Amazon TR" },
  { value: "custom", label: "Özel" },
]

interface FormState {
  productName: string
  marketplace: string
  salePrice: string
  productCost: string
  shippingCost: string
  packagingCost: string
  adCostPerSale: string
  otherCost: string
  commissionPct: string
  returnRatePct: string
  vatPct: string
  monthlySalesVolume: string
  payoutDelayDays: string
  serviceFeeAmount: string
  n11ExtraPct: string
}

const INITIAL_STATE: FormState = {
  productName: "",
  marketplace: "trendyol",
  salePrice: "",
  productCost: "",
  shippingCost: "0",
  packagingCost: "0",
  adCostPerSale: "0",
  otherCost: "0",
  commissionPct: "18",
  returnRatePct: "12",
  vatPct: "20",
  monthlySalesVolume: "100",
  payoutDelayDays: "28",
  serviceFeeAmount: "8.49",
  n11ExtraPct: "0",
}

export function AnalysisForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function updateField(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const input = {
        productName: form.productName,
        marketplace: form.marketplace,
        salePrice: parseFloat(form.salePrice) || 0,
        productCost: parseFloat(form.productCost) || 0,
        shippingCost: parseFloat(form.shippingCost) || 0,
        packagingCost: parseFloat(form.packagingCost) || 0,
        adCostPerSale: parseFloat(form.adCostPerSale) || 0,
        otherCost: parseFloat(form.otherCost) || 0,
        commissionPct: parseFloat(form.commissionPct) || 0,
        returnRatePct: parseFloat(form.returnRatePct) || 0,
        vatPct: parseFloat(form.vatPct) || 20,
        monthlySalesVolume: parseInt(form.monthlySalesVolume) || 0,
        payoutDelayDays: parseInt(form.payoutDelayDays) || 0,
        serviceFeeAmount: parseFloat(form.serviceFeeAmount) || 0,
        n11ExtraPct: parseFloat(form.n11ExtraPct) || 0,
      }

      const res = await apiClient.post<{ id: string }>("/api/analyses", input)
      if (res.success && res.data) {
        toast.success("Analiz oluşturuldu!")
        router.push(`/analysis/${res.data.id}`)
      } else {
        toast.error(res.error ?? "Analiz oluşturulamadı.")
      }
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Yeni Analiz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Urun bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">
                Ürün Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                value={form.productName}
                onChange={(e) => updateField("productName", e.target.value)}
                placeholder="Ürün adını girin"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Pazaryeri</Label>
              <Select value={form.marketplace} onValueChange={(v) => { if (v) updateField("marketplace", v) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACES.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fiyat + maliyet */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salePrice">
                Satış Fiyatı (₺) <span className="text-destructive">*</span>
              </Label>
              <Input id="salePrice" type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => updateField("salePrice", e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCost">Ürün Maliyeti (₺)</Label>
              <Input id="productCost" type="number" step="0.01" min="0" value={form.productCost} onChange={(e) => updateField("productCost", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingCost">Kargo (₺)</Label>
              <Input id="shippingCost" type="number" step="0.01" min="0" value={form.shippingCost} onChange={(e) => updateField("shippingCost", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packagingCost">Paketleme (₺)</Label>
              <Input id="packagingCost" type="number" step="0.01" min="0" value={form.packagingCost} onChange={(e) => updateField("packagingCost", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adCostPerSale">Reklam/Satış (₺)</Label>
              <Input id="adCostPerSale" type="number" step="0.01" min="0" value={form.adCostPerSale} onChange={(e) => updateField("adCostPerSale", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherCost">Diğer (₺)</Label>
              <Input id="otherCost" type="number" step="0.01" min="0" value={form.otherCost} onChange={(e) => updateField("otherCost", e.target.value)} disabled={loading} />
            </div>
          </div>

          {/* Oranlar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commissionPct">Komisyon (%)</Label>
              <Input id="commissionPct" type="number" step="0.1" min="0" max="100" value={form.commissionPct} onChange={(e) => updateField("commissionPct", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnRatePct">İade Oranı (%)</Label>
              <Input id="returnRatePct" type="number" step="0.1" min="0" max="100" value={form.returnRatePct} onChange={(e) => updateField("returnRatePct", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatPct">KDV (%)</Label>
              <Input id="vatPct" type="number" step="1" min="0" max="100" value={form.vatPct} onChange={(e) => updateField("vatPct", e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlySalesVolume">Aylık Satış</Label>
              <Input id="monthlySalesVolume" type="number" step="1" min="0" value={form.monthlySalesVolume} onChange={(e) => updateField("monthlySalesVolume", e.target.value)} disabled={loading} />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analizi Hesapla
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
