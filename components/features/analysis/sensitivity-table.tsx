import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Scenario {
  label: string
  unitNetProfit: number
  marginPercent: number
  difference: number
}

interface SensitivityTableProps {
  scenarios: Scenario[]
}

function formatTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

export function SensitivityTable({ scenarios }: SensitivityTableProps) {
  if (scenarios.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Duyarlılık Analizi (10 Senaryo)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Senaryo</TableHead>
                <TableHead className="text-right">Birim Kâr</TableHead>
                <TableHead className="text-right">Marj</TableHead>
                <TableHead className="text-right">Fark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{s.label}</TableCell>
                  <TableCell className={`text-right font-medium ${s.unitNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatTRY(s.unitNetProfit)}
                  </TableCell>
                  <TableCell className={`text-right ${s.marginPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                    %{s.marginPercent.toFixed(1)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${s.difference >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {s.difference >= 0 ? "+" : ""}{formatTRY(s.difference)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
