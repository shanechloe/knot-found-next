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

type FallbackIdea = {
  title: string
  type: string
  style: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  time: string
  materialsUsed: string
  steps: string[]
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

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function normalizeDifficulty(value: unknown): FallbackIdea['difficulty'] {
  if (value === 'Easy' || value === 'Medium' || value === 'Difficult') return value
  return 'Medium'
}

function normalizeTypeLabel(type: string) {
  const trimmed = type.trim()
  return trimmed.toLowerCase() === 'surprise me' ? 'Jewelry Piece' : trimmed
}

function fallbackIdeas(input: Required<Pick<GenerateBody, 'materials' | 'style' | 'type' | 'purpose' | 'difficulty'>>): FallbackIdea[] {
  const normalizedType = normalizeTypeLabel(input.type)
  return [
    {
      title: `${input.style} ${normalizedType}`,
      type: normalizedType,
      style: input.style,
      difficulty: normalizeDifficulty(input.difficulty),
      time: '40 min',
      materialsUsed: input.materials || 'mixed stash pieces',
      steps: [
        'Sort your focal pieces and supporting beads by size.',
        'Build the base structure and secure the joins.',
        'Layer the remaining beads for texture and balance.',
        `Adjust the fit and finish for ${input.purpose.toLowerCase()}.`,
      ],
    },
  ]
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
  const normalized = {
    materials: cleanText(body.materials, 'mixed beads and chain offcuts'),
    style: cleanText(body.style, 'Boho'),
    type: cleanText(body.type, 'Necklace'),
    purpose: cleanText(body.purpose, 'Everyday wear'),
    difficulty: cleanText(body.difficulty, 'Medium'),
  }

  try {
    const result = await generateJewelryPipeline({
      materials: normalized.materials,
      style: normalized.style,
      type: normalized.type,
      purpose: normalized.purpose,
      difficulty: normalized.difficulty,
      images: Array.isArray(body.images) ? body.images.slice(0, 1).filter(Boolean) : [],
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      ideas: fallbackIdeas(normalized),
      source: 'fallback',
      warning: error instanceof Error ? error.message : 'Unknown generation error',
    })
  }
}
