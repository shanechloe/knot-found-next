'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

type Step = string

type GeneratedIdea = {
  title: string
  type: string
  style: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  time: string
  materialsUsed: string
  steps: Step[]
  imageUrl?: string
}

type InventoryItem = {
  componentName: string
  color: string
  shape: string
  transparency: string
  finish: string
  approximateSize: string
  quantityVisible: string
  visualNotes: string
}

type DesignPlan = {
  designSummary: string
  materialsUsed: string[]
  materialsNotUsed: string[]
  layoutDescription: string
  riskCheck?: {
    usesOnlyApprovedInventory: boolean
    addsNewMaterials: boolean
    notes: string
  }
}

type ReviewIssue = {
  issue: string
  evidence: string
  severity: 'low' | 'medium' | 'high'
}

type ReviewResult = {
  passed: boolean
  violations: ReviewIssue[]
  missingOrAlteredMaterials: string[]
  addedMaterials: string[]
  recommendation: 'accept' | 'regenerate'
}

type StoredInput = {
  pieceType: string
  surprise: boolean
  styles?: string[]
  style?: string
  purpose: string
  difficulty: string
  description: string
  imageBase64: string | null
}

type StoredResult = {
  ideas?: GeneratedIdea[]
  warning?: string | null
  source?: string
  imageBase64?: string | null
  inventory?: {
    approvedInventory?: InventoryItem[]
    forbiddenInventory?: string[]
    uncertainItems?: string[]
  }
  designPlan?: DesignPlan
  review?: ReviewResult
  attempts?: Array<{
    attempt: number
    imageModel: string
    imageSize: string
    imageQuality: string
    review: ReviewResult
    violations: string[]
  }>
}

type WindowWithCharmchemy = Window & {
  __charmchemyLastInput?: StoredInput
  __charmchemyLastResult?: StoredResult
}

const LAST_INPUT_KEY = 'charmchemy:lastInput'
const LAST_RESULT_KEY = 'charmchemy:lastResult'

function safeReadStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(key) || window.sessionStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function safeImageSrc(value?: string | null) {
  return value && value.length > 0 ? value : null
}

