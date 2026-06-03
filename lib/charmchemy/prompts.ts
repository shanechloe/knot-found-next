export type InventoryItem = {
  componentName: string
  color: string
  shape: string
  transparency: string
  finish: string
  approximateSize: string
  quantityVisible: string
  visualNotes: string
}

export type InventoryExtractionResult = {
  approvedInventory: InventoryItem[]
  forbiddenInventory: string[]
  uncertainItems: string[]
}

export type InventoryExtractionSchema = {
  approvedInventory: InventoryItem[]
  forbiddenInventory: string[]
  uncertainItems: string[]
}

export type DesignPlan = {
  designSummary: string
  materialsUsed: string[]
  materialsNotUsed: string[]
  layoutDescription: string
  riskCheck: {
    usesOnlyApprovedInventory: boolean
    addsNewMaterials: boolean
    notes: string
  }
}

export type DesignPlanSchema = DesignPlan

export type ReviewViolation = {
  issue: string
  evidence: string
  severity: 'low' | 'medium' | 'high'
}

export type ReviewResult = {
  passed: boolean
  violations: ReviewViolation[]
  missingOrAlteredMaterials: string[]
  addedMaterials: string[]
  recommendation: 'accept' | 'regenerate'
}

export type ReviewSchema = ReviewResult

function formatInventoryList(inventory: InventoryItem[]) {
  return inventory
    .map(
      (item, index) =>
        `${index + 1}. ${item.componentName} | color: ${item.color} | shape: ${item.shape} | transparency: ${item.transparency} | finish: ${item.finish} | size: ${item.approximateSize} | quantity: ${item.quantityVisible} | notes: ${item.visualNotes}`,
    )
    .join('\n')
}

function formatForbiddenList(forbiddenInventory: string[]) {
  if (forbiddenInventory.length === 0) return 'None'
  return forbiddenInventory.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

function formatMaterialsList(materials: string[]) {
  if (materials.length === 0) return 'None'
  return materials.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

export function buildInventoryExtractionPrompt() {
  return [
    'Analyze the uploaded image and extract the complete visible jewelry material inventory.',
    '',
    'The uploaded image is the complete and exclusive material inventory, not a style reference.',
    '',
    'Return only valid JSON.',
    '',
    'Rules:',
    '- Only include beads and components that are clearly visible in the uploaded image.',
    '- Do not guess hidden materials.',
    '- Do not invent standard jewelry hardware.',
    '- Do not include chains, clasps, spacers, pearls, charms, pendants, or metal findings unless they are clearly visible.',
    '- Identify each component by color, shape, transparency, finish, approximate size, and quantity if visually countable.',
    '- Also list materials that must not be added.',
    '',
    'JSON format:',
    '{',
    '  "approvedInventory": [',
    '    {',
    '      "componentName": "",',
    '      "color": "",',
    '      "shape": "",',
    '      "transparency": "",',
    '      "finish": "",',
    '      "approximateSize": "",',
    '      "quantityVisible": "",',
    '      "visualNotes": ""',
    '    }',
    '  ],',
    '  "forbiddenInventory": [],',
    '  "uncertainItems": []',
    '}',
  ].join('\n')
}

export const INVENTORY_EXTRACTION_JSON_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'charmchemy_inventory_extraction',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['approvedInventory', 'forbiddenInventory', 'uncertainItems'],
      properties: {
        approvedInventory: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: [
              'componentName',
              'color',
              'shape',
              'transparency',
              'finish',
              'approximateSize',
              'quantityVisible',
              'visualNotes',
            ],
            properties: {
              componentName: { type: 'string' },
              color: { type: 'string' },
              shape: { type: 'string' },
              transparency: { type: 'string' },
              finish: { type: 'string' },
              approximateSize: { type: 'string' },
              quantityVisible: { type: 'string' },
              visualNotes: { type: 'string' },
            },
          },
        },
        forbiddenInventory: {
          type: 'array',
          items: { type: 'string' },
        },
        uncertainItems: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
} as const

