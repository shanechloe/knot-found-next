import Image from 'next/image'

const processItems = [
  {
    label: '01 / Material Tray',
    title: 'Your Materials',
    src: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '02 / AI Render',
    title: 'AI Design Ideas',
    src: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '03 / Making Steps',
    title: 'Makeable Steps',
    src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
  },
]

const directionItems = [
  {
    badge: 'Easiest to Make',
    title: 'Quick Charm Stack',
    desc: 'A simple, wearable design that uses your current beads and findings.',
    src: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    badge: 'Studio Choice',
    title: 'Golden Drift Necklace',
    desc: 'A boho layered direction with natural flow and handcrafted detail.',
    src: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1200&q=80',
  },
  {
    badge: 'Zero Waste',
    title: 'Treasureline Bracelet',
    desc: 'A no-waste concept that turns leftover pieces into a cohesive design.',
    src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
  },
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <nav className="top-nav">
        <a className="brand" href="#">Charmchemy</a>
        <div className="nav-links">
          <a href="#process">The Process</a>
          <a href="#gallery">Design Gallery</a>
          <a href="#start" className="start-btn">Start Creating</a>
        </div>
      </nav>

      <main className="content">
        <section className="hero" id="start">
          <span className="kicker">Made from maybe. Designed by AI. Crafted by you.</span>
          <h1>
            Turn your <em>existing materials</em> into beautiful jewelry ideas.
          </h1>
          <p>
            Upload your beads, charms, chains, and findings. Charmchemy creates
            AI-generated DIY jewelry directions that are beautiful and makeable.
          </p>
          <a className="cta" href="#process">Start Creating</a>
        </section>

        <section className="process-grid" id="process">
          {processItems.map((item) => (
            <article key={item.label} className="photo-card">
              <div className="image-wrap">
                <Image src={item.src} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                <span className="image-label">{item.label}</span>
              </div>
              <p>{item.title}</p>
            </article>
          ))}
        </section>

        <section className="steps-panel">
          <div>
            <h2>Three steps. Endless possibilities.</h2>
            <p>
              Built for DIY jewelry makers who already have materials but need
              fresh, makeable design ideas.
            </p>
            <a href="#gallery">Start Creating</a>
          </div>

          <ol>
            <li>
              <strong>I.</strong>
              <div>
                <h3>Upload your tray</h3>
                <p>Show your current beads, charms, chains, and findings.</p>
              </div>
            </li>
            <li>
              <strong>II.</strong>
              <div>
                <h3>Choose your mood</h3>
                <p>Pick your style, jewelry type, and who you are making it for.</p>
              </div>
            </li>
            <li>
              <strong>III.</strong>
              <div>
                <h3>Receive three directions</h3>
                <p>Get AI concepts with clear steps you can actually craft.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="directions" id="gallery">
          <div className="section-head">
            <div>
              <span className="kicker">Boho direction set</span>
              <h2>AI concepts from what you already own</h2>
            </div>
            <a href="#">See sample ideas</a>
          </div>

          <div className="direction-grid">
            {directionItems.map((item) => (
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
      </main>

      <footer>
        <span>Charmchemy</span>
        <p>Made from maybe. Designed by AI. Crafted by you.</p>
      </footer>
    </div>
  )
}
