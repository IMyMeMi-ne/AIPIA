import { useNavigate } from 'react-router-dom'
import { ErrorState } from '../../shared/ui/ErrorState.tsx'
import { PageShell } from '../../shared/ui/PageShell.tsx'
import { Surface } from '../../shared/ui/Surface.tsx'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <PageShell
      description="The requested route does not exist."
      onTitleClick={() => navigate('/')}
      title="AIPIA News"
    >
      <Surface className="p-4 sm:p-6" elevated>
        <ErrorState
          message="Check the address or return to the main page."
          title="Route unavailable"
        />
      </Surface>
    </PageShell>
  )
}

export default NotFoundPage
