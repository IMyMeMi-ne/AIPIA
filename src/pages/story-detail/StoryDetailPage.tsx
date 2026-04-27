import { Link, useParams } from 'react-router-dom'

function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>()

  return (
    <main className="flex min-h-screen bg-app-background text-app-foreground flex-col items-center justify-center gap-3 px-8 py-10 text-center" aria-labelledby="story-detail-title">
      <p className="m-0 text-base text-app-muted">AIPIA News</p>
      <h1 id="story-detail-title" className="m-0 text-5xl leading-none font-bold tracking-[-0.06em] text-app-foreground sm:text-7xl">
        Story Detail
      </h1>
      <p className="m-0 text-base text-app-muted">
        Story ID: <span className="font-bold text-app-foreground">{storyId}</span>
      </p>
      <Link className="font-bold text-app-foreground underline-offset-4 hover:underline" to="/">
        Back to stories
      </Link>
    </main>
  )
}

export default StoryDetailPage
