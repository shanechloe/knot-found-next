import OpenAI, { toFile } from 'openai'

import {
  DESIGN_PLAN_JSON_SCHEMA,
  INVENTORY_EXTRACTION_JSON_SCHEMA,
  REVIEW_JSON_SCHEMA,
  buildDesignPlanPrompt,
  buildImageGenerationPrompt,
  buildInventoryExtractionPrompt,
  buildReviewPrompt,
  type DesignPlan,
  type DesignPlanSchema,
  type InventoryExtractionResult,
  type InventoryExtractionSchema,
  type InventoryItem,
  type ReviewResult,
  type ReviewSchema,
} from '@/lib/charmchemy/prompts'

export type GenerateJewelryRequest = {
  materials?: string
  style?: string
  type?: string
  purpose?: string
  difficulty?: string
  images?: string[]
}

export type JewelryIdea = {
  title: string
  type: string
  style: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  time: string
  materialsUsed: string
  steps: string[]
  imageUrl?: string
}

export type GenerationAttempt = {
  attempt: number
  imageModel: string
  imageSize: string
  imageQuality: string
  review: ReviewResult
  violations: string[]
}

export type GenerateJewelryResult = {
  ideas: JewelryIdea[]
  source: 'openai' | 'fallback'
  warning: string | null
  imageBase64?: string
  inventory?: InventoryExtractionResult
  designPlan?: DesignPlan
  review?: ReviewResult
  attempts?: GenerationAttempt[]
}

const DEFAULT_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
const DEFAULT_IMAGE_SIZE = process.env.OPENAI_IMAGE_SIZE || '1024x1024'
const DEFAULT_IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'low'
export const MAX_IMAGE_REGEN_ATTEMPTS = Number(process.env.CHARMCHEMY_MAX_IMAGE_REGEN_ATTEMPTS || '3')
const MAX_DESIGN_PLAN_ATTEMPTS = 2

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function normalizeDifficulty(value: unknown): JewelryIdea['difficulty'] {
  if (value === 'Easy' || value === 'Medium' || value === 'Difficult') return value
  return 'Medium'
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

function normalizeTypeLabel(type: string) {
  const normalized = normalizeRequestedType(type)
  return normalized === 'Surprise Me' ? 'Jewelry Piece' : normalized
}

function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isInventoryReference(value: string, inventory: InventoryItem[]) {
  const text = normalizeLabel(value)
  if (!text) return false

  for (const item of inventory) {
    const candidates = [
      item.componentName,
      item.color,
      item.shape,
      item.transparency,
      item.finish,
      item.approximateSize,
      item.quantityVisible,
      item.visualNotes,
    ]

    for (const candidate of candidates) {
      const normalizedCandidate = normalizeLabel(candidate)
      if (!normalizedCandidate) continue
      if (text === normalizedCandidate) return true
      if (text.includes(normalizedCandidate) || normalizedCandidate.includes(text)) return true
    }
  }

  return false
}

function parseJson<T>(value: string): T {
  const parsed = JSON.parse(value) as T
  return parsed
}

function safeParseJson<T>(value: string): T | null {
  try {
    return parseJson<T>(value)
  } catch {
    const match = value.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return parseJson<T>(match[0])
    } catch {
      return null
    }
  }
}

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || ''
}

function getImageDataUrl(images?: string[]) {
  return Array.isArray(images) ? images[0] : undefined
}

function getMimeTypeFromDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,/)
  return match?.[1] || 'image/png'
}

function getBase64FromDataUrl(dataUrl: string) {
  const commaIndex = dataUrl.indexOf(',')
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl
}

async function dataUrlToUploadableFile(dataUrl: string, fileName: string) {
  const mimeType = getMimeTypeFromDataUrl(dataUrl)
  const base64 = getBase64FromDataUrl(dataUrl)
  return toFile(Buffer.from(base64, 'base64'), fileName, { type: mimeType })
}

function createClient(apiKey: string) {
  return new OpenAI({ apiKey })
}

