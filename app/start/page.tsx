'use client'

import { ChangeEvent, useMemo, useState } from 'react'

type PreviewImage = {
  id: string
  name: string
  url: string
}

const KNOWN_MATERIALS = [
  'beads',
  'pearl',
  'pearls',
  'chain',
  'chains',
  'charm',
  'charms',
  'hook',
  'hooks',
  'wire',
  'clasp',
  'findings',
  'ring',
  'rings',
  'stone',
  'stones',
  'crystal',
  'crystals',
  'gold',
  'silver',
]

function toMaterialKeywords(fileName: string) {
  const normalized = fileName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_-]+/g, ' ')

  const words = normalized.split(/\s+/).filter(Boolean)
  const known = words.filter((word) => KNOWN_MATERIALS.includes(word))
  const fallback = words.filter((word) => word.length > 2).slice(0, 4)
  return known.length > 0 ? known : fallback
}

export default function StartCreatingPage() {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [materialsText, setMaterialsText] = useState('')
  const [autoFillNote, setAutoFillNote] = useState('')
  const [type, setType] = useState('Necklace')
  const [style, setStyle] = useState('Boho')
  const [purpose, setPurpose] = useState('Everyday wear')

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

    const detected = Array.from(fileList)
      .flatMap((file) => toMaterialKeywords(file.name))
      .map((word) => word.trim())
      .filter(Boolean)

    const uniqueDetected = Array.from(new Set(detected))
    if (uniqueDetected.length > 0) {
      setMaterialsText(uniqueDetected.join(', '))
      setAutoFillNote('Materials auto-filled from image filenames. You can edit or leave blank.')
    } else {
      setAutoFillNote('Could not detect material keywords from filenames. You can type manually or leave blank.')
    }

    event.target.value = ''
  }

  const removeImage = (id: string) => {
    setPreviewImages((current) => current.filter((img) => img.id !== id))
  }

  const clearAll = () => {
    setPreviewImages([])
    setMaterialsText('')
    setAutoFillNote('')
    setType('Necklace')
    setStyle('Boho')
    setPurpose('Everyday wear')
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

        <form className="start-card" action="/results" method="get">
          <section className="upload-primary">
          <h2>Upload your materials</h2>
          <p className="start-help">
            Add photos of your beads, charms, chains, findings, or leftover supplies.
          </p>
          <label className="upload-box upload-box-large" htmlFor="material-images">
            <span className="upload-title">Drag and drop photos here</span>
            <span className="upload-subtitle">or click the button below to upload</span>
            <span className="upload-button">Upload photos</span>
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
          <p className="start-tip">Tip: Lay your materials on a plain background for better results.</p>
          </section>

          <h2>
            Describe more details <span className="optional-tag">Optional</span>
          </h2>
          <p className="start-help">
            Tell us anything helpful, like colors, quantities, materials, or pieces you really want to use.
          </p>
          {autoFillNote && <p className="start-help">{autoFillNote}</p>}
          <textarea
            className="start-input"
            rows={5}
            name="materials"
            value={materialsText}
            onChange={(event) => setMaterialsText(event.target.value)}
            placeholder="For example: I have 6 pearl beads, some gold wire, and I want something simple for everyday wear."
          />

          <div className="form-grid form-grid-single">
            <div>
              <h2>What would you like to make?</h2>
              <p className="start-help">Not sure? Choose Surprise Me and let Charmchemy decide.</p>
              <select className="start-input" name="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Necklace</option>
                <option>Bracelet</option>
                <option>Earrings</option>
                <option>Ring</option>
                <option>Charm</option>
                <option>Surprise Me</option>
              </select>
            </div>
          </div>

          <div className="form-grid form-grid-single">
            <div>
              <h2>Choose a vibe</h2>
              <select className="start-input" name="style" value={style} onChange={(e) => setStyle(e.target.value)}>
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
          </div>

          <div className="form-grid form-grid-single">
            <div>
              <h2>What is it for?</h2>
              <select className="start-input" name="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option>Everyday wear</option>
                <option>Gift</option>
                <option>Party</option>
                <option>Wedding</option>
                <option>Market / Selling</option>
                <option>Upcycle project</option>
              </select>
            </div>
          </div>

          <div className="action-row">
            <button className="cta cta-button" type="submit">Generate Ideas</button>
            <button className="lang-btn cta-button" type="button" onClick={clearAll}>Clear All</button>
          </div>
        </form>
      </main>
    </div>
  )
}
