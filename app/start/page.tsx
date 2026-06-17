'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const PIECE_TYPES = ['Earrings', 'Bracelet', 'Necklace', 'Ring', 'Charm', 'Surprise Me']
const STYLES = ['Minimal', 'Romantic', 'Vintage', 'Boho', 'Fairycore', 'Elegant', 'Playful', 'Statement']
const PURPOSES = ['Everyday wear', 'Gift', 'Party', 'Wedding', 'Market / Selling', 'Upcycle project']
const DIFFICULTIES = ['Easy', 'Medium', 'Difficult']

const LAST_INPUT_KEY = 'charmchemy:lastInput'

type StoredInput = {
  pieceType: string
  surprise: boolean
  styles: string[]
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
    if (raw.length > 200_000) return
    window.localStorage.setItem(key, raw)
    window.sessionStorage.setItem(key, raw)
  } catch {
    // Ignore storage quota errors. The live data stays in memory.
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

export default function StartPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [pieceType, setPieceType] = useState('Bracelet')
  const [surprise, setSurprise] = useState(false)
  const [stylesSelected, setStylesSelected] = useState<string[]>(['Romantic', 'Boho'])
  const [purpose, setPurpose] = useState('Everyday wear')
  const [difficulty, setDifficulty] = useState('Medium')
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

    setPieceType(stored.pieceType || 'Bracelet')
    setSurprise(Boolean(stored.surprise))
    setStylesSelected(Array.isArray(stored.styles) ? stored.styles : [])
    setPurpose(stored.purpose || 'Everyday wear')
    setDifficulty(stored.difficulty || 'Medium')
    setDescription(stored.description || '')
    setUploadedImage(stored.imageBase64 || null)
  }, [])

  function toggleStyle(style: string) {
    setStylesSelected(prev => (
      prev.includes(style) ? prev.filter(item => item !== style) : [...prev, style]
    ))
  }

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
    setStylesSelected([])
    setPurpose('Everyday wear')
    setDifficulty('Medium')
    setDescription('')
    setUploadedImage(null)
    setUploadedFileName(null)
    setErrorMessage(null)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleGenerate() {
    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const input: StoredInput = {
        pieceType,
        surprise,
        styles: stylesSelected,
        purpose,
        difficulty,
        description,
        imageBase64: uploadedImage,
      }

      ;(window as WindowWithCharmchemy).__charmchemyLastInput = input
      safeWriteSmallStorage(LAST_INPUT_KEY, {
        ...input,
        imageBase64: null,
      })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: description,
          style: stylesSelected.length > 0 ? stylesSelected.join(', ') : (surprise ? 'Surprise Me' : pieceType),
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

      ;(window as WindowWithCharmchemy).__charmchemyLastResult = payload
      router.push('/results')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate jewelry ideas right now.')
    } finally {
      setIsGenerating(false)
    }
  }

  const hasUploadedImage = Boolean(uploadedImage)

  return (
    <div className={styles.page}>
      <header className={styles.navWrap}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            Charm<em>chemy</em>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/">Home</Link>
            <Link href="/results">Results</Link>
          </div>
          <Link href="/" className={styles.navCta}>
            ← Home
          </Link>
        </nav>
      </header>

      <main className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              <span />
              Start creating
            </div>
            <h1>Upload your materials and get makeable jewelry ideas.</h1>
            <p>
              Show us your beads, charms, chains, findings, or leftover supplies. Charmchemy
              turns them into practical designs you can actually make.
            </p>
            <div className={styles.heroMeta}>
              <span>~15 seconds</span>
              <span>your images stay private</span>
              <span>no account needed</span>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroCardEyebrow}>Your workflow</div>
            <div className={styles.heroCardTitle}>Photo first, then optional notes.</div>
            <ul className={styles.heroCardList}>
              <li>Upload one clear photo of your stash</li>
              <li>Describe materials only if you want to</li>
              <li>Choose type, style, purpose, and difficulty</li>
              <li>Generate one result you can save or copy</li>
            </ul>
          </div>
        </section>

        <section className={styles.formLayout}>
          <div className={styles.primaryColumn}>
            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <div className={styles.sectionLabel}>Upload Photos</div>
                  <h2>Upload your materials</h2>
                </div>
                <div className={styles.panelHint}>Primary step</div>
              </div>
              <p className={styles.helperText}>
                Add a photo of your beads, charms, chains, findings, or leftover supplies.
              </p>

              <div
                className={`${styles.uploadZone} ${dragOver ? styles.uploadActive : ''}`}
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
                <div className={styles.uploadMark}>✦</div>
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

                {hasUploadedImage ? (
                  <div className={styles.previewBlock}>
                    <img
                      src={uploadedImage || ''}
                      alt="Uploaded materials preview"
                      className={styles.previewImage}
                    />
                    <div className={styles.previewMeta}>
                      <span>{uploadedFileName || 'Uploaded image'}</span>
                      <button
                        type="button"
                        className={styles.previewRemove}
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
                  <div className={styles.uploadTip}>Tip: lay your materials on a plain background.</div>
                )}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <div className={styles.sectionLabel}>Describe More Details</div>
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

          <aside className={styles.sideColumn}>
            <section className={styles.panel}>
              <div className={styles.sectionLabel}>Choose Jewelry Type</div>
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

            <section className={styles.panel}>
              <div className={styles.sectionLabel}>Choose Style</div>
              <h2>Choose a vibe</h2>
              <div className={styles.chipGrid}>
                {STYLES.map(style => (
                  <button
                    key={style}
                    type="button"
                    className={`${styles.chip} ${stylesSelected.includes(style) ? styles.chipActive : ''}`}
                    onClick={() => toggleStyle(style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.sectionLabel}>Choose Purpose</div>
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

            <section className={styles.panel}>
              <div className={styles.sectionLabel}>Difficulty</div>
              <h2>Choose a difficulty</h2>
              <div className={styles.segmented}>
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

            <section className={styles.actionPanel}>
              <button className={styles.generateButton} type="button" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Generating…' : 'Generate Ideas ✦'}
              </button>
              <p className={styles.generateMeta}>~15 seconds · your images stay private</p>
              <button className={styles.clearButton} type="button" onClick={handleClear}>
                Clear all
              </button>
              {errorMessage ? <p className={styles.errorMessage}>{errorMessage}</p> : null}
            </section>
          </aside>
        </section>
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
            <Link href="/results">Results</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>© 2025 Charmchemy</div>
      </footer>
    </div>
  )
}
