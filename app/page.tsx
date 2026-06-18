'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import styles from './page.module.css'

const trustItems = [
  'AI-generated in seconds',
  'Free to try - no account',
  'Your images stay private',
  '3 makeable designs per session',
]

const howSteps: Array<{
  num: string
  icon: string
  title: string
  desc: string
}> = [
  {
    num: 'I.',
    icon: '📷',
    title: 'Upload your materials',
    desc: 'Show your beads, charms, chains, findings, or leftover supplies.',
  },
  {
    num: 'II.',
    icon: '✦',
    title: 'Choose your style',
    desc: 'Pick your vibe, type of piece, and occasion - or let Charmchemy surprise you.',
  },
  {
    num: 'III.',
    icon: '💎',
    title: 'Get 3 makeable designs',
    desc: 'Receive clear concepts with practical crafting steps you can follow right away.',
  },
]

const galleryItems = [
  {
    badge: '🌙 Easiest to make',
    title: 'Moon Thread Necklace',
    desc: 'Simple layered piece using chain scraps and 2 focal charms. Perfect for a first project.',
    artClass: styles.galleryArt1,
    badgeClass: styles.badgeEasy,
  },
  {
    badge: '✨ Studio choice',
    title: 'Golden Drift Bracelet',
    desc: 'Boho stack-friendly bracelet made from mixed beads and jump rings. Zero waste, all style.',
    artClass: styles.galleryArt2,
    badgeClass: styles.badgeStudio,
  },
] as const

