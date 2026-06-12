'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const PIECE_TYPES = ['Necklace', 'Bracelet', 'Earrings', 'Ring', 'Charm']
const VIBES = ['Minimal', 'Romantic', 'Vintage', 'Boho', 'Fairycore', 'Elegant', 'Playful', 'Statement']
const OCCASIONS = ['Everyday wear', 'Gift', 'Party', 'Wedding', 'Market / Selling', 'Upcycle project']
const DIFFICULTIES = ['Easy', 'Medium', 'Difficult']

export default function StartPage() {
  const router = useRouter()

  const [pieceType, setPieceType] = useState<string>('Bracelet')
  const [surprise, setSurprise] = useState(false)
  const [vibes, setVibes] = useState<string[]>(['Romantic', 'Boho'])
  const [occasion, setOccasion] = useState<string>('Everyday wear')
  const [difficulty, setDifficulty] = useState<string>('Medium')
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)

  function toggleVibe(v: string) {
    setVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  function handleGenerate() {
    router.push('/results')
  }

  function handleClear() {
    setPieceType('Bracelet')
    setSurprise(false)
    setVibes([])
    setOccasion('Everyday wear')
    setDifficulty('Medium')
    setDescription('')
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
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false) }}
          >
            <span className={styles.upIcon}>✦</span>
            <div className={styles.upMain}>Drag & drop, or tap to browse</div>
            <button className={styles.upBtn} type="button">Upload photo</button>
            <div className={styles.thumbs}>
              <div className={styles.thumb} style={{ background: 'linear-gradient(135deg,#EDE7D9,#C8BCA8)' }}>🪙</div>
              <div className={styles.thumb} style={{ background: 'linear-gradient(135deg,#EAF2F4,#B4D4DC)' }}>📿</div>
              <div className={`${styles.thumb} ${styles.thumbAdd}`}>+</div>
            </div>
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
          <button className={styles.btnGenerate} type="button" onClick={handleGenerate}>
            Generate Ideas ✦
          </button>
          <div className={styles.genSub}>~15 seconds · your images stay private</div>
          <button className={styles.btnClear} type="button" onClick={handleClear}>
            Clear all
          </button>
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
