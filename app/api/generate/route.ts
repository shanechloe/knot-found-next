import { NextResponse } from 'next/server'

type GenerateBody = {
  materials?: string
  style?: string
  type?: string
  purpose?: string
  difficulty?: string
  images?: string[]
}

type Idea = {
  title: string
  type: string
  style: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  time: string
  materialsUsed: string
  steps: string[]
  imageUrl?: string
}

type ImageUsage = {
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  input_tokens_details?: {
    text_tokens?: number
    image_tokens?: number
    cached_tokens?: number
  }
  output_tokens_details?: {
    text_tokens?: number
    image_tokens?: number
  }
}

type ChatUsage = {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  prompt_tokens_details?: {
    cached_tokens?: number
  }
}

const IMAGE_PRICING_PER_1M = {
  textInput: 5,
  textCachedInput: 1.25,
  imageInput: 10,
  imageOutput: 40,
} as const

const CHAT_PRICING_PER_1M = {
  input: Number(process.env.OPENAI_GPT41_MINI_INPUT_PER_1M_USD ?? '0.4'),
  cachedInput: Number(process.env.OPENAI_GPT41_MINI_CACHED_INPUT_PER_1M_USD ?? '0.1'),
  output: Number(process.env.OPENAI_GPT41_MINI_OUTPUT_PER_1M_USD ?? '1.6'),
} as const

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

function estimateImageCostUSD(usage: ImageUsage): number | undefined {
  const inputDetails = usage.input_tokens_details
  const outputDetails = usage.output_tokens_details

  if (!inputDetails || !outputDetails) return undefined

  const textInputTokens = inputDetails.text_tokens ?? 0
  const imageInputTokens = inputDetails.image_tokens ?? 0
  const cachedInputTokens = inputDetails.cached_tokens ?? 0
  const imageOutputTokens = outputDetails.image_tokens ?? 0

  const nonCachedTextInputTokens = Math.max(0, textInputTokens - cachedInputTokens)
  const nonCachedImageInputTokens = imageInputTokens

  const cost =
    (nonCachedTextInputTokens / 1_000_000) * IMAGE_PRICING_PER_1M.textInput +
    (cachedInputTokens / 1_000_000) * IMAGE_PRICING_PER_1M.textCachedInput +
    (nonCachedImageInputTokens / 1_000_000) * IMAGE_PRICING_PER_1M.imageInput +
    (imageOutputTokens / 1_000_000) * IMAGE_PRICING_PER_1M.imageOutput

  return Number.isFinite(cost) ? cost : undefined
}

function estimateChatCostUSD(usage: ChatUsage): number | undefined {
  const promptTokens = usage.prompt_tokens ?? 0
  const completionTokens = usage.completion_tokens ?? 0
  const cachedTokens = usage.prompt_tokens_details?.cached_tokens ?? 0
  const nonCachedPromptTokens = Math.max(0, promptTokens - cachedTokens)

  const cost =
    (nonCachedPromptTokens / 1_000_000) * CHAT_PRICING_PER_1M.input +
    (cachedTokens / 1_000_000) * CHAT_PRICING_PER_1M.cachedInput +
    (completionTokens / 1_000_000) * CHAT_PRICING_PER_1M.output

  return Number.isFinite(cost) ? cost : undefined
}

function toDifficulty(value: unknown): Idea['difficulty'] {
  if (value === 'Easy' || value === 'Medium' || value === 'Difficult') return value
  return 'Medium'
}