const beads = [
  { style: { top: '3%', left: '6%', width: 16, height: 16, '--dur': '5s', '--delay': '0s' } },
  { style: { top: '0', right: '5%', width: 13, height: 13, '--dur': '6.5s', '--delay': '0.4s' } },
  { style: { left: '34%', bottom: '1%', width: 14, height: 14, '--dur': '5.8s', '--delay': '0.2s' } },
] as const

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            Charm<em>chemy</em>
          </Link>
          <div className={styles.navLinks}>
            <a href="#how-it-works">How It Works</a>
            <a href="#gallery">Gallery</a>
            <Link href="/start" className={styles.navCta}>
              Start Creating ✦
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <div className={styles.heroEyebrow}>
                <span />
                AI-powered jewellery design
              </div>
              <h1 className={styles.heroTitle}>
                Turn your <em>craft stash</em> into jewelry magic.
              </h1>
              <p className={styles.heroTagline}>Made from maybe. Designed by AI. Crafted by you.</p>
              <p className={styles.heroSub}>
                Upload the beads, charms and findings you already own. Get three designs you can
                actually make - with step-by-step instructions.
              </p>
              <div className={styles.heroActions}>
                <Link href="/start" className={styles.btnPrimary}>
                  Start Creating ✦
                </Link>
                <a href="#gallery" className={styles.btnGhostLink}>
                  View examples
                </a>
              </div>
              <div className={styles.heroTrust}>
                <span>✦ Free to try</span>
                <span>✦ No account needed</span>
                <span>✦ Your images stay private</span>
              </div>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.renderCard}>
                <div className={styles.renderLabel}>AI design render · Boho necklace</div>
              </div>
              <div className={styles.stashCard}>
                <div className={styles.stashLabel}>Your stash photo</div>
              </div>
              <div className={styles.alchemyBadge}>✦</div>
              <div className={styles.topBadge}>✦ Easiest to make</div>
              <span className={styles.bead} style={beads[0].style as CSSProperties} />
              <span className={styles.bead} style={beads[1].style as CSSProperties} />
              <span className={styles.bead} style={beads[2].style as CSSProperties} />
            </div>
          </div>
        </section>

        <div className={styles.trustBar} aria-label="Trust signals">
          <div className={styles.trustTrack} aria-hidden="true">
            {[...trustItems, ...trustItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>

        <section className={styles.howSection} id="how-it-works">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionEyebrow}>How it works</div>
              <h2>
                From random materials to <em>makeable designs</em>.
              </h2>
              <p>Three easy steps - from craft stash to finished concept.</p>
            </div>

            <div className={styles.howTimeline} role="list" aria-label="How Charmchemy works">
              {howSteps.map((step) => (
                <article
                  key={step.title}
                  className={styles.howStep}
                  role="listitem"
                >
                  <div className={styles.howStepTop}>
                    <span className={styles.howStepNumber}>{step.num}</span>
                    <span className={styles.howStepCircle} aria-hidden="true">
                      <span className={styles.howStepIcon}>{step.icon}</span>
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.painSection}>
          <div className={styles.painInner}>
            <div className={styles.painCopy}>
              <div className={styles.sectionEyebrow}>Common pain point</div>
              <h2>
                Have beads you bought <em>“just in case”?</em>
              </h2>
              <p>
                Charmchemy helps you turn forgotten materials into fresh jewelry ideas - no design
                experience needed, no wasted supplies.
              </p>
              <ul className={styles.painList}>
                <li>
                  <span>✦</span> Stash collectors with overflowing bead boxes
                </li>
                <li>
                  <span>✦</span> Beginner makers who don&apos;t know where to start
                </li>
                <li>
                  <span>✦</span> Etsy sellers & market creators after fresh designs
                </li>
              </ul>
              <Link href="/start" className={styles.btnPrimary}>
                Start Creating ✦
              </Link>
            </div>

            <div className={styles.specimenCard} aria-hidden="true">
              <div className={styles.specimenGrid}>
                <div>
                  <div className={`${styles.specimenSwatch} ${styles.swatchBeads}`} />
                  <p>&ldquo;Bought these 2 years ago. Still haven&apos;t figured out what to do with them.&rdquo;</p>
                </div>
                <div>
                  <div className={`${styles.specimenSwatch} ${styles.swatchCharms}`} />
                  <p>&ldquo;Beautiful on their own. No idea how to combine them.&rdquo;</p>
                </div>
              </div>

              <div className={styles.dividerRow}>
                <span />
                <div>✦</div>
                <span />
              </div>

              <div className={styles.resultCard}>
                <div className={styles.resultArt} />
                <div>
                  <div className={styles.resultEyebrow}>Result ✦</div>
                  <h4>Boho Layered Necklace</h4>
                  <p>
                    Three strands, graduating lengths, gold leaf focal pendant. Step-by-step guide
                    included.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gallerySection} id="gallery">
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionEyebrow}>Example results</div>
              <h2>Three AI design directions</h2>
              <p>Every session generates ideas matched to your materials and your style.</p>
            </div>

            <div className={styles.galleryGrid}>
              {galleryItems.map((item) => (
                <article key={item.title} className={styles.galleryCard}>
                  <div className={`${styles.galleryArt} ${item.artClass}`}>
                    <span className={`${styles.galleryBadge} ${item.badgeClass}`}>{item.badge}</span>
                  </div>
                  <div className={styles.galleryCopy}>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.galleryCtaWrap}>
              <Link href="/start" className={styles.btnPrimary}>
                Generate My Own Ideas ✦
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.finalInner}>
            <div className={styles.sectionEyebrow}>Ready to make something?</div>
            <h2>
              Ready to make something from <em>maybe?</em>
            </h2>
            <p>
              Upload your craft stash and get AI-generated jewelry designs you can actually make -
              in seconds.
            </p>
            <Link href="/start" className={styles.finalButton}>
              Start Creating ✦
            </Link>
            <div className={styles.finalMeta}>
              Free to try · No account needed · Your images stay private
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerLogo}>
              Charm<em>chemy</em>
            </div>
            <div className={styles.footerText}>
              Made from maybe. Designed by AI. Crafted by you.
            </div>
          </div>

          <div className={styles.footerLinks}>
            <a href="#how-it-works">How It Works</a>
            <a href="#gallery">Gallery</a>
            <Link href="/start">Start Creating</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>© 2025 Charmchemy · All rights reserved</div>
      </footer>
    </div>
  )
}