export function buildDesignPlanPrompt(input: {
  inventory: InventoryItem[]
  type: string
  style: string
  purpose: string
  difficulty: string
  userNotes: string
}) {
  return [
    'Create a jewelry design plan using only the approved inventory.',
    '',
    'The uploaded image inventory is the only allowed material source.',
    '',
    'Rules:',
    '- Use only approvedInventory.',
    '- Do not use forbiddenInventory.',
    '- Do not add standard jewelry hardware unless it appears in approvedInventory.',
    '- If the user request conflicts with approvedInventory, prioritize approvedInventory.',
    '- The design must look like the uploaded beads were physically rearranged.',
    '- Material accuracy has the highest priority.',
    '',
    `Jewelry type: ${input.type}`,
    `Style: ${input.style}`,
    `Purpose: ${input.purpose}`,
    `Difficulty: ${input.difficulty}`,
    `User notes: ${input.userNotes || 'None'}`,
    '',
    'Approved inventory:',
    formatInventoryList(input.inventory),
    '',
    'Rules for materialsUsed:',
    '- Each entry must reference only an approved inventory item or a clear subset of an approved item.',
    '- Do not add any new materials, hardware, charms, chains, spacers, or decorative elements.',
    '- If a requested material is not present in the approved inventory, leave it out.',
    '',
    'Return only valid JSON.',
    '',
    'JSON format:',
    '{',
    '  "designSummary": "",',
    '  "materialsUsed": [],',
    '  "materialsNotUsed": [],',
    '  "layoutDescription": "",',
    '  "riskCheck": {',
    '    "usesOnlyApprovedInventory": true,',
    '    "addsNewMaterials": false,',
    '    "notes": ""',
    '  }',
    '}',
  ].join('\n')
}

export const DESIGN_PLAN_JSON_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'charmchemy_design_plan',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['designSummary', 'materialsUsed', 'materialsNotUsed', 'layoutDescription', 'riskCheck'],
      properties: {
        designSummary: { type: 'string' },
        materialsUsed: {
          type: 'array',
          items: { type: 'string' },
        },
        materialsNotUsed: {
          type: 'array',
          items: { type: 'string' },
        },
        layoutDescription: { type: 'string' },
        riskCheck: {
          type: 'object',
          additionalProperties: false,
          required: ['usesOnlyApprovedInventory', 'addsNewMaterials', 'notes'],
          properties: {
            usesOnlyApprovedInventory: { type: 'boolean' },
            addsNewMaterials: { type: 'boolean' },
            notes: { type: 'string' },
          },
        },
      },
    },
  },
} as const

export function buildImageGenerationPrompt(input: {
  inventory: InventoryItem[]
  designPlan: DesignPlan
  style: string
  type: string
  userNotes: string
  previousViolations?: string[]
}) {
  const previousViolations = input.previousViolations ?? []

  return [
    'Create a realistic editorial jewelry product photo using the uploaded reference image as the only source of materials.',
    '',
    'Use ONLY the beads, charms, stones, crystals, pearls, metal parts, colors, shapes, textures, sizes, and finishes that are clearly visible in the uploaded image.',
    'Do not invent, add, replace, recolor, reshape, resize, simplify, polish, stylize, or reinterpret any material.',
    'Do not introduce any new beads, gemstones, charms, pendants, chains, clasps, spacers, spacer beads, pearls, stones, crystals, wires, jump rings, connectors, metal findings, decorative props, packaging, textures, or colors that are not visible in the uploaded image.',
    '',
    `Design style: ${input.style}.`,
    `Jewelry type: ${input.type}.`,
    `User notes: ${input.userNotes || 'None'}.`,
    `Design summary: ${input.designPlan.designSummary}.`,
    `Layout description: ${input.designPlan.layoutDescription}.`,
    `Approved inventory: ${formatInventoryList(input.inventory)}`,
    `Materials explicitly used in the plan: ${input.designPlan.materialsUsed.join(', ') || 'None'}`,
    `Materials explicitly not used in the plan: ${input.designPlan.materialsNotUsed.join(', ') || 'None'}`,
    '',
    'The final image must look like the exact uploaded materials were physically rearranged into a finished jewelry piece.',
    input.previousViolations && input.previousViolations.length > 0
      ? `The previous generation failed because it added or altered these materials: ${previousViolations.join('; ')}. Explicitly forbid them in this attempt.`
      : '',
    '',
    'Material accuracy is more important than beauty, creativity, symmetry, luxury styling, or editorial aesthetics.',
    'If the requested notes mention materials that are not visible in the uploaded image, ignore those unavailable materials and use only visible materials from the image.',
    '',
    'Photo requirements:',
    '- Simple realistic product photo',
    '- Soft neutral background',
    '- Clean composition',
    '- Natural shadows',
    '- Sharp focus',
    '- Accurate colors',
    '- No text',
    '- No logo',
    '- No watermark',
    '- No people',
    '- No hands',
    '- No props',
    '- No packaging',
    '- No extra materials',
  ]
    .filter(Boolean)
    .join('\n\n')
}

