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

type StoredInput = {
  pieceType: string
  surprise: boolean
  styles: string[]
  purpose: string
  difficulty: string
  description: string
  imageBase64: string | null
}

type StoredResult = {
  ideas?: GeneratedIdea[]
  warning?: string | null
  source?: string
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

function safeImageSrc(value?: string) {
  return value && value.length > 0 ? value : null
}

export default function ResultsPage() {
  const router = useRouter()
  const [generatedResult, setGeneratedResult] = useState<StoredResult | null>(null)
  const [generatedInput, setGeneratedInput] = useState<StoredInput | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  useEffect(() => {
    const win = window as WindowWithCharmchemy
    setGeneratedResult(win.__charmchemyLastResult || safeReadStorage<StoredResult>(LAST_RESULT_KEY))
    setGeneratedInput(win.__charmchemyLastInput || safeReadStorage<StoredInput>(LAST_INPUT_KEY))
  }, [])

  const idea = generatedResult?.ideas?.[0]

  const summaryText = useMemo(() => {
    if (!idea) return ''
    return [
      idea.title,
      `Type: ${idea.type}`,
      `Style: ${idea.style}`,
      `Difficulty: ${idea.difficulty}`,
      `Time: ${idea.time}`,
      `Materials used: ${idea.materialsUsed}`,
      'Steps:',
      ...idea.steps.map((step, index) => `${index + 1}. ${step}`),
    ].join('\n')
  }, [idea])

  async function handleCopyText() {
    if (!summaryText) return
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1200)
    } catch {
      setCopyState('idle')
    }
  }

  function handleSaveImage() {
    const imageSrc = safeImageSrc(idea?.imageUrl)
    if (!imageSrc) return

    const link = document.createElement('a')
    link.href = imageSrc
    link.download = `${idea?.title || 'charmchemy-result'}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  function handleRegenerate() {
    router.push('/start')
  }

  const heroSummary = useMemo(() => {
    if (!idea && !generatedInput) return null

    const pieces = [
      generatedInput?.pieceType || idea?.type || 'Jewelry',
      ...(generatedInput?.styles || []).slice(0, 2),
      generatedInput?.purpose || 'Everyday wear',
      generatedInput?.difficulty || idea?.difficulty || 'Medium',
    ].filter(Boolean)

    return pieces.join(' · ')
  }, [generatedInput, idea])

  const hasResult = Boolean(idea)
  const imageSrc = safeImageSrc(idea?.imageUrl)

  return (
    <div className={styles.page}>
      <header className={styles.navWrap}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            Charm<em>chemy</em>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/">Home</Link>
            <Link href="/start">Start</Link>
          </div>
          <button type="button" onClick={handleRegenerate} className={styles.navCta}>
            Regenerate
          </button>
        </nav>
      </header>

      <main className={styles.shell}>
        {hasResult ? (
          <>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <div className={styles.kicker}>
                  <span />
                  Your results
                </div>
                <h1>Your jewelry ideas are ready.</h1>
                <p>Here is 1 makeable design based on your materials.</p>
                {generatedResult?.source ? (
                  <p className={styles.sourceLine}>
                    Source: <strong>{generatedResult.source}</strong>
                  </p>
                ) : null}
                {heroSummary ? <div className={styles.heroMeta}>{heroSummary}</div> : null}
                {generatedResult?.warning ? (
                  <p className={styles.warning}>{generatedResult.warning}</p>
                ) : null}
              </div>

              <div className={styles.heroCard}>
                <div className={styles.heroCardEyebrow}>What came back</div>
                <div className={styles.heroCardTitle}>{idea?.title}</div>
                <div className={styles.heroCardMeta}>
                  <span>{idea?.type}</span>
                  <span>{idea?.style}</span>
                  <span>{idea?.difficulty}</span>
                  <span>{idea?.time}</span>
                </div>
              </div>
            </section>

            <section className={styles.resultLayout}>
              <article className={styles.imagePanel}>
                <div className={styles.imageFrame}>
                  {imageSrc ? (
                    <img src={imageSrc} alt={idea?.title || 'Generated jewelry'} className={styles.resultImage} />
                  ) : (
                    <div className={styles.imageFallback}>
                      No generated image yet
                    </div>
                  )}
                </div>
                <div className={styles.imageMeta}>
                  <span>Generated image</span>
                  <span>{idea?.type}</span>
                </div>
              </article>

              <article className={styles.detailPanel}>
                <div className={styles.detailHead}>
                  <div className={styles.sectionLabel}>Design 1</div>
                  <h2>{idea?.title}</h2>
                </div>

                <div className={styles.detailGrid}>
                  <div>
                    <strong>Type</strong>
                    <span>{idea?.type}</span>
                  </div>
                  <div>
                    <strong>Style</strong>
                    <span>{idea?.style}</span>
                  </div>
                  <div>
                    <strong>Difficulty</strong>
                    <span>{idea?.difficulty}</span>
                  </div>
                  <div>
                    <strong>Time</strong>
                    <span>{idea?.time}</span>
                  </div>
                </div>

                <div className={styles.materialBlock}>
                  <strong>Materials used</strong>
                  <p>{idea?.materialsUsed}</p>
                </div>

                <div className={styles.stepsBlock}>
                  <strong>Steps</strong>
                  <ol>
                    {idea?.steps.map((step, index) => (
                      <li key={`${step}-${index}`}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className={styles.buttonRow}>
                  <button type="button" onClick={handleSaveImage} className={styles.secondaryButton}>
                    Save image
                  </button>
                  <button type="button" onClick={handleCopyText} className={styles.secondaryButton}>
                    {copyState === 'copied' ? 'Copied' : 'Copy text'}
                  </button>
                  <button type="button" onClick={handleRegenerate} className={styles.primaryButton}>
                    Regenerate
                  </button>
                </div>
              </article>
            </section>
          </>
        ) : (
          <section className={styles.emptyState}>
            <div className={styles.emptyCard}>
              <div className={styles.kicker}>
                <span />
                No generated result yet
              </div>
              <h1>Generate a design to see your result here.</h1>
              <p>
                We can only show the live result after you generate from the start page in this tab.
              </p>
              <div className={styles.emptyButtons}>
                <Link href="/start" className={styles.primaryButton}>
                  Start Creating
                </Link>
                <Link href="/" className={styles.secondaryButton}>
                  Back home
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <Link href="/" className={styles.footerLogo}>
              Charm<em>chemy</em>
            </Link>
            <p>Made from maybe. Designed by AI. Crafted by you.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/">Home</Link>
            <Link href="/start">Start</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>© 2025 Charmchemy</div>
      </footer>
    </div>
  )
}
