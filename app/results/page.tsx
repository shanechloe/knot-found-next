'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

/* ── Types ── */
interface Step { title: string; desc: string }
interface Design {
  id: string
  name: string
  type: 'Necklace' | 'Bracelet' | 'Earrings'
  difficulty: 'Easy' | 'Medium'
  time: string
  desc: string
  materials: string[]
  steps: Step[]
  featured?: boolean
}

/* ── Data ── */
const DESIGNS: Design[] = [
  {
    id: 'bracelet',
    name: 'Golden Drift Bracelet',
    type: 'Bracelet',
    difficulty: 'Medium',
    time: '~2 hrs',
    featured: true,
    desc: 'Boho stack bracelet from your mixed seed beads in herringbone pattern, with gold moon charms as spaced accents.',
    materials: ['Seed beads', 'Gold charms', 'Jump rings', 'Beading wire', 'Crimp beads', 'Toggle clasp'],
    steps: [
      { title: 'Sort your beads', desc: 'Separate into warm tones and cool tones. This creates visual rhythm in the final piece.' },
      { title: 'Prepare your wire', desc: 'Cut 60cm of beading wire. Attach one end to your toggle clasp using a crimp bead.' },
      { title: 'Thread the pattern', desc: 'Alternate 3 warm beads / 1 charm / 3 cool until the bracelet is 18–20cm.' },
      { title: 'Close & finish', desc: 'Crimp the final end to the clasp. Trim excess wire and tug to test the hold.' },
    ],
  },
  {
    id: 'necklace',
    name: 'Moon Thread Necklace',
    type: 'Necklace',
    difficulty: 'Easy',
    time: '~1 hr',
    desc: 'Layered necklace using copper wire, rose quartz chips wire-wrapped at intervals, moon charms at graduating lengths.',
    materials: ['Moon charms', 'Copper wire', 'Rose quartz chips', 'Jump rings'],
    steps: [
      { title: 'Cut three wire lengths', desc: '40cm, 46cm, and 52cm — these will be your three layers.' },
      { title: 'Wrap the quartz', desc: 'Wire-wrap 2–3 rose quartz chips along the longest strand at intervals.' },
      { title: 'Attach the charms', desc: 'Open a jump ring and attach one moon charm to each strand end.' },
      { title: 'Combine the layers', desc: 'Use a small jump ring to gather all three strands at one focal point.' },
    ],
  },
  {
    id: 'earrings',
    name: 'Charm Cascade Earrings',
    type: 'Earrings',
    difficulty: 'Easy',
    time: '~45 min',
    desc: 'Asymmetric earrings from leftover seed beads and charms. Three charms on one ear, single beaded drop on the other.',
    materials: ['Gold charms ×4', 'Seed beads', 'Jump rings', 'Ear hooks', 'Headpin'],
    steps: [
      { title: 'Select your charms', desc: 'Pick 3 for one ear at varying sizes. The 4th goes on the other ear alone.' },
      { title: 'Attach to ear hooks', desc: 'Open jump rings sideways. Thread one charm per ring, attach to hook.' },
      { title: 'Make the bead drop', desc: 'Thread 5–7 seed beads onto a headpin. Form a wrapped loop at the top.' },
      { title: 'Balance the pair', desc: 'Clip the bead drop to the single-charm ear. Test the visual balance.' },
    ],
  },
]

const REFINE_OPTIONS = ['More minimal', 'Make it harder', 'Use all materials', 'Gift-ready', 'Faster to make', 'More romantic']

/* ── Helpers ── */
function typeClass(t: string) {
  if (t === 'Necklace') return styles.typeN
  if (t === 'Bracelet') return styles.typeB
  return styles.typeE
}
function diffClass(d: string) {
  return d === 'Easy' ? styles.diffEasy : styles.diffMed
}
const ROMAN = ['I.', 'II.', 'III.', 'IV.', 'V.']