function fallbackIdeas(input: Required<Pick<GenerateJewelryRequest, 'materials' | 'style' | 'type' | 'purpose' | 'difficulty'>>): JewelryIdea[] {
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

function normalizeInventoryResult(result: InventoryExtractionSchema): InventoryExtractionResult {
  return {
    approvedInventory: Array.isArray(result.approvedInventory) ? result.approvedInventory : [],
    forbiddenInventory: Array.isArray(result.forbiddenInventory) ? result.forbiddenInventory : [],
    uncertainItems: Array.isArray(result.uncertainItems) ? result.uncertainItems : [],
  }
}

function normalizeDesignPlanResult(result: DesignPlanSchema, inventory: InventoryItem[]): DesignPlan {
  const materialsUsed = Array.isArray(result.materialsUsed) ? result.materialsUsed.map((item) => cleanText(item, '')).filter(Boolean) : []
  const materialsNotUsed = Array.isArray(result.materialsNotUsed)
    ? result.materialsNotUsed.map((item) => cleanText(item, '')).filter(Boolean)
    : []

  const approvedNames = inventory.map((item) => item.componentName)
  const invalidMaterials = materialsUsed.filter((material) => !isInventoryReference(material, inventory))
  const usesOnlyApprovedInventory = invalidMaterials.length === 0

  const designPlan: DesignPlan = {
    designSummary: cleanText(result.designSummary, 'Material-faithful jewelry concept'),
    materialsUsed: materialsUsed.length > 0 ? materialsUsed : approvedNames.slice(0, Math.min(3, approvedNames.length)),
    materialsNotUsed: materialsNotUsed.length > 0 ? materialsNotUsed : [],
    layoutDescription: cleanText(result.layoutDescription, 'Arrange the visible materials into a balanced finished jewelry piece.'),
    riskCheck: {
      usesOnlyApprovedInventory,
      addsNewMaterials: !usesOnlyApprovedInventory || Boolean(result.riskCheck?.addsNewMaterials),
      notes: cleanText(
        result.riskCheck?.notes,
        usesOnlyApprovedInventory
          ? 'Approved inventory only.'
          : `Some materials referenced by the plan did not clearly match the approved inventory: ${invalidMaterials.join(', ')}.`,
      ),
    },
  }

  if (!designPlan.riskCheck.usesOnlyApprovedInventory) {
    designPlan.materialsUsed = designPlan.materialsUsed.filter((material) => isInventoryReference(material, inventory))
  }

  if (designPlan.materialsUsed.length === 0) {
    designPlan.materialsUsed = approvedNames.slice(0, Math.min(3, approvedNames.length))
  }

  return designPlan
}

function buildIdeaFromPlan(input: {
  type: string
  style: string
  difficulty: string
  materials: string
  designPlan: DesignPlan
  imageBase64?: string
}): JewelryIdea {
  const type = normalizeTypeLabel(input.type)
  const titleSource = cleanText(input.designPlan.designSummary, `${input.style} ${type}`)

  return {
    title: titleSource,
    type,
    style: input.style,
    difficulty: normalizeDifficulty(input.difficulty),
    time: '35 min',
    materialsUsed: input.designPlan.materialsUsed.length > 0
      ? input.designPlan.materialsUsed.join(', ')
      : cleanText(input.materials, 'Visible uploaded materials'),
    steps: [
      cleanText(input.designPlan.layoutDescription.split('. ')[0], 'Arrange the visible materials into the main structure.'),
      'Secure each connection using only the visible findings and components from the reference image.',
      'Balance the piece so the final arrangement matches the approved inventory.',
      'Finish and check that no new materials were introduced.',
    ],
    imageUrl: input.imageBase64,
  }
}

async function extractInventory(client: OpenAI, imageDataUrl: string): Promise<InventoryExtractionResult> {
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a strict visual inventory extractor for jewelry materials. Return only valid JSON and never add commentary.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildInventoryExtractionPrompt(),
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl,
              detail: 'low',
            },
          },
        ],
      },
    ],
    response_format: INVENTORY_EXTRACTION_JSON_SCHEMA,
  })

  const content = response.choices[0]?.message?.content || ''
  const parsed = safeParseJson<InventoryExtractionSchema>(content)
  if (!parsed) {
    throw new Error('Inventory extraction returned invalid JSON.')
  }

  return normalizeInventoryResult(parsed)
}

