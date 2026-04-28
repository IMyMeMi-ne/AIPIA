import { Badge } from '@/shared/ui/Badge.tsx'
import { EmptyState } from '@/shared/ui/EmptyState.tsx'
import { PageShell } from '@/shared/ui/PageShell.tsx'
import { Surface } from '@/shared/ui/Surface.tsx'

function NewsListPage() {
  return (
    <PageShell
      description="A compact board shell for browsing story feeds. List-specific UI will be added in the next task."
      eyebrow={<Badge variant="accent">Foundation</Badge>}
      title="AIPIA News"
    >
      <Surface className="p-4 sm:p-6" elevated>
        <EmptyState
          message="Reusable list and detail components have not been introduced yet."
          title="Story list placeholder"
        />
      </Surface>
    </PageShell>
  )
}

export default NewsListPage
