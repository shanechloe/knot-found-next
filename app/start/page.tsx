'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const PIECE_TYPES = ['Earrings', 'Bracelet', 'Necklace', 'Ring', 'Charm', 'Surprise Me'] as const
const STYLES = ['Minimal', 'Romantic', 'Vintage', 'Boho', 'Fairycore', 'Elegant', 'Playful', 'Statement'] as const
const PURPOSES = ['Everyday wear', 'Gift', 'Party', 'Wedding', 'Market / Selling', 'Upcycle project'] as const
const DIFFICULTIES = ['Easy', 'Medium', 'Difficult'] as const

const LAST_INPUT_KEY = 'charmchemy:lastInput'
const LAST_RESULT_KEY = 'charmchemy:lastResult'

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

type WindowWithCharmchemy = Window & {
  __charmchemyLastInput?: StoredInput
  __charmchemyLastResult?: unknown
}

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

function safeWriteSmallStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    const raw = JSON.stringify(value)
    if (raw.length > 250_000) return
    window.localStorage.setItem(key, raw)
    window.sessionStorage.setItem(key, raw)
  } catch {
    // Ignore storage quota errors. The live data still stays in memory.
  }
}

function safeRemoveStorage(key: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  } catch {
    // Ignore storage errors.
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Could not read the uploaded image.'))
    reader.readAsDataURL(file)
  })
}

function getSelectedStyle(stored: StoredInput | null) {
  return stored?.style || stored?.styles?.[0] || 'Boho'
}

