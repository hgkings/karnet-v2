import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    commitMsg: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'local development',
    env: process.env.VERCEL_ENV || 'development',
    deployedAt: new Date().toISOString(),
  })
}
