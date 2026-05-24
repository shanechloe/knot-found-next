'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type Idea = {
  title: string
  type: string
  style: string
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  time: string
  materialsUsed: string
  steps: string[]
}

type StoredResult = {
  ideas?: Idea[]
  style?: string
  type?: string
  purpose?: string
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
    title: 'Moonlit Pearl Drops',
    type: 'Earrings',
    style: 'Romantic',
    difficulty: 'Easy',
    time: '25 min',
    materialsUsed: 'pearl beads, gold hooks, small clear beads',
    steps: [
      'Arrange one pearl bead with two clear beads.',
      'Attach them to a head pin.',
      'Connect to the earring hook.',
      'Repeat for the second earring.',
    ],
  },
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
  {
    title: 'Last-Bit Remix',
    type: 'Charm',
    style: 'Playful',
    difficulty: 'Easy',
    time: '30 min',
    materialsUsed: 'leftover findings',
    steps: [
      'Group your remaining components into mini sets.',
      'Create an asymmetrical but balanced arrangement.',
      'Attach all pieces securely with consistent spacing.',
      'Refine proportions, then complete final closures.',
    ],
  },
]

export default function ResultsPage() {
  const [result, setResult] = useState<StoredResult>({
    ideas: fallbackIdeas,
    style: 'Boho',
    type: 'Necklace',
    purpose: 'Everyday wear',
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
          <p>Here are 3 makeable designs based on your materials.</p>
          <p>
            Source: <strong>{result.source === 'openai' ? 'OpenAI' : 'Fallback'}</strong>
          </p>
          <p>
            Style: <strong>{result.style || 'Boho'}</strong> | Type: <strong>{result.type || 'Necklace'}</strong> | Purpose:{' '}
            <strong>{result.purpose || 'Everyday wear'}</strong>
          </p>
          {result.warning ? <p className="start-help error-text">{result.warning}</p> : null}
        </section>

        <section className="result-grid">
          {ideas.map((idea, idx) => (
            <article key={`${idea.title}-${idx}`} className="direction-card result-card">
              <div className="image-wrap">
                <Image src={cardImages[idx % cardImages.length]} alt={idea.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
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
                <button type="button" className="chip">Save</button>
                <button type="button" className="chip">Share</button>
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
