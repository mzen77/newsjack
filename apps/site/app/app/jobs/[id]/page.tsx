import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "../../../../lib/auth";
import { getJob } from "../../../../lib/saas-data";
import { AppShell } from "../../app-shell";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const job = await getJob(id, user.id);
  if (!job) {
    notFound();
  }

  return (
    <AppShell user={user}>
      <div className="max-w-4xl">
        <Link className="text-sm text-zinc-500 underline" href="/app/dashboard">
          Back to dashboard
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-emerald-300">
              Saved job
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{job.workflowSlug}</h1>
          </div>
          <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs uppercase">
            {job.status}
          </span>
        </div>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-xs text-zinc-500">
          <div>
            <dt className="inline">Created </dt>
            <dd className="inline">{new Date(job.createdAt).toLocaleString()}</dd>
          </div>
          {job.executionMode && (
            <div>
              <dt className="inline">Mode </dt>
              <dd className="inline">{job.executionMode}</dd>
            </div>
          )}
          {job.model && (
            <div>
              <dt className="inline">Model </dt>
              <dd className="inline">{job.model}</dd>
            </div>
          )}
        </dl>

        {job.status === "failed" ? (
          <section className="mt-8 rounded-xl border border-red-400/30 bg-red-400/10 p-5">
            <h2 className="font-semibold text-red-100">Workflow failed</h2>
            <p className="mt-2 text-sm text-red-100/80">{job.error}</p>
          </section>
        ) : (
          <section className="mt-8 rounded-xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Result
            </h2>
            <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-200">
              {job.outputMarkdown ?? "The job has not produced output yet."}
            </div>
          </section>
        )}

        <details className="mt-6 rounded-xl border border-white/10 p-4">
          <summary className="cursor-pointer text-sm">Recorded input</summary>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs text-zinc-400">
            {JSON.stringify(job.input, null, 2)}
          </pre>
        </details>
      </div>
    </AppShell>
  );
}