async function createDesignPlan(
  client: OpenAI,
  input: Required<Pick<GenerateJewelryRequest, 'materials' | 'style' | 'type' | 'purpose' | 'difficulty'>>,
  inventory: InventoryItem[],
): Promise<DesignPlan> {
  const requestedType = normalizeRequestedType(input.type)
  const typeInstruction =
    requestedType === 'Surprise Me'
      ? 'Choose the best single output type from: Necklace, Bracelet, Earrings, Ring, Charm.'
      : `Output type must be exactly: ${requestedType}.`

  const prompt = [
    buildDesignPlanPrompt({
      inventory,
      type: input.type,
      style: input.style,
      purpose: input.purpose,
      difficulty: input.difficulty,
      userNotes: input.materials,
    }),
    '',
    typeInstruction,
    'Use the approved inventory exactly as written and do not introduce any extra hardware or decorative elements.',
    'If a requested material is not visible, omit it entirely.',
    'The materialsUsed array must only include approved inventory items.',
  ].join('\n')

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a jewelry design planner. Return only valid JSON and prioritize inventory accuracy over creativity.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: DESIGN_PLAN_JSON_SCHEMA,
  })

  const content = response.choices[0]?.message?.content || ''
  const parsed = safeParseJson<DesignPlanSchema>(content)
  if (!parsed) {
    throw new Error('Design plan returned invalid JSON.')
  }

  const normalized = normalizeDesignPlanResult(parsed, inventory)
  if (!normalized.riskCheck.usesOnlyApprovedInventory) {
    throw new Error(`Design plan referenced materials outside the approved inventory: ${normalized.riskCheck.notes}`)
  }

  return normalized
}

async function generateJewelryImage(
  client: OpenAI,
  referenceImageDataUrl: string,
  inventory: InventoryItem[],
  designPlan: DesignPlan,
  input: Required<Pick<GenerateJewelryRequest, 'materials' | 'style' | 'type' | 'purpose' | 'difficulty'>>,
  previousViolations: string[] = [],
) {
  const imagePrompt = buildImageGenerationPrompt({
    inventory,
    designPlan,
    style: input.style,
    type: input.type,
    userNotes: input.materials,
    previousViolations,
  })

  const referenceFile = await dataUrlToUploadableFile(referenceImageDataUrl, 'charchemy-reference.png')

  const response = await client.images.edit({
    model: DEFAULT_IMAGE_MODEL,
    image: referenceFile,
    prompt: imagePrompt,
    background: 'auto',
    input_fidelity: 'high',
    output_format: 'png',
    quality: DEFAULT_IMAGE_QUALITY as 'low' | 'medium' | 'high' | 'auto',
    size: DEFAULT_IMAGE_SIZE as string,
    n: 1,
  })

  const first = response.data?.[0]
  if (!first?.b64_json) {
    throw new Error('Image generation returned no image data.')
  }

  return {
    imageBase64: `data:image/png;base64,${first.b64_json}`,
    prompt: imagePrompt,
    usage: response.usage,
  }
}

async function reviewGeneratedImage(
  client: OpenAI,
  originalImageDataUrl: string,
  generatedImageDataUrl: string,
  inventory: InventoryItem[],
  designPlan: DesignPlan,
  input: Required<Pick<GenerateJewelryRequest, 'materials' | 'style' | 'type' | 'purpose' | 'difficulty'>>,
): Promise<ReviewResult> {
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a strict jewelry inventory auditor. Return only valid JSON.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: buildReviewPrompt({
              inventory,
              designPlan,
              type: input.type,
              style: input.style,
              userNotes: input.materials,
            }),
          },
          {
            type: 'image_url',
            image_url: {
              url: originalImageDataUrl,
              detail: 'low',
            },
          },
          {
            type: 'image_url',
            image_url: {
              url: generatedImageDataUrl,
              detail: 'low',
            },
          },
        ],
      },
    ],
    response_format: REVIEW_JSON_SCHEMA,
  })

  const content = response.choices[0]?.message?.content || ''
  const parsed = safeParseJson<ReviewSchema>(content)
  if (!parsed) {
    throw new Error('Image review returned invalid JSON.')
  }

  return {
    passed: Boolean(parsed.passed),
    violations: Array.isArray(parsed.violations)
      ? parsed.violations.map((violation) => ({
          issue: cleanText(violation.issue, ''),
          evidence: cleanText(violation.evidence, ''),
          severity:
            violation.severity === 'low' || violation.severity === 'medium' || violation.severity === 'high'
              ? violation.severity
              : 'medium',
        }))
      : [],
    missingOrAlteredMaterials: Array.isArray(parsed.missingOrAlteredMaterials)
      ? parsed.missingOrAlteredMaterials.map((item) => cleanText(item, '')).filter(Boolean)
      : [],
    addedMaterials: Array.isArray(parsed.addedMaterials) ? parsed.addedMaterials.map((item) => cleanText(item, '')).filter(Boolean) : [],
    recommendation: parsed.recommendation === 'accept' ? 'accept' : 'regenerate',
  }
}

function summarizeViolations(review: ReviewResult) {
  const textViolations = review.violations.map((violation) => `${violation.issue}${violation.evidence ? ` (${violation.evidence})` : ''}`)
  const missing = review.missingOrAlteredMaterials.map((item) => `missing/altered: ${item}`)
  const added = review.addedMaterials.map((item) => `added: ${item}`)
  return [...textViolations, ...missing, ...added].filter(Boolean)
}

