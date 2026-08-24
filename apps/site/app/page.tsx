export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_28rem),linear-gradient(135deg,#090b0f_0%,#101217_54%,#050607_100%)] text-zinc-50">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center px-5 py-12 sm:px-8 lg:px-10">
        <section
          aria-labelledby="hero-title"
          className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center"
        >
          <div className="max-w-3xl">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-emerald-300">
              Mike&apos;s Newsjack fork
            </p>
            <h1
              id="hero-title"
              className="max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Newsjack workflows, in your browser.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-zinc-300 sm:text-xl">
              A form-based web app built around the existing Newsjack skill
              contracts. Sign in, run a workflow, and keep the result.
            </p>

            <div className="mt-10 max-w-xl">
              <pre
                aria-label="Install command"
                className="overflow-x-auto rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-sm leading-6 text-emerald-200 shadow-2xl shadow-black/30 sm:text-base"
              >
                <code>curl -fsSL newsjack.sh | bash</code>
              </pre>
              <p className="mt-3 font-mono text-xs text-zinc-500">
                Installs latest from GitHub Releases
              </p>
            </div>

            <a
              className="mt-9 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-4 py-2.5 font-mono text-sm text-zinc-100 transition hover:border-emerald-300/50 hover:bg-emerald-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
              href="/app"
              rel="noreferrer"
              target="_blank"
            >
              <span>Open Newsjack Web</span>
            </a>
          </div>

          <div
            aria-hidden="true"
            className="hidden rounded-lg border border-white/10 bg-zinc-950/70 p-4 font-mono text-xs text-zinc-400 shadow-2xl shadow-black/30 lg:block"
          >
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-2">
              <p>
                <span className="text-emerald-300">$</span> newsjack install
              </p>
              <p className="text-zinc-500">resolving agent runtime...</p>
              <p className="text-zinc-500">syncing pr operator skills...</p>
              <p className="text-zinc-500">readying REST api commands...</p>
              <p className="text-zinc-100">ready</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex h-16 w-full max-w-6xl items-center px-5 font-mono text-xs text-zinc-500 sm:px-8 lg:px-10">
        Community web app · github.com/mzen77/newsjack
      </footer>
    </div>
  );
}
