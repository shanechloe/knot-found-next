import Image from 'next/image'

const exampleCards = [
  {
    badge: 'Easiest to Make',
    title: 'Moon Thread Necklace',
    desc: 'Simple layered piece using chain scraps and 2 focal charms.',
    src: '/examples/design-1.jpg',
  },
  {
    badge: 'Studio Choice',
    title: 'Golden Drift Bracelet',
    desc: 'Boho stack-friendly bracelet made from mixed beads and jump rings.',
    src: '/examples/design-2.jpg',
  },
  {
    badge: 'Zero Waste',
    title: 'Charm Cascade Earrings',
    desc: 'Uses leftover findings to create an asymmetric but balanced pair.',
    src: '/examples/design-3.jpg',
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
          <a href="/start" className="start-btn">Start Creating</a>
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
          <div className="hero-actions">
            <a className="cta" href="/start">Start Creating</a>
            <a className="lang-btn" href="#gallery">View Examples</a>
          </div>
        </section>

        <section className="social-proof" aria-label="Trust signals">
          <p>10,000+ ideas generated</p>
          <p>Loved by DIY makers</p>
          <p>Free to try</p>
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

        <section className="hero hero-left">
          <span className="kicker">Common Pain Point</span>
          <h2 className="section-title-left">
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

        <section className="hero hero-left">
          <span className="kicker">Who It&apos;s For</span>
          <h2 className="section-title-left">
            Built for makers like you
          </h2>
          <ul className="maker-list">
            <li>Stash collectors</li>
            <li>Beginner makers</li>
            <li>Etsy sellers & market creators</li>
          </ul>
        </section>

        <section className="steps-panel steps-panel-cta">
          <div>
            <h2>Ready to make something from maybe?</h2>
            <a href="/start">Start Creating</a>
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
