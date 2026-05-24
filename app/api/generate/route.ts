import { NextResponse } from 'next/server'

type GenerateBody = {
  materials?: string
  style?: string
  type?: string
  purpose?: string
  images?: string[]
}

type Idea = {
  title: string
  type: string
  style: string
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  time: string
  materialsUsed: string
  steps: string[]
  imageUrl?: string
}

function toDifficulty(value: unknown): Idea['difficulty'] {
  if (value === 'Easy' || value === 'Medium' || value === 'Advanced') return value
  return 'Medium'
}

function normalizeIdea(input: unknown, index: number, defaults: Required<Pick<GenerateBody, 'style' | 'type' | 'materials' | 'purpose'>>): Idea {
  const maybe = (input && typeof input === 'object') ? (input as Record<string, unknown>) : {}
  const ideaType = cleanText(maybe.type, defaults.type === 'Surprise Me' ? 'Jewelry Piece' : defaults.type)
  return {
    title: cleanText(maybe.title, `AI Design ${index + 1}`),
    type: ideaType,
    style: cleanText(maybe.style, defaults.style),
    difficulty: toDifficulty(maybe.difficulty),
    time: cleanText(maybe.time, '35 min'),
    materialsUsed: cleanText(maybe.materialsUsed, defaults.materials),
    steps: Array.isArray(maybe.steps)
      ? maybe.steps.map((s) => cleanText(s, '')).filter(Boolean).slice(0, 4)
      : ['Arrange your selected pieces.', 'Assemble core structure.', 'Add accents and secure joins.', 'Test fit and finalize.'],
  }
}

async function generateIdeaImage(apiKey: string, idea: Idea): Promise<string | undefined> {
  try {
    const prompt = [
      'Editorial jewelry product photo on soft neutral background.',
      `Style: ${idea.style}.`,
      `Piece type: ${idea.type}.`,
      `Materials: ${idea.materialsUsed}.`,
      'High detail, premium lighting, clean composition, no text, no watermark.',
    ].join(' ')

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
      }),
    })

    if (!response.ok) return undefined
    const data = (await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> }
    const first = data.data?.[0]
    if (!first) return undefined
    if (first.url) return first.url
    if (first.b64_json) return `data:image/png;base64,${first.b64_json}`
    return undefined
  } catch {
    return undefined
  }
}

function fallbackIdeas(input: Required<Pick<GenerateBody, 'materials' | 'style' | 'type' | 'purpose'>>): Idea[] {
  const normalizedType = input.type === 'Surprise Me' ? 'Jewelry Piece' : input.type
  return [
    {
      title: 'Moonlit Pearl Drops',
      type: 'Earrings',
      style: 'Romantic',
      difficulty: 'Easy',
      time: '25 min',
      materialsUsed: 'pearl beads, gold hooks, small clear beads',
      steps: [
        'Arrange one pearl bead with two clear beads.',
        'Attach them to a head pin.',
        'Connect to the earring hook.',
        'Repeat for the second earring.',
      ],
    },
    {
      title: `${input.style} Drift ${normalizedType}`,
      type: normalizedType,
      style: input.style,
      difficulty: 'Medium',
      time: '40 min',
      materialsUsed: input.materials || 'mixed stash pieces',
      steps: [
        'Sort your focal pieces and supporting beads by size.',
        'Build the base structure and secure with jump rings.',
        'Layer texture elements for depth and movement.',
        `Adjust proportions for ${input.purpose.toLowerCase()} and complete closures.`,
      ],
    },
    {
      title: `Last-Bit ${normalizedType} Remix`,
      type: normalizedType,
      style: input.style === 'Minimal' ? 'Playful' : input.style,
      difficulty: 'Easy',
      time: '30 min',
      materialsUsed: `${input.materials || 'remaining components'} + leftover findings`,
      steps: [
        'Group remaining components into 2-3 mini sets.',
        'Create an asymmetrical but balanced arrangement.',
        'Attach all pieces securely with consistent spacing.',
        'Refine proportions and test wearability.',
      ],
    },
  ]
}

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateBody

  const normalized = {
    materials: cleanText(body.materials, 'mixed beads and chain offcuts'),
    style: cleanText(body.style, 'Boho'),
    type: cleanText(body.type, 'Necklace'),
    purpose: cleanText(body.purpose, 'Everyday wear'),
  }

  const images = Array.isArray(body.images) ? body.images.slice(0, 3).filter(Boolean) : []
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      ideas: fallbackIdeas(normalized),
      source: 'fallback',
      warning: 'OPENAI_API_KEY not configured. Showing fallback ideas.',
    })
  }

  try {
    const content: Array<Record<string, unknown>> = [
      {
        type: 'text',
        text:
          `Generate 3 practical DIY jewelry design ideas as strict JSON. ` +
          `Input: materials=${normalized.materials}, style=${normalized.style}, type=${normalized.type}, purpose=${normalized.purpose}. ` +
          `Return JSON with this shape only: {"ideas":[{"title":"","type":"","style":"","difficulty":"Easy|Medium|Advanced","time":"","materialsUsed":"","steps":["",""]}]}. ` +
          `Each idea must have exactly 4 concise steps.`,
      },
    ]

    for (const image of images) {
      content.push({
        type: 'image_url',
        image_url: {
          url: image,
          detail: 'low',
        },
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a jewelry design assistant. Return only valid JSON and no markdown.',
          },
          {
            role: 'user',
            content,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI error: ${response.status} ${errorText}`)
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content ?? ''
    const parsed = tryParseJson(raw) as { ideas?: unknown[] } | unknown[] | null
    const rawIdeas = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as { ideas?: unknown[] }).ideas)
        ? (parsed as { ideas?: unknown[] }).ideas!
        : []

    if (rawIdeas.length === 0) {
      return NextResponse.json({
        ideas: fallbackIdeas(normalized),
        source: 'fallback',
        warning: 'Model response was not parseable JSON. Showing fallback ideas.',
      })
    }

    const ideas = rawIdeas.slice(0, 3).map((idea, idx) => normalizeIdea(idea, idx, normalized))

    for (let i = 0; i < ideas.length; i += 1) {
      const imageUrl = await generateIdeaImage(apiKey, ideas[i])
      if (imageUrl) ideas[i].imageUrl = imageUrl
    }

    return NextResponse.json({ ideas, source: 'openai' })
  } catch (error) {
    return NextResponse.json({
      ideas: fallbackIdeas(normalized),
      source: 'fallback',
      warning: error instanceof Error ? error.message : 'Unknown generation error',
    })
  }
}
