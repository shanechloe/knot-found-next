'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import styles from './page.module.css'

const beads = [
  { w:34, h:34, color:'#C9963A', top:'8%',  left:'6%',  dur:'5.2s', delay:'0s',    lift:'-16px', rot:'10deg'  },
  { w:18, h:18, color:'#3D6B76', top:'14%', left:'22%', dur:'6.8s', delay:'0.5s',  lift:'-9px',  rot:'-6deg'  },
  { w:24, h:24, color:'#C47B7B', top:'7%',  left:'38%', dur:'7s',   delay:'1s',    lift:'-12px', rot:'14deg'  },
  { w:14, h:14, color:'#E8B84B', top:'18%', left:'55%', dur:'5.8s', delay:'0.3s',  lift:'-7px',  rot:'-12deg' },
  { w:28, h:28, color:'#2C4A52', top:'10%', left:'72%', dur:'8s',   delay:'0.8s',  lift:'-14px', rot:'5deg'   },
  { w:20, h:20, color:'#A8C8CE', top:'6%',  left:'88%', dur:'6s',   delay:'1.2s',  lift:'-10px', rot:'-8deg'  },
  { w:16, h:16, color:'#C9963A', top:'30%', left:'4%',  dur:'7.4s', delay:'0.2s',  lift:'-8px',  rot:'9deg'   },
  { w:22, h:22, color:'#3D6B76', top:'35%', left:'14%', dur:'5.5s', delay:'1.5s',  lift:'-11px', rot:'-15deg' },
  { w:12, h:12, color:'#C47B7B', top:'28%', left:'82%', dur:'6.5s', delay:'0.7s',  lift:'-6px',  rot:'18deg'  },
  { w:30, h:30, color:'#E8B84B', top:'32%', left:'90%', dur:'7.2s', delay:'0.4s',  lift:'-15px', rot:'-7deg'  },
  { w:20, h:20, color:'#2C4A52', top:'62%', left:'5%',  dur:'8.2s', delay:'0.9s',  lift:'-10px', rot:'11deg'  },
  { w:14, h:14, color:'#A8C8CE', top:'68%', left:'16%', dur:'5.9s', delay:'1.3s',  lift:'-7px',  rot:'-10deg' },
  { w:26, h:26, color:'#C9963A', top:'60%', left:'80%', dur:'6.3s', delay:'0.6s',  lift:'-13px', rot:'16deg'  },
  { w:18, h:18, color:'#C47B7B', top:'65%', left:'91%', dur:'7.6s', delay:'1.1s',  lift:'-9px',  rot:'-20deg' },
  { w:22, h:22, color:'#E8B84B', top:'80%', left:'8%',  dur:'6.1s', delay:'0.15s', lift:'-11px', rot:'8deg'   },
  { w:16, h:16, color:'#3D6B76', top:'84%', left:'20%', dur:'7.8s', delay:'1.8s',  lift:'-8px',  rot:'-5deg'  },
  { w:12, h:12, color:'#C9963A', top:'88%', left:'55%', dur:'5.6s', delay:'0.9s',  lift:'-6px',  rot:'12deg'  },
  { w:28, h:28, color:'#2C4A52', top:'78%', left:'72%', dur:'6.9s', delay:'0.35s', lift:'-14px', rot:'-9deg'  },
  { w:18, h:18, color:'#A8C8CE', top:'82%', left:'86%', dur:'7.3s', delay:'1.6s',  lift:'-9px',  rot:'6deg'   },
  { w:14, h:14, color:'#C47B7B', top:'92%', left:'38%', dur:'6.4s', delay:'0.55s', lift:'-7px',  rot:'-14deg' },
]

const sparkles = [
  { top:'12%', left:'48%', sd:'0s'   },
  { top:'22%', left:'68%', sd:'1.2s' },
  { top:'40%', left:'25%', sd:'0.6s' },
  { top:'55%', left:'75%', sd:'1.8s' },
  { top:'72%', left:'44%', sd:'0.9s' },
  { top:'85%', left:'62%', sd:'0.3s' },
]

const trustItems = [
  'AI-generated in seconds',
  'Free to try — no account needed',
  'Your images stay private',
  'Works with any craft stash',
  '3 makeable designs per session',
  'Built for DIY makers',
]

