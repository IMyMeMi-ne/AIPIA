function NewsListPage() {
  return (
    <main className="flex min-h-screen bg-app-background text-app-foreground flex-col items-center justify-center gap-3 px-8 py-10 text-center" aria-labelledby="news-list-title">
      <p className="m-0 text-base text-app-muted">Hacker News board assignment</p>
      <h1 id="news-list-title" className="m-0 text-5xl leading-none font-bold tracking-[-0.06em] text-app-foreground sm:text-7xl">
        AIPIA News
      </h1>
      <p className="m-0 text-base text-app-muted">Top / New / Best stories will render here.</p>
    </main>
  )
}

export default NewsListPage