function splitMaterials(value?: string) {
  if (!value) return []
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function difficultyDots(value: GeneratedIdea['difficulty']) {
  if (value === 'Easy') return [true, false, false]
  if (value === 'Medium') return [true, true, false]
  return [true, true, true]
}

function buildSummaryText(idea: GeneratedIdea, input: StoredInput | null) {
  const notes = input?.description?.trim() || ''
  return [
    idea.title,
    `Type: ${idea.type}`,
    `Style: ${idea.style}`,
    `Difficulty: ${idea.difficulty}`,
    `Time: ${idea.time}`,
    `Materials used: ${idea.materialsUsed}`,
    notes ? `User notes: ${notes}` : null,
    'Steps:',
    ...idea.steps.map((step, index) => `${index + 1}. ${step}`),
  ]
    .filter(Boolean)
    .join('\n')
}

function titleFromParts(type: string, style: string, suffix?: string) {
  const base = `${style} ${type}`.trim()
  return suffix ? `${base} ${suffix}` : base
}

function buildCards(idea: GeneratedIdea, input: StoredInput | null) {
  const materials = splitMaterials(idea.materialsUsed)
  const mainImage = safeImageSrc(idea.imageUrl) || safeImageSrc(input?.imageBase64) || null
  const cardBase = {
    type: idea.type,
    style: idea.style,
    difficulty: idea.difficulty,
    time: idea.time,
    materialsUsed: idea.materialsUsed,
    steps: idea.steps,
    imageUrl: mainImage || undefined,
    materials,
  }

  return [
    {
      tag: 'Design 1',
      badge: 'Primary result',
      title: idea.title,
      description: 'The strongest match for your uploaded materials and requested style.',
      featured: true,
      accent: 'light',
      ...cardBase,
    },
    {
      tag: 'Design 2',
      badge: 'Variation',
      title: titleFromParts(idea.type, idea.style, 'Study'),
      description: 'A slightly fuller layout that keeps the same inventory but shifts the rhythm.',
      accent: 'dark',
      ...cardBase,
    },
    {
      tag: 'Design 3',
      badge: 'Variation',
      title: titleFromParts(idea.type, idea.style, 'Remix'),
      description: 'A simplified finish with the same materials arranged into a quicker build.',
      accent: 'neutral',
      ...cardBase,
    },
  ]
}

export default function ResultsPage() {
  const router = useRouter()
  const [generatedResult, setGeneratedResult] = useState<StoredResult | null>(null)
  const [generatedInput, setGeneratedInput] = useState<StoredInput | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    const win = window as WindowWithCharmchemy
    setGeneratedResult(win.__charmchemyLastResult || safeReadStorage<StoredResult>(LAST_RESULT_KEY))
    setGeneratedInput(win.__charmchemyLastInput || safeReadStorage<StoredInput>(LAST_INPUT_KEY))
  }, [])

  const idea = generatedResult?.ideas?.[0]

  const cards = useMemo(() => {
    if (!idea) return []
    return buildCards(idea, generatedInput)
  }, [generatedInput, idea])

  const selectedCard = openIndex != null ? cards[openIndex] : null

  const summaryText = useMemo(() => {
    if (!idea) return ''
    return buildSummaryText(idea, generatedInput)
  }, [generatedInput, idea])

  const summaryLine = useMemo(() => {
    if (!generatedInput && !idea) return null
    const style = generatedInput?.style || idea?.style || 'Boho'
    const type = generatedInput?.pieceType || idea?.type || 'Jewelry'
    const purpose = generatedInput?.purpose || 'Everyday wear'
    const difficulty = generatedInput?.difficulty || idea?.difficulty || 'Medium'
    return `Style: ${style} | Type: ${type} | Purpose: ${purpose} | Difficulty: ${difficulty}`
  }, [generatedInput, idea])

  function handleStartOver() {
    router.push('/start')
  }

  async function handleCopyText(text = summaryText) {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1200)
    } catch {
      setCopyState('idle')
    }
  }

  function handleSaveImage(imageSrc?: string | null, title?: string) {
    const src = safeImageSrc(imageSrc)
    if (!src) return

    const link = document.createElement('a')
    link.href = src
    link.download = `${title || 'charmchemy-result'}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const hasResult = Boolean(idea)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            Charm<em>chemy</em>
          </Link>

          <div className={styles.progress} aria-label="Workflow progress">
            <div className={styles.progressStep}>
              <span className={styles.progressCircle}>1</span>
              <span>Materials &amp; style</span>
            </div>
            <span className={styles.progressLine} />
            <div className={`${styles.progressStep} ${styles.progressStepActive}`}>
              <span className={styles.progressCircle}>2</span>
              <span>Your designs</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.shell}>
        {hasResult ? (
          <>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <div className={styles.kicker}>Your results</div>
                <h1>Your jewelry ideas are ready.</h1>
                <p>Here are 3 makeable designs based on your materials.</p>
                {summaryLine ? <p className={styles.summaryLine}>{summaryLine}</p> : null}
                {generatedResult?.source ? (
                  <p className={styles.sourceLine}>
                    Source: <strong>{generatedResult.source === 'openai' ? 'OpenAI' : 'Fallback'}</strong>
                  </p>
                ) : null}
                {generatedResult?.warning ? (
                  <p className={styles.warning}>{generatedResult.warning}</p>
                ) : null}
              </div>

              <div className={styles.heroActions}>
                <button type="button" onClick={handleStartOver} className={styles.regenerateButton}>
                  Regenerate
                </button>
                <button type="button" onClick={handleStartOver} className={styles.secondaryLink}>
                  Start over
                </button>
              </div>
            </section>

            <section className={styles.grid}>
              {cards.map((card, index) => (
                <article
                  className={`${styles.card} ${index === 0 ? styles.cardFeatured : styles.cardVariant}`}
                  key={`${card.tag}-${index}`}
                >
                  <div className={styles.cardImageWrap}>
                    <span className={styles.cardTag}>{card.tag}</span>
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.cardFallback}>No generated image yet</div>
                    )}
                    <span className={styles.cardCaption}>Design render</span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardBadge}>{card.badge}</div>
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>

                    <div className={styles.miniLabel}>Made from your stash</div>
                    <div className={styles.materialRow}>
                      {card.materials.length > 0 ? (
                        card.materials.map(material => (
                          <span className={styles.materialChip} key={`${card.title}-${material}`}>
                            {material}
                          </span>
                        ))
                      ) : (
                        <span className={styles.materialChip}>Visible materials from photo</span>
                      )}
                    </div>

                    <div className={styles.difficultyRow}>
                      <span className={styles.miniLabel}>Difficulty</span>
                      <div className={styles.dots}>
                        {difficultyDots(card.difficulty).map((filled, dotIndex) => (
                          <span
                            key={`${card.title}-dot-${dotIndex}`}
                            className={`${styles.dot} ${filled ? styles.dotActive : ''}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button type="button" className={styles.viewButton} onClick={() => setOpenIndex(index)}>
                        View steps
                      </button>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => handleSaveImage(card.imageUrl, card.title)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => handleCopyText(summaryText)}
                      >
                        {copyState === 'copied' && index === 0 ? 'Copied' : 'Copy text'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <section className={styles.emptyState}>
            <div className={styles.emptyCard}>
              <div className={styles.kicker}>No generated result yet</div>
              <h1>Generate a design to see your result here.</h1>
              <p>
                We can only show the live result after you generate from the start page in this tab.
              </p>
              <div className={styles.emptyButtons}>
                <Link href="/start" className={styles.primaryButton}>
                  Start Creating
                </Link>
                <Link href="/" className={styles.secondaryLink}>
                  Back home
                </Link>
              </div>
            </div>
          </section>
        )}

        {selectedCard ? (
          <div
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            onClick={() => setOpenIndex(null)}
          >
            <div className={styles.modalPanel} onClick={e => e.stopPropagation()}>
              <div className={styles.modalImageWrap}>
                {selectedCard.imageUrl ? (
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.title}
                    className={styles.modalImage}
                  />
                ) : (
                  <div className={styles.modalFallback}>No generated image yet</div>
                )}
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setOpenIndex(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <h3>{selectedCard.title}</h3>
                <p>{selectedCard.description}</p>

                <div className={styles.modalBlocks}>
                  <div>
                    <div className={styles.modalLabel}>Materials used</div>
                    <div className={styles.modalChipRow}>
                      {selectedCard.materials.length > 0 ? (
                        selectedCard.materials.map(material => (
                          <span className={styles.modalChip} key={`${selectedCard.title}-${material}`}>
                            {material}
                          </span>
                        ))
                      ) : (
                        <span className={styles.modalChip}>Visible materials from photo</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className={styles.modalLabel}>You&apos;ll also need</div>
                    <div className={styles.modalChipRow}>
                      <span className={styles.modalChip}>Type: {selectedCard.type}</span>
                      <span className={styles.modalChip}>Style: {selectedCard.style}</span>
                      <span className={styles.modalChip}>Purpose: {generatedInput?.purpose || 'Everyday wear'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.stepsLabel}>Step-by-step</div>
                <div className={styles.stepsList}>
                  {selectedCard.steps.map((step, index) => (
                    <div className={styles.stepRow} key={`${selectedCard.title}-step-${index}`}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <div>{step}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => handleSaveImage(selectedCard.imageUrl, selectedCard.title)}
                  >
                    Save this design
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => handleCopyText(summaryText)}
                  >
                    {copyState === 'copied' ? 'Copied' : 'Copy text'}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setOpenIndex(null)}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
