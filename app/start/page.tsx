'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type PreviewImage = {
  id: string
  name: string
  url: string
  dataUrl: string
}

type StoredStartInput = {
  materialsText?: string
  type?: string
  style?: string
  purpose?: string
  difficulty?: string
  previewImages?: Array<{ id: string; name: string; dataUrl: string }>
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function resizeImageDataUrl(dataUrl: string, maxSide = 1024, quality = 0.72) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      const scale = Math.min(1, maxSide / Math.max(width, height))
      const targetWidth = Math.max(1, Math.round(width * scale))
      const targetHeight = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process image'))
        return
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('Could not process image'))
    img.src = dataUrl
  })
}

export default function StartCreatingPage() {
  const router = useRouter()
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [materialsText, setMaterialsText] = useState('')
  const [autoFillNote, setAutoFillNote] = useState('')
  const [type, setType] = useState('Necklace')
  const [style, setStyle] = useState('Boho')
  const [purpose, setPurpose] = useState('Everyday wear')
  const [difficulty, setDifficulty] = useState('Medium')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('charmchemy:lastStartInput')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as StoredStartInput
      if (parsed.materialsText) setMaterialsText(parsed.materialsText)
      if (parsed.type) setType(parsed.type)
      if (parsed.style) setStyle(parsed.style)
      if (parsed.purpose) setPurpose(parsed.purpose)
      if (parsed.difficulty) setDifficulty(parsed.difficulty)
      if (Array.isArray(parsed.previewImages) && parsed.previewImages.length > 0) {
        setPreviewImages(
          parsed.previewImages.map((image, idx) => ({
            id: image.id || `${image.name}-${idx}`,
            name: image.name || `image-${idx + 1}.png`,
            dataUrl: image.dataUrl,
            url: image.dataUrl,
          })),
        )
      }
    } catch {
      // Ignore invalid cache.
    }
  }, [])

  const previewCountText = useMemo(() => {
    if (previewImages.length === 0) return 'No images selected yet.'
    return '1 image selected.'
  }, [previewImages.length])

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return

    const nextImages: PreviewImage[] = await Promise.all(
      Array.from(fileList).map(async (file) => {
        const rawDataUrl = await fileToDataUrl(file)
        const compressedDataUrl = await resizeImageDataUrl(rawDataUrl)

        return {
          id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
          name: file.name,
          url: compressedDataUrl,
          dataUrl: compressedDataUrl,
        }
      }),
    )

    setPreviewImages(nextImages.slice(0, 1))
    setAutoFillNote('')

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
    setDifficulty('Medium')
    setGenerateError('')
  }

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isGenerating) return
    setIsGenerating(true)
    setGenerateError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: materialsText,
          type,
          style,
          purpose,
          difficulty,
          images: previewImages.map((img) => img.dataUrl).slice(0, 1),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Generation failed.')

      sessionStorage.setItem(
        'charmchemy:lastResult',
        JSON.stringify({
          ideas: data.ideas,
          style,
          type,
          purpose,
          difficulty,
          materials: materialsText,
          source: data.source,
          warning: data.warning ?? '',
        }),
      )

      sessionStorage.setItem(
        'charmchemy:lastStartInput',
        JSON.stringify({
          materialsText,
          type,
          style,
          purpose,
          difficulty,
          previewImages: previewImages.map((img) => ({
            id: img.id,
            name: img.name,
            dataUrl: img.dataUrl,
          })),
        }),
      )

      router.push('/results?source=ai')
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Could not generate ideas. Please try again.')
    } finally {
      setIsGenerating(false)
    }
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
        <p className="progress-pill">Step 1 of 2: Upload materials and set your preferences</p>

        <section className="start-hero">
          <span className="kicker">Start Creating</span>
          <h1>Create your first AI jewelry design plan</h1>
          <p>
            Tell Charmchemy what materials you have and the style you want. We
            will generate 1 makeable design direction.
          </p>
        </section>

        <form className="start-card" onSubmit={handleGenerate}>
          <section className="upload-primary">
          <h2>Upload your materials</h2>
          <p className="start-help">
            Add a photo of your beads, charms, chains, findings, or leftover supplies.
          </p>
          <label className="upload-box upload-box-large" htmlFor="material-images">
            <span className="upload-title">Drag and drop a photo here</span>
            <span className="upload-subtitle">or click the button below to upload</span>
            <span className="upload-button">Upload photo</span>
          </label>
          <input
            id="material-images"
            className="file-input"
            type="file"
            accept="image/*"
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

          <section className="form-block">
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
          </section>

          <div className="form-grid form-grid-single form-block">
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

          <div className="form-grid form-grid-single form-block">
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

          <div className="form-grid form-grid-single form-block">
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

          <div className="form-grid form-grid-single form-block">
            <div>
              <h2>Choose difficulty</h2>
              <select className="start-input" name="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Difficult</option>
              </select>
            </div>
          </div>

          <div className="action-row">
            <button className="cta cta-button" type="submit" disabled={isGenerating}>
              {isGenerating ? 'Generating Ideas...' : 'Generate Ideas'}
            </button>
            <button className="lang-btn cta-button" type="button" onClick={clearAll}>Clear All</button>
          </div>
          {generateError && <p className="start-help error-text">{generateError}</p>}
        </form>
      </main>
    </div>
  )
}