function normalizeIdea(input: unknown, index: number, defaults: Required<Pick<GenerateBody, 'style' | 'type' | 'materials' | 'purpose' | 'difficulty'>>): Idea {
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

function normalizeRequestedType(type: string) {
  const value = type.trim().toLowerCase()
  if (!value || value === 'surprise me') return 'Surprise Me'
  if (value.includes('necklace')) return 'Necklace'
  if (value.includes('bracelet')) return 'Bracelet'
  if (value.includes('earring')) return 'Earrings'
  if (value.includes('ring')) return 'Ring'
  if (value.includes('charm')) return 'Charm'
  return type
}

async function generateIdeaImage(apiKey: string, idea: Idea): Promise<string | undefined> {
  try {
    const imageSize = process.env.OPENAI_IMAGE_SIZE || '1024x1024'
    const imageQuality = process.env.OPENAI_IMAGE_QUALITY || 'low'

    const requestedType = normalizeRequestedType(idea.type)
    const pieceInstruction =
      requestedType === 'Surprise Me'
        ? 'Pick the most suitable single jewelry type from: necklace, bracelet, earrings, ring, or charm.'
        : `Generate exactly this jewelry type: ${requestedType}.`

    const prompt = [
      'Create a polished Chinese marketplace jewelry showcase image in a warm-beige studio palette.',
      'Use a clean collage layout: one main hero shot of the full jewelry piece plus 2-3 smaller close-up detail panels.',
      'Include clear views of clasp, extension chain, bead grouping, and craftsmanship details.',
      'Visual style should feel premium, soft, romantic, handcrafted, and giftable.',
      pieceInstruction,
      `Style: ${idea.style}.`,
      `Piece type: ${idea.type}.`,
      `Materials: ${idea.materialsUsed}.`,
      'Use ALL available materials from the uploaded photo and the user input material list. Do not invent new materials.',
      'Create a realistic design that can actually be made from the provided supplies.',
      'Main panel must show the full piece completely in frame and visually centered.',
      'Detail panels should show bead texture and color transitions in macro close-up.',
      'Use soft diffused lighting, subtle shadows, high realism, ultra-clean composition.',
      'No people, no hands, no watermark, no logo.',
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
        size: imageSize,
        quality: imageQuality,
      }),
    })

    if (!response.ok) return undefined
    const data = (await response.json()) as {
      data?: Array<{ url?: string; b64_json?: string }>
      usage?: ImageUsage
    }

    const usage = data.usage
    const estimatedCost = usage ? estimateImageCostUSD(usage) : undefined
    const textIn = usage?.input_tokens_details?.text_tokens ?? 0
    const imageIn = usage?.input_tokens_details?.image_tokens ?? 0
    const imageOut = usage?.output_tokens_details?.image_tokens ?? 0
    const total = usage?.total_tokens ?? 0
    const costText = typeof estimatedCost === 'number' ? `$${estimatedCost.toFixed(4)}` : 'n/a'
    console.info(
      `[openai:image] cost=${costText} model=gpt-image-1 quality=${imageQuality} size=${imageSize} total_tokens=${total} text_in=${textIn} image_in=${imageIn} image_out=${imageOut}`,
    )

    const first = data.data?.[0]
    if (!first) return undefined
    if (first.url) return first.url
    if (first.b64_json) return `data:image/png;base64,${first.b64_json}`
    return undefined
  } catch {
    return undefined
  }
}

function fallbackIdeas(input: Required<Pick<GenerateBody, 'materials' | 'style' | 'type' | 'purpose' | 'difficulty'>>): Idea[] {
  const normalizedType = input.type === 'Surprise Me' ? 'Jewelry Piece' : input.type
  return [
    {
      title: `${input.style} Drift ${normalizedType}`,
      type: normalizedType,
      style: input.style,
      difficulty: toDifficulty(input.difficulty),
      time: '40 min',
      materialsUsed: input.materials || 'mixed stash pieces',
      steps: [
        'Sort your focal pieces and supporting beads by size.',
        'Build the base structure and secure with jump rings.',
        'Layer texture elements for depth and movement.',
        `Adjust proportions for ${input.purpose.toLowerCase()} and complete closures.`,
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

  const images = Array.isArray(body.images) ? body.images.slice(0, 1).filter(Boolean) : []
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      ideas: fallbackIdeas(normalized),
      source: 'fallback',
      warning: 'OPENAI_API_KEY not configured. Showing fallback ideas.',
    })
  }

  try {
    const requestedType = normalizeRequestedType(normalized.type)
    const typeInstruction =
      requestedType === 'Surprise Me'
        ? 'Choose the best single output type from: Necklace, Bracelet, Earrings, Ring, Charm.'
        : `Output type must be exactly: ${requestedType}.`

    const content: Array<Record<string, unknown>> = [
      {
        type: 'text',
        text:
          `Generate 1 practical DIY jewelry design idea as strict JSON. ` +
          `Input: materials=${normalized.materials}, style=${normalized.style}, type=${normalized.type}, purpose=${normalized.purpose}, difficulty=${normalized.difficulty}. ` +
          `${typeInstruction} ` +
          `Use ALL available materials from the uploaded photo and the user input material list. Do not invent new materials. ` +
          `Create a realistic design that can actually be made from the provided supplies. ` +
          `Return JSON with this shape only: {"ideas":[{"title":"","type":"","style":"","difficulty":"Easy|Medium|Difficult","time":"","materialsUsed":"","steps":["",""]}]}. ` +
          `Return exactly 1 idea and it must have exactly 4 concise steps.`,
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
              'You are a jewelry design assistant. Prioritize material-faithful, makeable designs based only on visible uploaded materials. Return only valid JSON and no markdown.',
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
      usage?: ChatUsage
    }

    const chatUsage = data.usage
    const chatEstimatedCost = chatUsage ? estimateChatCostUSD(chatUsage) : undefined
    const chatCostText = typeof chatEstimatedCost === 'number' ? `$${chatEstimatedCost.toFixed(4)}` : 'n/a'
    const promptTokens = chatUsage?.prompt_tokens ?? 0
    const completionTokens = chatUsage?.completion_tokens ?? 0
    const totalTokens = chatUsage?.total_tokens ?? 0
    const cachedPromptTokens = chatUsage?.prompt_tokens_details?.cached_tokens ?? 0
    console.info(
      `[openai:ideas] cost=${chatCostText} model=gpt-4.1-mini total_tokens=${totalTokens} prompt_tokens=${promptTokens} completion_tokens=${completionTokens} cached_prompt_tokens=${cachedPromptTokens} images_in_context=${images.length}`,
    )

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

    const ideas = rawIdeas.slice(0, 1).map((idea, idx) => normalizeIdea(idea, idx, normalized))

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