export async function generateJewelryPipeline(input: GenerateJewelryRequest): Promise<GenerateJewelryResult> {
  const normalized = {
    materials: cleanText(input.materials, 'mixed beads and chain offcuts'),
    style: cleanText(input.style, 'Boho'),
    type: cleanText(input.type, 'Necklace'),
    purpose: cleanText(input.purpose, 'Everyday wear'),
    difficulty: cleanText(input.difficulty, 'Medium'),
  }

  const referenceImageDataUrl = getImageDataUrl(input.images)
  if (!referenceImageDataUrl) {
    return {
      ideas: fallbackIdeas(normalized),
      source: 'fallback',
      warning: 'No uploaded image was provided. Showing fallback ideas.',
    }
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      ideas: fallbackIdeas(normalized),
      source: 'fallback',
      warning: 'OPENAI_API_KEY not configured. Showing fallback ideas.',
    }
  }

  const client = createClient(apiKey)
  const inventory = await extractInventory(client, referenceImageDataUrl)

  let designPlan: DesignPlan | null = null
  let designPlanError: unknown = null

  for (let attempt = 1; attempt <= MAX_DESIGN_PLAN_ATTEMPTS; attempt += 1) {
    try {
      designPlan = await createDesignPlan(client, normalized, inventory.approvedInventory)
      designPlanError = null
      break
    } catch (error) {
      designPlanError = error
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[charmchemy:design-plan] attempt=${attempt} failed`, error)
      }
    }
  }

  if (!designPlan) {
    const approvedNames = inventory.approvedInventory.map((item) => item.componentName)
    designPlan = {
      designSummary: `${normalized.style} ${normalizeTypeLabel(normalized.type)}`,
      materialsUsed: approvedNames.slice(0, Math.min(3, approvedNames.length)),
      materialsNotUsed: inventory.forbiddenInventory,
      layoutDescription: 'Use only approved inventory and keep the layout simple and makeable.',
      riskCheck: {
        usesOnlyApprovedInventory: approvedNames.length > 0,
        addsNewMaterials: false,
        notes:
          designPlanError instanceof Error
            ? `Fallback plan used after design-plan validation failed: ${designPlanError.message}`
            : 'Fallback plan used because the design plan could not be validated.',
      },
    }
  }

  const attempts: GenerationAttempt[] = []
  let finalImageBase64: string | undefined
  let finalReview: ReviewResult | undefined
  let currentViolations: string[] = []

  for (let attempt = 1; attempt <= MAX_IMAGE_REGEN_ATTEMPTS; attempt += 1) {
    const generation = await generateJewelryImage(
      client,
      referenceImageDataUrl,
      inventory.approvedInventory,
      designPlan,
      normalized,
      currentViolations,
    )

    const review = await reviewGeneratedImage(
      client,
      referenceImageDataUrl,
      generation.imageBase64,
      inventory.approvedInventory,
      designPlan,
      normalized,
    )

    attempts.push({
      attempt,
      imageModel: DEFAULT_IMAGE_MODEL,
      imageSize: DEFAULT_IMAGE_SIZE,
      imageQuality: DEFAULT_IMAGE_QUALITY as 'low' | 'medium' | 'high' | 'auto',
      review,
      violations: summarizeViolations(review),
    })

    finalImageBase64 = generation.imageBase64
    finalReview = review

    if (process.env.NODE_ENV !== 'production') {
      const imageTokenText = generation.usage?.input_tokens ?? 'n/a'
      console.info(
        `[charmchemy:image] attempt=${attempt} model=${DEFAULT_IMAGE_MODEL} size=${DEFAULT_IMAGE_SIZE} quality=${DEFAULT_IMAGE_QUALITY} input_tokens=${imageTokenText} passed=${review.passed} recommendation=${review.recommendation}`,
      )
    }

    if (review.passed && review.recommendation === 'accept') {
      break
    }

    currentViolations = summarizeViolations(review)
  }

  const finalIdea = buildIdeaFromPlan({
    type: normalized.type,
    style: normalized.style,
    difficulty: normalized.difficulty,
    materials: normalized.materials,
    designPlan,
    imageBase64: finalImageBase64,
  })

  const warning =
    finalReview && finalReview.passed && finalReview.recommendation === 'accept'
      ? null
      : 'Inventory compliance was not fully achieved.'

  return {
    ideas: [finalIdea],
    source: 'openai',
    warning,
    imageBase64: finalImageBase64,
    inventory,
    designPlan,
    review: finalReview,
    attempts,
  }
}
