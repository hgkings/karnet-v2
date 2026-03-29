import { Analysis } from '@/types'

export async function getStoredAnalyses(): Promise<Analysis[]> {
  const res = await fetch('/api/analyses')
  if (!res.ok) throw new Error('Analizler yüklenemedi')
  return res.json()
}

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const res = await fetch(`/api/analyses/${id}`)
  if (!res.ok) return null
  return res.json()
}

export async function saveAnalysis(analysis: Analysis): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analysis),
  })
  return res.json()
}

export async function deleteAnalysis(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/analyses/${id}`, {
    method: 'DELETE',
  })
  return res.json()
}

export async function getUserAnalysisCount(): Promise<number> {
  const res = await fetch('/api/analyses/count')
  if (!res.ok) return 0
  const data = await res.json()
  return data.count ?? 0
}

// Compat wrapper for v2 dashboard page
export const analysesApi = {
  list: async () => {
    const data = await getStoredAnalyses();
    return { success: true, data };
  },
  delete: async (id: string) => deleteAnalysis(id),
  getById: async (id: string) => {
    const data = await getAnalysisById(id);
    return { success: !!data, data };
  },
};

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}