export const REVIEW_JSON_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'charmchemy_review',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['passed', 'violations', 'missingOrAlteredMaterials', 'addedMaterials', 'recommendation'],
      properties: {
        passed: { type: 'boolean' },
        violations: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['issue', 'evidence', 'severity'],
            properties: {
              issue: { type: 'string' },
              evidence: { type: 'string' },
              severity: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
          },
        },
        missingOrAlteredMaterials: {
          type: 'array',
          items: { type: 'string' },
        },
        addedMaterials: {
          type: 'array',
          items: { type: 'string' },
        },
        recommendation: {
          type: 'string',
          enum: ['accept', 'regenerate'],
        },
      },
    },
  },
} as const

export function buildReviewPrompt(input: {
  inventory: InventoryItem[]
  designPlan: DesignPlan
  type: string
  style: string
  userNotes: string
}) {
  return [
    'Compare the generated jewelry image against the uploaded material inventory.',
    '',
    'Check whether the generated image uses only the approved inventory.',
    '',
    'The first image is the original uploaded reference image.',
    'The second image is the generated jewelry product image.',
    '',
    `Jewelry type: ${input.type}`,
    `Style: ${input.style}`,
    `User notes: ${input.userNotes || 'None'}`,
    '',
    'Approved inventory:',
    formatInventoryList(input.inventory),
    '',
    'Design plan:',
    JSON.stringify(input.designPlan, null, 2),
    '',
    'Return only valid JSON.',
    '',
    'JSON format:',
    '{',
    '  "passed": true,',
    '  "violations": [',
    '    {',
    '      "issue": "",',
    '      "evidence": "",',
    '      "severity": "low | medium | high"',
    '    }',
    '  ],',
    '  "missingOrAlteredMaterials": [],',
    '  "addedMaterials": [],',
    '  "recommendation": "accept | regenerate"',
    '}',
    '',
    'Review failure conditions:',
    '- The generated image contains any bead, charm, chain, clasp, spacer bead, pendant, pearl, gemstone, metal finding, wire, connector, decorative prop, or material that is not in approvedInventory.',
    '- The generated image changes the color, shape, transparency, finish, pattern, or texture of the uploaded materials too much.',
    '- The generated image uses common jewelry components that were not visible in the uploaded image.',
    '- The generated image prioritizes a prettier jewelry design over material accuracy.',
  ].join('\n')
}

export function summarizeInventoryForDebug(inventory: InventoryItem[]) {
  return formatInventoryList(inventory)
}

export function summarizeMaterialsForDebug(materials: string[]) {
  return formatMaterialsList(materials)
}

export function summarizeForbiddenForDebug(materials: string[]) {
  return formatForbiddenList(materials)
}
