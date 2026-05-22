import Image from 'next/image'

const exampleCards = [
  {
    badge: 'Easiest to Make',
    title: 'Moon Thread Necklace',
    desc: 'Simple layered piece using chain scraps and 2 focal charms.',
    src: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    badge: 'Studio Choice',
    title: 'Golden Drift Bracelet',
    desc: 'Boho stack-friendly bracelet made from mixed beads and jump rings.',
    src: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1200&q=80',
  },
  {
    badge: 'Zero Waste',
    title: 'Charm Cascade Earrings',
    desc: 'Uses leftover findings to create an asymmetric but balanced pair.',
    src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
  },
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <nav className="top-nav">
        <a className="brand" href="#">Charmchemy</a>
        <div className="nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#gallery">Gallery</a>
          <a href="#start" className="start-btn">Start Creating</a>
        </div>
      </nav>

      <main className="content">
        <section className="hero" id="start">
          <span className="kicker">Made from maybe. Designed by AI. Crafted by you.</span>
          <h1>
            Turn your <em>craft stash</em> into jewelry magic.
          </h1>
          <p>
            Upload your materials and get AI-generated jewelry designs you can
            actually make.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="cta" href="#how-it-works">Start Creating</a>
            <a className="lang-btn" href="#gallery">View Examples</a>
          </div>
        </section>

        <section className="steps-panel" id="how-it-works">
          <div>
            <h2>How It Works</h2>
            <p>From random materials to makeable designs in three easy steps.</p>
            <a href="#gallery">View Examples</a>
          </div>

          <ol>
            <li>
              <strong>I.</strong>
              <div>
                <h3>Upload your materials</h3>
                <p>Show your beads, charms, chains, and findings.</p>
              </div>
            </li>
            <li>
              <strong>II.</strong>
              <div>
                <h3>Choose your style</h3>
                <p>Pick your vibe, type of piece, and occasion.</p>
              </div>
            </li>
            <li>
              <strong>III.</strong>
              <div>
                <h3>Get 3 makeable designs</h3>
                <p>Receive clear concepts with practical crafting steps.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="hero" style={{ textAlign: 'left', justifyItems: 'start' }}>
          <span className="kicker">Common Pain Point</span>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontStyle: 'italic' }}>
            Have beads you bought &ldquo;just in case&rdquo;?
          </h2>
          <p>
            Charmchemy helps you turn forgotten materials into fresh jewelry ideas.
          </p>
        </section>

        <section className="directions" id="gallery">
          <div className="section-head">
            <div>
              <span className="kicker">Example Results</span>
              <h2>Three AI design directions</h2>
            </div>
          </div>

          <div className="direction-grid">
            {exampleCards.map((item) => (
              <article key={item.title} className="direction-card">
                <div className="image-wrap">
                  <Image src={item.src} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                  <span className="image-label">{item.badge}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hero" style={{ textAlign: 'left', justifyItems: 'start' }}>
          <span className="kicker">Who It&apos;s For</span>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontStyle: 'italic' }}>
            Built for makers like you
          </h2>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--muted)', lineHeight: 1.8 }}>
            <li>Stash collectors</li>
            <li>Beginner makers</li>
            <li>Etsy sellers & market creators</li>
          </ul>
        </section>

        <section className="steps-panel" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div>
            <h2>Ready to make something from maybe?</h2>
            <a href="#start">Start Creating</a>
          </div>
        </section>
      </main>

      <footer>
        <span>Charmchemy</span>
        <p>Made from maybe. Designed by AI. Crafted by you.</p>
      </footer>
    </div>
  )
}
