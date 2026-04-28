type LoadingStateProps = {
  message?: string
}

function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <section aria-live="polite" aria-busy="true">
      <p>{message}</p>
    </section>
  )
}

export default LoadingState
