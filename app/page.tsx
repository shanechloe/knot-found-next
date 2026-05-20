import Image from 'next/image'

const processItems = [
  {
    label: '01 / Material Tray',
    title: 'The Input',
    src: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '02 / AI Render',
    title: 'The Inspiration',
    src: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: '03 / Making Steps',
    title: 'The Guide',
    src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
  },
]

const directionItems = [
  {
    badge: 'Easiest to Make',
    title: 'The Soloist Pendant',
    desc: 'Uses 10% of materials. One central stone on a clean, minimal chain.',
    src: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    badge: 'Studio Choice',
    title: 'The Layered Fragment',
    desc: 'A richer design direction with wrapped details and layered texture.',
    src: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=1200&q=80',
  },
  {
    badge: 'Zero Waste',
    title: 'The Collected Strand',
    desc: 'Uses all tray pieces in an asymmetric composition for daily wear.',
    src: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
  },
]

export default function HomePage() {
  return (
    <div className="page-shell">
      <nav className="top-nav">
        <a className="brand" href="#">Knot & Found.</a>
        <div className="nav-links">
          <a href="#process">The Process</a>
          <a href="#gallery">Studio Gallery</a>
          <button type="button" className="lang-btn">中文</button>
          <a href="#start" className="start-btn">Start Making</a>
        </div>
      </nav>

      <main className="content">
        <section className="hero" id="start">
          <span className="kicker">An AI studio for handmade jewelry</span>
          <h1>
            Turning your <em>scattered treasures</em> into finished craft.
          </h1>
          <p>
            Upload your beads, chains, and loose findings. Our AI studio designs
            the jewelry you didn&apos;t know you could make.
          </p>
          <a className="cta" href="#process">Lay out your materials</a>
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
            <h2>Three steps. One finished piece.</h2>
            <p>
              No more staring at a tray of beads with no idea where to start.
              Lay it out, name the mood, and we&apos;ll draft a plan you can hold.
            </p>
            <a href="#gallery">Generate design plans</a>
          </div>

          <ol>
            <li>
              <strong>I.</strong>
              <div>
                <h3>Upload your tray</h3>
                <p>Photograph the beads, chains, and findings you already have.</p>
              </div>
            </li>
            <li>
              <strong>II.</strong>
              <div>
                <h3>Choose your mood</h3>
                <p>Pick a jewelry type, aesthetic, and occasion.</p>
              </div>
            </li>
            <li>
              <strong>III.</strong>
              <div>
                <h3>Receive three directions</h3>
                <p>Easiest to make, studio choice, and zero-waste with steps.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="directions" id="gallery">
          <div className="section-head">
            <div>
              <span className="kicker">A glimpse</span>
              <h2>Three directions per tray</h2>
            </div>
            <a href="#">See a sample result</a>
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
        <span>Knot & Found.</span>
        <p>Curating the craft of the everyday</p>
      </footer>
    </div>
  )
}
