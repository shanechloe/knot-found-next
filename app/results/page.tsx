'use client'
import { useEffect, useMemo, useState } from 'react'

type Idea = {
  title: string
  type: string
  style: string
  difficulty: 'Easy' | 'Medium' | 'Difficult'
  time: string
  materialsUsed: string
  steps: string[]
  imageUrl?: string
}

type StoredResult = {
  ideas?: Idea[]
  style?: string
  type?: string
  purpose?: string
  difficulty?: string
  materials?: string
  source?: string
  warning?: string
}

const cardImages = [
  '/examples/design-1.jpg',
  '/examples/design-2.jpg',
  '/examples/design-3.jpg',
]

const fallbackIdeas: Idea[] = [
  {
    title: 'Boho Drift Necklace',
    type: 'Necklace',
    style: 'Boho',
    difficulty: 'Medium',
    time: '40 min',
    materialsUsed: 'mixed stash pieces',
    steps: [
      'Sort your focal pieces and supporting beads by size.',
      'Build the base structure and secure with jump rings.',
      'Layer texture elements for depth and movement.',
      'Finish and test comfort for your planned purpose.',
    ],
  },
]

export default function ResultsPage() {
  const [result, setResult] = useState<StoredResult>({
    ideas: fallbackIdeas,
    style: 'Boho',
    type: 'Necklace',
    purpose: 'Everyday wear',
    difficulty: 'Medium',
    warning: 'Showing fallback ideas. Generate from Start Creating for live AI output.',
  })

  useEffect(() => {
    const raw = sessionStorage.getItem('charmchemy:lastResult')
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as StoredResult
      if (parsed?.ideas && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
        setResult(parsed)
      }
    } catch {
      // Keep fallback if parsing fails.
    }
  }, [])

  const ideas = useMemo(() => result.ideas ?? fallbackIdeas, [result.ideas])

  const handleSaveImage = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'charmchemy-design'}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      alert('Could not save image. Please try again.')
    }
  }

  const handleCopyText = async (idea: Idea) => {
    const text = [
      idea.title,
      `Type: ${idea.type}`,
      `Style: ${idea.style}`,
      `Difficulty: ${idea.difficulty}`,
      `Time: ${idea.time}`,
      `Materials used: ${idea.materialsUsed}`,
      'Steps:',
      ...idea.steps.map((step, index) => `${index + 1}. ${step}`),
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      alert('Design text copied.')
    } catch {
      alert('Could not copy text. Please try again.')
    }
  }

  return (
    <div className="start-page-shell">
      <nav className="top-nav">
        <a className="brand" href="/">Charmchemy</a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/start">Start Creating</a>
          <a href="/#gallery">Gallery</a>
        </div>
      </nav>

      <main className="start-content">
        <section className="start-hero">
          <span className="kicker">Your Results</span>
          <h1>Your jewelry ideas are ready.</h1>
          <p>Here is 1 makeable design based on your materials.</p>
          <p>
            Source: <strong>{result.source === 'openai' ? 'OpenAI' : 'Fallback'}</strong>
          </p>
          <p>
            Style: <strong>{result.style || 'Boho'}</strong> | Type: <strong>{result.type || 'Necklace'}</strong> | Purpose:{' '}
            <strong>{result.purpose || 'Everyday wear'}</strong> | Difficulty: <strong>{result.difficulty || 'Medium'}</strong>
          </p>
          {result.warning ? <p className="start-help error-text">{result.warning}</p> : null}
        </section>

        <section className="result-grid">
          {ideas.slice(0, 1).map((idea, idx) => (
            <article key={`${idea.title}-${idx}`} className="direction-card result-card">
              <div className="image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={idea.imageUrl || cardImages[idx % cardImages.length]} alt={idea.title} />
                <span className="image-label">{`Design ${idx + 1}`}</span>
              </div>
              <h3>{idea.title}</h3>
              <ul className="result-meta">
                <li><strong>Type:</strong> {idea.type}</li>
                <li><strong>Style:</strong> {idea.style}</li>
                <li><strong>Difficulty:</strong> {idea.difficulty}</li>
                <li><strong>Time:</strong> {idea.time}</li>
                <li><strong>Materials used:</strong> {idea.materialsUsed}</li>
              </ul>
              <div>
                <p className="result-steps-title"><strong>Steps:</strong></p>
                <ol className="result-steps">
                  {idea.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="result-actions">
                <button
                  type="button"
                  className="chip"
                  onClick={() => handleSaveImage(idea.imageUrl || cardImages[idx % cardImages.length], idea.title)}
                >
                  Save
                </button>
                <button type="button" className="chip" onClick={() => handleCopyText(idea)}>
                  Copy Text
                </button>
                <a className="chip" href="/start">Regenerate this idea</a>
              </div>
            </article>
          ))}
        </section>

        <section className="steps-panel" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div>
            <h2>Want more options?</h2>
            <p>Adjust your inputs and regenerate to explore fresh design paths.</p>
            <a href="/start">Try another prompt</a>
          </div>
        </section>
      </main>
    </div>
  )
}
