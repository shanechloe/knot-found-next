export default function StartCreatingPage() {
  return (
    <div className="start-page-shell">
      <nav className="top-nav">
        <a className="brand" href="/">Charmchemy</a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#gallery">Gallery</a>
        </div>
      </nav>

      <main className="start-content">
        <section className="start-hero">
          <span className="kicker">Start Creating</span>
          <h1>Create your first AI jewelry design plan</h1>
          <p>
            Tell Charmchemy what materials you have and the style you want. We
            will generate 3 makeable design directions.
          </p>
        </section>

        <section className="start-card">
          <h2>Your Materials</h2>
          <p className="start-help">Paste or type what you currently have.</p>
          <textarea
            className="start-input"
            rows={5}
            placeholder="Example: pearl beads, gold chain, lobster clasp, 8 jump rings, moon charm"
          />

          <h2>Style</h2>
          <p className="start-help">Pick the design vibe for this piece.</p>
          <div className="chip-row">
            <button type="button" className="chip active">Boho</button>
            <button type="button" className="chip">Minimal</button>
            <button type="button" className="chip">Cute</button>
            <button type="button" className="chip">Bold</button>
          </div>

          <h2>Occasion</h2>
          <p className="start-help">Optional context helps improve ideas.</p>
          <input className="start-input" placeholder="Example: weekend market, gift, daily wear" />

          <div className="action-row">
            <a className="cta" href="#">Generate 3 Designs</a>
            <a className="lang-btn" href="/">Back to Home</a>
          </div>
        </section>
      </main>
    </div>
  )
}
