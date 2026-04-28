import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/shared/ui/Badge.tsx'
import { PageShell } from '@/shared/ui/PageShell.tsx'
import { Surface } from '@/shared/ui/Surface.tsx'

function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>()

  return (
    <PageShell
      actions={
        <Link
          className="inline-flex min-h-10 items-center rounded-(--ds-radius-control) border border-(--ds-color-border) bg-(--ds-color-surface) px-4 text-sm font-semibold text-app-foreground transition-colors hover:bg-(--ds-color-surface-muted)"
          to="/"
        >
          Back to stories
        </Link>
      }
      description="The story detail layout will be connected after the shared foundation is in place."
      eyebrow={<Badge>Detail shell</Badge>}
      title="Story Detail"
    >
      <Surface className="p-5 sm:p-6">
        <p className="m-0 text-sm text-app-muted">
          Story ID: <span className="font-bold text-app-foreground">{storyId}</span>
        </p>
      </Surface>
    </PageShell>
  )
}

export default StoryDetailPage
