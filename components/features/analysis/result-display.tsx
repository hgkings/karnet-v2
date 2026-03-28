import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { KpiCard } from "@/components/shared/kpi-card"

interface ResultDisplayProps {
  outputs: Record<string, unknown>
}

function formatTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

function num(v: unknown): number {
  return typeof v === "number" ? v : 0
}

export function ResultDisplay({ outputs }: ResultDisplayProps) {
  const unitProfit = num(outputs.unit_net_profit ?? outputs.unitNetProfit)
  const margin = num(outputs.margin_pct ?? outputs.marginPercent)
  const monthlyProfit = num(outputs.monthly_net_profit ?? outputs.monthlyNetProfit)
  const monthlyRevenue = num(outputs.monthly_revenue ?? outputs.monthlyRevenue)
  const breakeven = num(outputs.breakeven_price ?? outputs.breakevenPrice)
  const salePrice = num(outputs.sale_price ?? outputs.salePrice)

  const commissionAmount = num(outputs.commission_amount ?? outputs.commissionAmount)
  const vatAmount = num(outputs.vat_amount ?? outputs.vatAmount)
  const returnLoss = num(outputs.expected_return_loss ?? outputs.expectedReturnLoss)
  const variableCost = num(outputs.unit_variable_cost ?? outputs.unitVariableCost)
  const totalCost = num(outputs.unit_total_cost ?? outputs.unitTotalCost)

  return (
    <div className="space-y-6">
      {/* KPI kartlari */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Satış Fiyatı"
          value={formatTRY(salePrice)}
        />
        <KpiCard
          title="Birim Kâr"
          value={formatTRY(unitProfit)}
          variant={unitProfit >= 0 ? "profit" : "loss"}
        />
        <KpiCard
          title="Kâr Marjı"
          value={`%${margin.toFixed(1)}`}
          variant={margin >= 0 ? "profit" : "loss"}
        />
        <KpiCard
          title="Aylık Net Kâr"
          value={formatTRY(monthlyProfit)}
          variant={monthlyProfit >= 0 ? "profit" : "loss"}
        />
        <KpiCard
          title="Aylık Ciro"
          value={formatTRY(monthlyRevenue)}
        />
        <KpiCard
          title="Başabaş Noktası"
          value={isFinite(breakeven) ? formatTRY(breakeven) : "∞"}
        />
      </div>

      {/* Maliyet dagilimi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Maliyet Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kalem</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variableCost > 0 && (
                  <TableRow>
                    <TableCell>Değişken Maliyetler (ürün + kargo + paketleme + reklam + diğer + servis)</TableCell>
                    <TableCell className="text-right">{formatTRY(variableCost)}</TableCell>
                  </TableRow>
                )}
                {commissionAmount > 0 && (
                  <TableRow>
                    <TableCell>Komisyon</TableCell>
                    <TableCell className="text-right">{formatTRY(commissionAmount)}</TableCell>
                  </TableRow>
                )}
                {vatAmount > 0 && (
                  <TableRow>
                    <TableCell>KDV</TableCell>
                    <TableCell className="text-right">{formatTRY(vatAmount)}</TableCell>
                  </TableRow>
                )}
                {returnLoss > 0 && (
                  <TableRow>
                    <TableCell>İade Kaybı</TableCell>
                    <TableCell className="text-right">{formatTRY(returnLoss)}</TableCell>
                  </TableRow>
                )}
                <TableRow className="font-semibold border-t-2">
                  <TableCell>Toplam Birim Maliyet</TableCell>
                  <TableCell className="text-right">{formatTRY(totalCost)}</TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Birim Net Kâr</TableCell>
                  <TableCell className={`text-right ${unitProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatTRY(unitProfit)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
