const MARKETPLACE_LABELS: Record<string, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  n11: 'N11',
  amazon_tr: 'Amazon TR',
  custom: 'Özel',
};

export function getMarketplaceLabel(id: string): string {
  return MARKETPLACE_LABELS[id] ?? id;
}
