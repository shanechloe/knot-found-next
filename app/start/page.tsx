'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const PIECE_TYPES = ['Necklace', 'Bracelet', 'Earrings', 'Ring', 'Charm']
const VIBES = ['Minimal', 'Romantic', 'Vintage', 'Boho', 'Fairycore', 'Elegant', 'Playful', 'Statement']
const OCCASIONS = ['Everyday wear', 'Gift', 'Party', 'Wedding', 'Market / Selling', 'Upcycle project']
const DIFFICULTIES = ['Easy', 'Medium', 'Difficult']
const LAST_INPUT_KEY = 'charmchemy:lastInput'
const LAST_RESULT_KEY = 'charmchemy:lastResult'

type StoredInput = {
  pieceType: string
  surprise: boolean
  vibes: string[]
  occasion: string
  difficulty: string
  description: string
  imageBase64: string | null
}

type ApiResult = {
  ideas?: Array<{ imageUrl?: string }>
}

type WindowWithCharmchemy = Window & {
  __charmchemyLastInput?: StoredInput
  __charmchemyLastResult?: ApiResult
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

function safeWriteStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  const raw = JSON.stringify(value)
  window.localStorage.setItem(key, raw)
  window.sessionStorage.setItem(key, raw)
}

function safeWriteSmallStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    const raw = JSON.stringify(value)
    if (raw.length > 200_000) return
    window.localStorage.setItem(key, raw)
    window.sessionStorage.setItem(key, raw)
  } catch {
    // Ignore storage quota errors. The live result stays available in memory.
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

  const [pieceType, setPieceType] = useState<string>('Bracelet')
  const [surprise, setSurprise] = useState(false)
  const [vibes, setVibes] = useState<string[]>(['Romantic', 'Boho'])
  const [occasion, setOccasion] = useState<string>('Everyday wear')
  const [difficulty, setDifficulty] = useState<string>('Medium')
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const win = window as WindowWithCharmchemy
    const stored = win.__charmchemyLastInput || safeReadStorage<StoredInput>(LAST_INPUT_KEY)
    if (!stored) return
    setPieceType(stored.pieceType || 'Bracelet')
    setSurprise(Boolean(stored.surprise))
    setVibes(Array.isArray(stored.vibes) ? stored.vibes : [])
    setOccasion(stored.occasion || 'Everyday wear')
    setDifficulty(stored.difficulty || 'Medium')
    setDescription(stored.description || '')
    setUploadedImage(stored.imageBase64 || null)
  }, [])

  function toggleVibe(v: string) {
    setVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  async function handleImageFiles(files: FileList | File[] | null | undefined) {
    const file = files ? Array.from(files).find(item => item.type.startsWith('image/')) : null
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setUploadedImage(dataUrl)
    setErrorMessage(null)
  }

  async function handleGenerate() {
    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const input: StoredInput = {
        pieceType,
        surprise,
        vibes,
        occasion,
        difficulty,
        description,
        imageBase64: uploadedImage,
      }
      ;(window as WindowWithCharmchemy).__charmchemyLastInput = input
      safeWriteSmallStorage(LAST_INPUT_KEY, {
        pieceType,
        surprise,
        vibes,
        occasion,
        difficulty,
        description,
        imageBase64: null,
      })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: description,
          style: vibes.length > 0 ? vibes.join(', ') : (surprise ? 'Surprise Me' : pieceType),
          type: surprise ? 'Surprise Me' : pieceType,
          purpose: occasion,
          difficulty,
          images: uploadedImage ? [uploadedImage] : [],
        }),
      })

      const payload = (await response.json()) as ApiResult & { error?: string }
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to generate jewelry ideas right now.')
      }

      ;(window as WindowWithCharmchemy).__charmchemyLastResult = payload
      safeWriteSmallStorage(LAST_RESULT_KEY, {
        ideas: payload.ideas?.map(idea => ({
          ...idea,
          imageUrl: null,
        })),
      })
      router.push('/results')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate jewelry ideas right now.')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleClear() {
    setPieceType('Bracelet')
    setSurprise(false)
    setVibes([])
    setOccasion('Everyday wear')
    setDifficulty('Medium')
    setDescription('')
    setUploadedImage(null)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 36px', height: '56px',
        background: 'rgba(253,250,245,.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(168,200,206,.2)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: '20px', fontWeight: 400, color: 'var(--deep)', textDecoration: 'none',
        }}>
          Charm<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>chemy</em>
        </Link>
        <Link href="/" style={{
          fontFamily: 'var(--font-ui), sans-serif',
          fontSize: '12px', fontWeight: 500,
          background: 'var(--deep)', color: 'var(--surface)',
          border: 'none', borderRadius: '999px', padding: '8px 18px',
          textDecoration: 'none', transition: 'background .2s',
        }}>← Home</Link>
      </nav>

      <div className={styles.wrap}>

        {/* Step indicator */}
        <div className={styles.stepsIndicator}>
          <div className={`${styles.sdot} ${styles.done}`} />
          <div className={`${styles.sdot} ${styles.active}`} />
          <div className={styles.sdot} />
          <span className={styles.slabel}>Step 1 of 2</span>
        </div>

        {/* Title */}
        <div className={styles.title}>
          Let&apos;s build something <em>beautiful.</em>
        </div>

        {/* Upload */}
        <div className={styles.fg}>
          <div className={styles.fq}>Upload your materials</div>
          <div
            className={`${styles.upzone} ${dragOver ? styles.dragover : ''}`}
            onClick={openFilePicker}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={async e => {
              e.preventDefault()
              setDragOver(false)
              await handleImageFiles(e.dataTransfer.files)
            }}
          >
            <span className={styles.upIcon}>✦</span>
            <div className={styles.upMain}>Drag & drop, or tap to browse</div>
            <button
              className={styles.upBtn}
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
            {uploadedImage ? (
              <div className={styles.previewWrap}>
                <img
                  src={uploadedImage}
                  alt="Uploaded materials preview"
                  className={styles.previewImg}
                />
                <button
                  type="button"
                  className={styles.previewRemove}
                  onClick={e => {
                    e.stopPropagation()
                    setUploadedImage(null)
                  }}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className={styles.thumbs}>
                <div className={styles.thumb} style={{ background: 'linear-gradient(135deg,#EDE7D9,#C8BCA8)' }}>🪙</div>
                <div className={styles.thumb} style={{ background: 'linear-gradient(135deg,#EAF2F4,#B4D4DC)' }}>📿</div>
                <div className={`${styles.thumb} ${styles.thumbAdd}`}>+</div>
              </div>
            )}
            <div className={styles.upHint}>Plain background · good lighting · lay flat</div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Describe */}
        <div className={styles.fg}>
          <div className={styles.fq}>
            Describe your materials
            <span className={styles.opt}>optional</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="e.g. gold seed beads, 3 moon charms, copper wire, rose quartz…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.divider} />

        {/* Piece type */}
        <div className={styles.fg}>
          <div className={styles.fq}>What would you like to make?</div>
          <div className={styles.chips}>
            {PIECE_TYPES.map(pt => (
              <button
                key={pt}
                type="button"
                className={`${styles.chip} ${!surprise && pieceType === pt ? styles.selected : ''}`}
                onClick={() => { setPieceType(pt); setSurprise(false) }}
              >{pt}</button>
            ))}
            <button
              type="button"
              className={`${styles.chip} ${surprise ? styles.selectedGold : ''}`}
              onClick={() => setSurprise(s => !s)}
            >✦ Surprise Me</button>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Vibe */}
        <div className={styles.fg}>
          <div className={styles.fq}>Choose a vibe</div>
          <div className={styles.chips}>
            {VIBES.map(v => (
              <button
                key={v}
                type="button"
                className={`${styles.chip} ${vibes.includes(v) ? styles.selected : ''}`}
                onClick={() => toggleVibe(v)}
              >{v}</button>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        {/* Occasion */}
        <div className={styles.fg}>
          <div className={styles.fq}>What is it for?</div>
          <div className={styles.chips}>
            {OCCASIONS.map(oc => (
              <button
                key={oc}
                type="button"
                className={`${styles.chip} ${occasion === oc ? styles.selected : ''}`}
                onClick={() => setOccasion(oc)}
              >{oc}</button>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        {/* Difficulty */}
        <div className={styles.fg}>
          <div className={styles.fq}>Difficulty</div>
          <div className={styles.seg}>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                type="button"
                className={`${styles.segBtn} ${difficulty === d ? styles.active : ''}`}
                onClick={() => setDifficulty(d)}
              >{d}</button>
            ))}
          </div>
        </div>

        {/* Generate */}
        <div className={styles.genWrap}>
          <button className={styles.btnGenerate} type="button" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating…' : 'Generate Ideas ✦'}
          </button>
          <div className={styles.genSub}>~15 seconds · your images stay private</div>
          <button className={styles.btnClear} type="button" onClick={handleClear}>
            Clear all
          </button>
          {errorMessage ? <p className={styles.errorMsg}>{errorMessage}</p> : null}
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{
        background: 'var(--dark)', padding: '24px 36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(168,200,206,.08)',
      }}>
        <div>
          <Link href="/" style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: '17px', fontWeight: 300, color: 'rgba(253,250,245,.45)', textDecoration: 'none',
          }}>
            Charm<em style={{ fontStyle: 'italic', color: 'rgba(201,150,58,.55)' }}>chemy</em>
          </Link>
          <p style={{ fontSize: '11px', color: 'rgba(253,250,245,.18)', marginTop: '2px' }}>
            Made from maybe. Designed by AI. Crafted by you.
          </p>
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(253,250,245,.18)' }}>© 2025 Charmchemy</span>
      </footer>
    </>
  )
}