const galleryItems = [
  {
    img: '/examples/design-1.jpg',
    emoji: '🌙',
    badge: 'badgeEasy' as const,
    badgeLabel: 'Easiest to Make',
    name: 'Moon Thread Necklace',
    desc: 'Simple layered piece using chain scraps and 2 focal charms. Perfect for a first project.',
  },
  {
    img: '/examples/design-2.jpg',
    emoji: '✨',
    badge: 'badgeStudio' as const,
    badgeLabel: 'Studio Choice',
    name: 'Golden Drift Bracelet',
    desc: 'Boho stack-friendly bracelet made from mixed beads and jump rings. Zero waste, all style.',
  },
  {
    img: '/examples/design-3.jpg',
    emoji: '💫',
    badge: 'badgeZero' as const,
    badgeLabel: 'Zero Waste',
    name: 'Charm Cascade Earrings',
    desc: 'Uses leftover findings to create an asymmetric but balanced pair. Nothing goes to waste.',
  },
]

const badgeMap = {
  badgeEasy:   styles.badgeEasy,
  badgeStudio: styles.badgeStudio,
  badgeZero:   styles.badgeZero,
}

export default function Home() {
  // scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll(`.${styles.reveal}`)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(styles.visible)
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // nav shadow on scroll
  useEffect(() => {
    const nav = document.getElementById('main-nav')
    if (!nav) return
    const handler = () => nav.classList.toggle('scrolled', window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* ── NAV ── */}
      <nav className={styles.nav} id="main-nav">
        <Link href="/" className={styles.navLogo}>
          Charm<em>chemy</em>
        </Link>
        <ul className={styles.navLinks}>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#gallery">Gallery</a></li>
        </ul>
        <Link href="/start" className={styles.navCta}>Start Creating ✦</Link>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.beadField} aria-hidden="true">
          {beads.map((b, i) => (
            <div
              key={i}
              className={styles.bead}
              style={{
                width: b.w,
                height: b.h,
                background: b.color,
                top: b.top,
                left: b.left,
                '--dur': b.dur,
                '--delay': b.delay,
                '--lift': b.lift,
                '--rot': b.rot,
              } as CSSProperties}
            />
          ))}
          {sparkles.map((s, i) => (
            <span
              key={i}
              className={styles.sparkle}
              style={{ top: s.top, left: s.left, '--sd': s.sd } as CSSProperties}
            >✦</span>
          ))}
        </div>

        <div className={styles.heroCenter}>
          <div className={styles.heroEyebrow}>AI-powered jewellery design</div>
          <h1 className={styles.heroHeadline}>
            Turn your <em>craft stash</em><br />into jewelry magic.
          </h1>
          <p className={styles.heroTagline}>
            Made from maybe. Designed by AI. Crafted by you.
          </p>
          <p className={styles.heroSub}>
            Upload your materials and get AI-generated jewelry designs you can actually make.
          </p>
          <div className={styles.heroActions}>
            <Link href="/start" className={styles.btnHero}>Start Creating ✦</Link>
            <a href="#gallery" className={styles.btnGhostLink}>View examples</a>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className={styles.trustBar} aria-label="Social proof">
        <div className={styles.trustTrack} aria-hidden="true">
          {[...trustItems, ...trustItems].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howSection} id="how-it-works">
        <div className={styles.sectionInner}>
          <div className={`${styles.howHeader} ${styles.reveal}`}>
            <div className={`${styles.sectionEyebrow}`} style={{ justifyContent: 'center' }}>
              How It Works
            </div>
            <h2>From random materials<br />to makeable designs.</h2>
            <p>Three easy steps — from craft stash to finished concept.</p>
          </div>
          <div className={styles.howSteps}>
            {[
              { num: 'I.',   icon: '📷', title: 'Upload your materials',    desc: 'Show your beads, charms, chains, findings, or leftover supplies.' },
              { num: 'II.',  icon: '✦',  title: 'Choose your style',        desc: 'Pick your vibe, type of piece, and occasion — or let Charmchemy surprise you.' },
              { num: 'III.', icon: '💎', title: 'Get 3 makeable designs',   desc: 'Receive clear concepts with practical crafting steps you can follow right away.' },
            ].map((step, i) => (
              <div key={i} className={`${styles.howStep} ${styles.reveal} ${i === 0 ? styles.revealDelay1 : i === 1 ? styles.revealDelay2 : styles.revealDelay3}`}>
                <div>
                  <span className={styles.howStepNum}>{step.num}</span>
                  <div className={styles.howStepIcon}>{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINT ── */}
      <section className={styles.painSection}>
        <div className={styles.painInner}>
          <div className={`${styles.painVisual} ${styles.reveal}`} aria-hidden="true">
            <div className={styles.painCard} style={{ top: 0, left: 0, width: 240, transform: 'rotate(-2deg)' }}>
              <div className={styles.painTag} style={{ background: '#FDF4E3', color: '#8A6020' }}>Seed Beads</div>
              <div className={styles.painCardTitle}>Mixed Turquoise Lot</div>
              <div className={styles.painCardBody}>&ldquo;Bought these 2 years ago. Still haven&apos;t figured out what to do with them.&rdquo;</div>
            </div>
            <div className={styles.painCard} style={{ top: 100, left: 60, width: 260, transform: 'rotate(1.5deg)', zIndex: 2 }}>
              <div className={styles.painTag} style={{ background: '#EAF2F4', color: '#2C4A52' }}>Gold Charms</div>
              <div className={styles.painCardTitle}>Leaf &amp; Moon Set</div>
              <div className={styles.painCardBody}>&ldquo;Beautiful on their own. No idea how to combine them.&rdquo;</div>
            </div>
            <div className={styles.painCard} style={{ top: 210, left: 20, width: 250, transform: 'rotate(-1deg)', zIndex: 3 }}>
              <div className={styles.painTag} style={{ background: '#EAF4EF', color: '#2A5C42' }}>Result ✦</div>
              <div className={styles.painCardTitle}>Boho Layered Necklace</div>
              <div className={styles.painCardBody}>Three strands, graduating lengths, gold leaf focal pendant. Step-by-step guide included.</div>
            </div>
          </div>
          <div className={styles.painContent}>
            <div className={`${styles.sectionEyebrow} ${styles.reveal}`}>Common Pain Point</div>
            <h2 className={styles.reveal}>Have beads you bought <em>&ldquo;just in case&rdquo;?</em></h2>
            <p className={styles.reveal}>
              Charmchemy helps you turn forgotten materials into fresh jewelry ideas — no design experience needed, no wasted supplies.
            </p>
            <div className={`${styles.whoList} ${styles.reveal} ${styles.revealDelay1}`}>
              {['Stash collectors with overflowing bead boxes', 'Beginner makers who don\'t know where to start', 'Etsy sellers & market creators looking for fresh designs'].map((item, i) => (
                <div key={i} className={styles.whoItem}>
                  <span className={styles.whoDot} />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/start" className={`${styles.btnHero} ${styles.reveal} ${styles.revealDelay2}`}>
              Start Creating ✦
            </Link>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className={styles.gallerySection} id="gallery">
        <div className={styles.sectionInner}>
          <div className={`${styles.galleryHeader} ${styles.reveal}`}>
            <div className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>Example Results</div>
            <h2>Three AI design directions</h2>
            <p>Every session generates ideas matched to your materials and your style.</p>
          </div>
        </div>
        <div className={styles.galleryGrid}>
          {galleryItems.map((item, i) => (
            <div key={i} className={`${styles.galleryCard} ${styles.reveal} ${i === 0 ? styles.revealDelay1 : i === 1 ? styles.revealDelay2 : styles.revealDelay3}`}>
              <div className={styles.galleryImgPlaceholder}>
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className={styles.galleryImg}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span>{item.emoji}</span>
              </div>
              <div className={styles.galleryCardBody}>
                <span className={`${styles.galleryBadge} ${badgeMap[item.badge]}`}>{item.badgeLabel}</span>
                <div className={styles.galleryCardName}>{item.name}</div>
                <div className={styles.galleryCardDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.galleryCta} ${styles.reveal}`}>
          <Link href="/start" className={styles.btnHero}>Generate My Own Ideas ✦</Link>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaEyebrow}>Ready to make something?</div>
        <h2 className={styles.ctaHeadline}>
          Ready to make something<br />from <em>maybe</em>?
        </h2>
        <p className={styles.ctaSub}>
          Upload your craft stash and get AI-generated jewelry designs you can actually make — in seconds.
        </p>
        <Link href="/start" className={styles.btnCta}>Start Creating ✦</Link>
        <p className={styles.ctaReassure}>Free to try · No account needed · Your images stay private</p>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div>
          <Link href="/" className={styles.footerLogo}>Charm<em>chemy</em></Link>
          <p className={styles.footerTagline}>Made from maybe. Designed by AI. Crafted by you.</p>
        </div>
        <div className={styles.footerRight}>
          <ul className={styles.footerLinks}>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><Link href="/start">Start Creating</Link></li>
          </ul>
          <p className={styles.footerCopy}>© 2025 Charmchemy · All rights reserved</p>
        </div>
      </footer>
    </>
  )
}
