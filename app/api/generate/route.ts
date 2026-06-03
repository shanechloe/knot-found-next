import { NextResponse } from 'next/server'

import { generateJewelryPipeline } from '@/lib/charmchemy/generateJewelry'

type GenerateBody = {
  materials?: string
  style?: string
  type?: string
  purpose?: string
  difficulty?: string
  images?: string[]
}

const REQUEST_MIN_INTERVAL_MS = 30_000
const recentGenerateRequests = new Map<string, number>()

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

function isRateLimited(clientId: string) {
  const now = Date.now()

  for (const [id, lastAt] of recentGenerateRequests) {
    if (now - lastAt > REQUEST_MIN_INTERVAL_MS) recentGenerateRequests.delete(id)
  }

  const lastAt = recentGenerateRequests.get(clientId)
  if (typeof lastAt === 'number' && now - lastAt < REQUEST_MIN_INTERVAL_MS) {
    return true
  }

  recentGenerateRequests.set(clientId, now)
  return false
}

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request)
  if (isRateLimited(clientId)) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please wait 30 seconds and try again.',
      },
      { status: 429 },
    )
  }

  const body = (await request.json()) as GenerateBody

  try {
    const result = await generateJewelryPipeline({
      materials: body.materials,
      style: body.style,
      type: body.type,
      purpose: body.purpose,
      difficulty: body.difficulty,
      images: Array.isArray(body.images) ? body.images.slice(0, 1).filter(Boolean) : [],
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown generation error',
      },
      { status: 500 },
    )
  }
}
