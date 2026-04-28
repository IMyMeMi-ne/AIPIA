type ErrorStateProps = {
  title?: string
  description?: string
  retryLabel?: string
  onRetry?: () => void
}

function ErrorState({
  title = 'Something went wrong',
  description,
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <section role="alert">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </section>
  )
}

export default ErrorState
