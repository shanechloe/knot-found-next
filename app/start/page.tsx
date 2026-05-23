'use client'

import { ChangeEvent, useMemo, useState } from 'react'

type PreviewImage = {
  id: string
  name: string
  url: string
}

export default function StartCreatingPage() {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])

  const previewCountText = useMemo(() => {
    if (previewImages.length === 0) return 'No images selected yet.'
    if (previewImages.length === 1) return '1 image selected.'
    return `${previewImages.length} images selected.`
  }, [previewImages.length])

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    const nextImages: PreviewImage[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setPreviewImages((current) => [...current, ...nextImages])
    event.target.value = ''
  }

  const removeImage = (id: string) => {
    setPreviewImages((current) => current.filter((img) => img.id !== id))
  }

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

        <section className="workflow-steps">
          <article className="workflow-step">
            <span>1</span>
            <div>
              <h3>Upload your materials</h3>
              <p>Tell us what beads, chains, charms, and findings you already own.</p>
            </div>
          </article>
          <article className="workflow-step">
            <span>2</span>
            <div>
              <h3>Choose your style</h3>
              <p>Select your vibe and jewelry type so ideas match your taste.</p>
            </div>
          </article>
          <article className="workflow-step">
            <span>3</span>
            <div>
              <h3>Get 3 makeable designs</h3>
              <p>Receive three directions with practical crafting guidance.</p>
            </div>
          </article>
        </section>

        <form className="start-card" action="/results" method="get">
          <h2>Upload Photos</h2>
          <p className="start-help">
            Add clear photos of your materials. Multiple images are supported.
          </p>
          <label className="upload-box" htmlFor="material-images">
            <span className="upload-title">Click to choose images</span>
            <span className="upload-subtitle">JPG, PNG, WEBP (multiple allowed)</span>
          </label>
          <input
            id="material-images"
            className="file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
          />

          <p className="start-help">{previewCountText}</p>
          {previewImages.length > 0 && (
            <div className="preview-grid">
              {previewImages.map((image) => (
                <article key={image.id} className="preview-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.name} />
                  <div className="preview-meta">
                    <p>{image.name}</p>
                    <button type="button" className="chip" onClick={() => removeImage(image.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <h2>Your Materials</h2>
          <p className="start-help">Paste or type what you currently have.</p>
          <textarea
            className="start-input"
            rows={5}
            name="materials"
            required
            placeholder="Example: pearl beads, gold chain, lobster clasp, 8 jump rings, moon charm"
          />

          <div className="form-grid">
            <div>
              <h2>Style</h2>
              <p className="start-help">Pick the design vibe.</p>
              <select className="start-input" name="style" defaultValue="Boho">
                <option>Minimal</option>
                <option>Romantic</option>
                <option>Vintage</option>
                <option>Boho</option>
                <option>Fairycore</option>
                <option>Elegant</option>
                <option>Playful</option>
                <option>Statement</option>
              </select>
            </div>
            <div>
              <h2>Type</h2>
              <p className="start-help">Choose one for this idea set.</p>
              <select className="start-input" name="type" defaultValue="Necklace">
                <option>Necklace</option>
                <option>Bracelet</option>
                <option>Earrings</option>
                <option>Ring</option>
                <option>Charm</option>
                <option>Surprise Me</option>
              </select>
            </div>
          </div>

          <h2>Purpose</h2>
          <p className="start-help">Tell us what this design is for.</p>
          <select className="start-input" name="purpose" defaultValue="Everyday wear">
            <option>Everyday wear</option>
            <option>Gift</option>
            <option>Party</option>
            <option>Wedding</option>
            <option>Market / Selling</option>
            <option>Upcycle project</option>
          </select>

          <div className="action-row">
            <button className="cta cta-button" type="submit">Generate 3 Designs</button>
            <a className="lang-btn" href="/">Back to Home</a>
          </div>
        </form>
      </main>
    </div>
  )
}
