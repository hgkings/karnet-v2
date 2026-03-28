// ----------------------------------------------------------------
// UserRepository — Katman 8
// Tablo: profiles
// ----------------------------------------------------------------

import { BaseRepository } from './base.repository'
import type { ProfileRow, PaginatedResult } from '@/lib/db/types'

export class UserRepository extends BaseRepository<ProfileRow> {
  protected tableName = 'profiles'

  async findByPlan(plan: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResult<ProfileRow>> {
    return this.findPaginated({ plan }, page, pageSize, {
      orderBy: 'created_at',
      orderDirection: 'desc',
    })
  }

  async findExpiring(days: number): Promise<ProfileRow[]> {
    const now = new Date()
    const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    const dayStart = target.toISOString().split('T')[0] + 'T00:00:00.000Z'
    const dayEnd = target.toISOString().split('T')[0] + 'T23:59:59.999Z'

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('pro_expires_at', dayStart)
      .lte('pro_expires_at', dayEnd)
      .eq('is_pro', true)

    if (error) {
      throw new Error(`Suresi dolacak kullanicilar getirilemedi: ${error.message}`)
    }

    return (data ?? []) as ProfileRow[]
  }

  async findExpired(): Promise<ProfileRow[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .lt('pro_expires_at', new Date().toISOString())
      .eq('is_pro', true)

    if (error) {
      throw new Error(`Suresi dolmus kullanicilar getirilemedi: ${error.message}`)
    }

    return (data ?? []) as ProfileRow[]
  }

  async searchByEmail(email: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResult<ProfileRow>> {
    const offset = (page - 1) * pageSize

    const { count, error: countError } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .ilike('email', `%${email}%`)

    if (countError) {
      throw new Error(`Kullanici arama sayisi basarisiz: ${countError.message}`)
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .ilike('email', `%${email}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      throw new Error(`Kullanici araması basarisiz: ${error.message}`)
    }

    return {
      data: (data ?? []) as ProfileRow[],
      total: count ?? 0,
      page,
      pageSize,
    }
  }
}
