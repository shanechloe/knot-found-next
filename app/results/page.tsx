import Image from 'next/image'

type ResultsProps = {
  searchParams?: {
    materials?: string
    style?: string
    type?: string
    purpose?: string
  }
}

const cardImages = [
  '/examples/design-1.jpg',
  '/examples/design-2.jpg',
  '/examples/design-3.jpg',
]

function normalize(value: string | undefined, fallback: string) {
  if (!value || value.trim().length === 0) return fallback
  return value.trim()
}

export default function ResultsPage({ searchParams }: ResultsProps) {
  const materials = normalize(searchParams?.materials, 'mixed beads and chain offcuts')
  const style = normalize(searchParams?.style, 'Boho')
  const selectedType = normalize(searchParams?.type, 'Necklace')
  const purpose = normalize(searchParams?.purpose, 'Everyday wear')
  const type = selectedType === 'Surprise Me' ? 'Jewelry Piece' : selectedType

  const ideas = [
    {
      designLabel: 'Design 1',
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
      designLabel: 'Design 2',
      title: `${style} Drift ${type}`,
      type,
      style,
      difficulty: 'Medium',
      time: '40 min',
      materialsUsed: materials,
      steps: [
        'Sort your focal pieces and supporting beads by size.',
        'Build the base structure and secure with jump rings.',
        'Layer texture elements for depth and movement.',
        'Finish and test comfort for your planned purpose.',
      ],
    },
    {
      designLabel: 'Design 3',
      title: `Last-Bit ${type} Remix`,
      type,
      style: style === 'Minimal' ? 'Playful' : style,
      difficulty: 'Easy',
      time: '30 min',
      materialsUsed: `${materials} + leftover findings`,
      steps: [
        'Group your remaining components into 2-3 mini sets.',
        'Create an asymmetrical but balanced arrangement.',
        'Attach all pieces securely with consistent spacing.',
        'Refine proportions, then complete final closures.',
      ],
    },
  ]

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
          <p>
            Here are 3 makeable designs based on your materials.
          </p>
          <p>
            Style: <strong>{style}</strong> | Type: <strong>{selectedType}</strong> | Purpose: <strong>{purpose}</strong>
          </p>
        </section>

        <section className="result-grid">
          {ideas.map((idea, idx) => (
            <article key={idea.title} className="direction-card result-card">
              <div className="image-wrap">
                <Image src={cardImages[idx]} alt={idea.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                <span className="image-label">{idea.designLabel}</span>
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
                <button type="button" className="chip">Regenerate this idea</button>
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