export default function StartPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [pieceType, setPieceType] = useState<(typeof PIECE_TYPES)[number]>('Bracelet')
  const [surprise, setSurprise] = useState(false)
  const [style, setStyle] = useState<(typeof STYLES)[number]>('Boho')
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>('Everyday wear')
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('Medium')
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const win = window as WindowWithCharmchemy
    const stored = win.__charmchemyLastInput || safeReadStorage<StoredInput>(LAST_INPUT_KEY)
    if (!stored) return

    setPieceType((stored.pieceType as (typeof PIECE_TYPES)[number]) || 'Bracelet')
    setSurprise(Boolean(stored.surprise))
    setStyle(getSelectedStyle(stored) as (typeof STYLES)[number])
    setPurpose((stored.purpose as (typeof PURPOSES)[number]) || 'Everyday wear')
    setDifficulty((stored.difficulty as (typeof DIFFICULTIES)[number]) || 'Medium')
    setDescription(stored.description || '')
    setUploadedImage(stored.imageBase64 || null)
  }, [])

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  async function handleImageFiles(files: FileList | File[] | null | undefined) {
    const file = files ? Array.from(files).find(item => item.type.startsWith('image/')) : null
    if (!file) return

    const dataUrl = await fileToDataUrl(file)
    setUploadedImage(dataUrl)
    setUploadedFileName(file.name)
    setErrorMessage(null)
  }

  function handleClear() {
    setPieceType('Bracelet')
    setSurprise(false)
    setStyle('Boho')
    setPurpose('Everyday wear')
    setDifficulty('Medium')
    setDescription('')
    setUploadedImage(null)
    setUploadedFileName(null)
    setErrorMessage(null)

    safeRemoveStorage(LAST_INPUT_KEY)
    safeRemoveStorage(LAST_RESULT_KEY)
    const win = window as WindowWithCharmchemy
    win.__charmchemyLastInput = undefined
    win.__charmchemyLastResult = undefined

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleGenerate() {
    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const input: StoredInput = {
        pieceType,
        surprise,
        style,
        purpose,
        difficulty,
        description,
        imageBase64: uploadedImage,
      }

      const win = window as WindowWithCharmchemy
      win.__charmchemyLastInput = input
      safeWriteSmallStorage(LAST_INPUT_KEY, {
        ...input,
        imageBase64: null,
      })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: description,
          style,
          type: surprise ? 'Surprise Me' : pieceType,
          purpose,
          difficulty,
          images: uploadedImage ? [uploadedImage] : [],
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to generate jewelry ideas right now.')
      }

      win.__charmchemyLastResult = payload
      safeWriteSmallStorage(LAST_RESULT_KEY, {
        ...payload,
        imageBase64: null,
      })

      router.push('/results')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate jewelry ideas right now.')
    } finally {
      setIsGenerating(false)
    }
  }

  const activeType = surprise ? 'Surprise Me' : pieceType
  const hasUploadedImage = Boolean(uploadedImage)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            Charm<em>chemy</em>
          </Link>

          <div className={styles.progress} aria-label="Workflow progress">
            <div className={`${styles.progressStep} ${styles.progressStepActive}`}>
              <span className={styles.progressCircle}>1</span>
              <span>Materials &amp; style</span>
            </div>
            <span className={styles.progressLine} />
            <div className={styles.progressStep}>
              <span className={styles.progressCircle}>2</span>
              <span>Your designs</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.hero}>
          <div>
            <div className={styles.kicker}>Start creating</div>
            <h1 className={styles.title}>Create your AI jewelry design plan</h1>
            <p className={styles.subtitle}>
              Tell Charmchemy what you have and the style you want. We&apos;ll generate 3 makeable
              design directions.
            </p>
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.leftColumn}>
            <section className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.sectionKicker}>Upload your materials</div>
                  <h2>Upload your materials</h2>
                </div>
              </div>
              <p className={styles.helperText}>
                Add photos of your beads, charms, chains, findings, or leftover supplies.
              </p>

              <div
                className={`${styles.uploadArea} ${dragOver ? styles.uploadAreaActive : ''}`}
                onClick={openFilePicker}
                onDragOver={e => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={async e => {
                  e.preventDefault()
                  setDragOver(false)
                  await handleImageFiles(e.dataTransfer.files)
                }}
              >
                {hasUploadedImage ? (
                  <div className={styles.previewWrap}>
                    <img
                      src={uploadedImage || ''}
                      alt="Uploaded materials preview"
                      className={styles.previewImage}
                    />
                    <div className={styles.previewBar}>
                      <span>{uploadedFileName || 'Uploaded image'}</span>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={e => {
                          e.stopPropagation()
                          setUploadedImage(null)
                          setUploadedFileName(null)
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIcon}>✦</div>
                    <div className={styles.uploadTitle}>Drag and drop a single photo here</div>
                    <p className={styles.uploadCopy}>Or click the button below to browse your device.</p>
                    <button
                      className={styles.uploadButton}
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        openFilePicker()
                      }}
                    >
                      Upload photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async e => {
                        await handleImageFiles(e.target.files)
                        e.currentTarget.value = ''
                      }}
                    />
                    <div className={styles.tip}>Tip: lay your materials on a plain background.</div>
                  </>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.sectionKicker}>Describe More Details</div>
                  <h2>
                    Describe more details <span className={styles.optional}>Optional</span>
                  </h2>
                </div>
              </div>
              <p className={styles.helperText}>
                Tell us anything helpful, like colors, quantities, materials, or pieces you really
                want to use.
              </p>
              <textarea
                className={styles.textarea}
                placeholder='For example: "I have 6 pearl beads, some gold wire, and I want something simple for everyday wear."'
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </section>
          </div>

          <div className={styles.rightColumn}>
            <section className={styles.card}>
              <div className={styles.sectionKicker}>Choose Jewelry Type</div>
              <h2>What would you like to make?</h2>
              <p className={styles.helperText}>Not sure? Choose Surprise Me and let Charmchemy decide.</p>
              <div className={styles.chipGrid}>
                {PIECE_TYPES.map(type => {
                  const isActive = surprise ? type === 'Surprise Me' : pieceType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                      onClick={() => {
                        if (type === 'Surprise Me') {
                          setSurprise(true)
                          return
                        }
                        setPieceType(type)
                        setSurprise(false)
                      }}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionKicker}>Choose Style</div>
              <h2>Choose a vibe</h2>
              <div className={styles.chipGrid}>
                {STYLES.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.chip} ${style === item ? styles.chipActive : ''}`}
                    onClick={() => setStyle(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionKicker}>Choose Purpose</div>
              <h2>What is it for?</h2>
              <div className={styles.chipGrid}>
                {PURPOSES.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.chip} ${purpose === item ? styles.chipActive : ''}`}
                    onClick={() => setPurpose(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionKicker}>Difficulty</div>
              <h2>How hard should it be?</h2>
              <div className={styles.segmented} role="tablist" aria-label="Difficulty">
                {DIFFICULTIES.map(item => (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.segment} ${difficulty === item ? styles.segmentActive : ''}`}
                    onClick={() => setDifficulty(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className={`${styles.card} ${styles.actionsCard}`}>
              <button
                className={styles.generateButton}
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                Generate Ideas ✦
              </button>
              <div className={styles.generateMeta}>~15 seconds · your images stay private</div>
              <button type="button" className={styles.clearButton} onClick={handleClear}>
                Clear all
              </button>
              {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
            </section>
          </div>
        </section>

        {isGenerating ? (
          <div className={styles.loadingOverlay} role="status" aria-live="polite">
            <div className={styles.loadingCard}>
              <div className={styles.loadingSpinner} />
              <div className={styles.loadingGlow}>✦</div>
              <h2>Mixing your materials…</h2>
              <p>Reading colors, counting beads, and sketching 3 makeable directions.</p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
