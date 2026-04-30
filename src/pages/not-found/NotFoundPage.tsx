import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button.tsx';
import { PageShell } from '@/shared/ui/PageShell.tsx';
import { ThemeToggle } from '@/shared/ui/ThemeToggle.tsx';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageShell
      titleActions={<ThemeToggle />}
      onTitleClick={() => navigate('/')}
      title="AIPIA News"
    >
      <section
        className="relative isolate flex min-h-[60vh] flex-col items-center justify-center overflow-hidden rounded-(--ds-radius-card) px-8 py-20 text-center"
        aria-labelledby="not-found-title"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-[0.04]"
        >
          <div className="h-150 w-150 rounded-full border border-app-foreground" />
          <div className="absolute h-100 w-100 rounded-full border border-app-foreground" />
        </div>

        <div className="mb-8">
          <p className="m-0 select-none text-[clamp(6rem,20vw,12rem)] font-extralight leading-none tracking-[-0.08em] text-app-foreground">
            404
          </p>
          <div className="mx-auto mt-4 h-px w-12 bg-(--ds-color-border)" />
        </div>

        <div className="mx-auto max-w-xl space-y-6">
          <h2
            className="m-0 text-3xl font-medium leading-10 tracking-[-0.01em] text-app-foreground"
            id="not-found-title"
          >
            Page Not Found
          </h2>
          <p className="m-0 text-lg leading-7 text-app-muted">
            The page you requested appears to be missing or no longer available.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <Button className="min-h-13 px-12" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </section>
    </PageShell>
  );
}

export default NotFoundPage;