/* ── Component ── */
export default function ResultsPage() {
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeDesign, setActiveDesign] = useState<Design | null>(null)
  const [refineOpen, setRefineOpen] = useState(false)
  const [refineSelected, setRefineSelected] = useState<string[]>([])

  function toggleSave(id: string) {
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openDrawer(design: Design) {
    setActiveDesign(design)
    setDrawerOpen(true)
    document.body.style.overflow = 'hidden'
  }

  function closeDrawer() {
    setDrawerOpen(false)
    document.body.style.overflow = ''
  }

  function toggleRefineChip(chip: string) {
    setRefineSelected(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    )
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
        boxShadow: '0 2px 8px rgba(44,74,82,.08)',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: '20px', fontWeight: 400, color: 'var(--deep)', textDecoration: 'none',
        }}>
          Charm<em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>chemy</em>
        </Link>
        <Link href="/start" style={{
          fontFamily: 'var(--font-ui), sans-serif',
          fontSize: '12px', fontWeight: 500,
          background: 'var(--deep)', color: 'var(--surface)',
          border: 'none', borderRadius: '999px', padding: '8px 18px',
          textDecoration: 'none', transition: 'background .2s',
        }}>Start over</Link>
      </nav>

      {/* HERO */}
      <div className={styles.hero}>
        <div className={styles.heroIn}>
          <div className={styles.eyebrow}>Your ideas are ready</div>
          <h1 className={styles.heroH1}>
            Three designs, <em>made for you.</em>
          </h1>
          <div className={styles.heroCtx}>
            Seed beads · Gold charms · Boho Romantic · Bracelet · Medium
          </div>
          <div className={styles.matTags}>
            {['Seed beads', 'Gold moon charms', 'Rose quartz', 'Copper wire'].map(m => (
              <span key={m} className={styles.matTag}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.body}>

        {/* Action row */}
        <div className={styles.actRow}>
          <Link href="/start" className={styles.btnMore}>Generate More ✦</Link>
          <div className={styles.actRight}>
            <button className={styles.btnGhost} type="button">♡ Save all</button>
            <button className={styles.btnGhost} type="button">↗ Share</button>
          </div>
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {DESIGNS.map(d => (
            <div
              key={d.id}
              className={`${styles.card} ${d.featured ? styles.cardFeat : ''}`}
            >
              <div className={styles.cardHead}>
                <div className={styles.cardMeta}>
                  <span className={`${styles.typeBadge} ${typeClass(d.type)}`}>{d.type}</span>
                  {d.featured
                    ? <span className={styles.pickRib}>✦ Top pick</span>
                    : <span className={`${styles.diffBadge} ${diffClass(d.difficulty)}`}>{d.difficulty}</span>
                  }
                </div>
                <div className={styles.cardName}>{d.name}</div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardDesc}>{d.desc}</p>
                <div className={styles.cardMats}>
                  {d.materials.slice(0, 3).map(m => (
                    <span key={m} className={styles.matPill}>{m}</span>
                  ))}
                </div>
                <div className={styles.cardDiff}>
                  <span className={`${styles.diffBadge} ${diffClass(d.difficulty)}`}>{d.difficulty}</span>
                  <span className={`${styles.diffBadge} ${styles.timeBadge}`}>{d.time}</span>
                </div>
              </div>
              <div className={styles.cardFoot}>
                <button
                  className={`${styles.btnSave} ${saved.has(d.id) ? styles.saved : ''}`}
                  type="button"
                  onClick={() => toggleSave(d.id)}
                >
                  {saved.has(d.id) ? '♥ Saved' : '♡ Save'}
                </button>
                <button
                  className={styles.btnExpand}
                  type="button"
                  onClick={() => openDrawer(d)}
                >Full steps →</button>
              </div>
            </div>
          ))}
        </div>

        {/* Refine accordion */}
        <div
          className={styles.refineToggle}
          onClick={() => setRefineOpen(o => !o)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setRefineOpen(o => !o)}
        >
          <div className={styles.refineLabel}>
            Not what you wanted?
            <span>Refine & regenerate</span>
          </div>
          <span className={`${styles.refineIcon} ${refineOpen ? styles.open : ''}`}>↓</span>
        </div>
        <div className={`${styles.refineBody} ${refineOpen ? styles.open : ''}`}>
          <div className={styles.refineInner}>
            {REFINE_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                className={`${styles.chip} ${refineSelected.includes(opt) ? styles.selected : ''}`}
                onClick={() => toggleRefineChip(opt)}
              >{opt}</button>
            ))}
          </div>
        </div>

      </div>

      {/* DRAWER */}
      <div
        className={`${styles.drwOverlay} ${drawerOpen ? styles.open : ''}`}
        onClick={e => { if (e.target === e.currentTarget) closeDrawer() }}
      >
        <div className={styles.drw}>
          <button className={styles.drwClose} type="button" onClick={closeDrawer}>✕</button>

          {activeDesign && (
            <>
              <div className={styles.drwEy}>Full guide</div>
              <div className={styles.drwName}>{activeDesign.name}</div>

              <div className={styles.drwLbl}>Materials</div>
              <div className={styles.drwMats}>
                {activeDesign.materials.map(m => (
                  <span key={m} className={styles.mpill}>{m}</span>
                ))}
              </div>

              <div className={styles.drwDiv} />

              <div className={styles.drwLbl}>Steps</div>
              {activeDesign.steps.map((s, i) => (
                <div key={i} className={styles.fstep}>
                  <div className={styles.fsNum}>{ROMAN[i]}</div>
                  <div>
                    <div className={styles.fsTitle}>{s.title}</div>
                    <div className={styles.fsDesc}>{s.desc}</div>
                  </div>
                </div>
              ))}

              <div className={styles.drwDiv} />
              <div className={styles.drwActs}>
                <button
                  className={styles.btnSaveFull}
                  type="button"
                  onClick={() => { toggleSave(activeDesign.id); closeDrawer() }}
                >
                  {saved.has(activeDesign.id) ? '♥ Saved' : '♡ Save design'}
                </button>
                <button className={styles.btnShare} type="button">↗ Share</button>
              </div>
            </>
          )}
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
