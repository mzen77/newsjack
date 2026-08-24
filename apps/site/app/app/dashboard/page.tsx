import Link from "next/link";

import { requireUser } from "../../../lib/auth";
import { getCompanyProfile, listJobs } from "../../../lib/saas-data";
import {
  workflowCatalog,
  type WorkflowLane,
} from "../../../lib/workflows";
import { AppShell } from "../app-shell";

const lanes: Array<{ id: WorkflowLane; title: string }> = [
  { id: "detect", title: "Detect" },
  { id: "act", title: "Act" },
  { id: "strategize", title: "Strategize" },
  { id: "ai-visibility", title: "AI visibility" },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const [profile, jobs] = await Promise.all([
    getCompanyProfile(user.id),
    listJobs(user.id),
  ]);

  return (
    <AppShell user={user}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Workflows</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Forms in, saved results out. No chat transcript.
          </p>
        </div>
        <Link
          className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-emerald-300"
          href="/app/profile"
        >
          {profile ? `Profile: ${profile.companyName}` : "Set up company profile"}
        </Link>
      </div>

      {!profile && (
        <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          Save your company standing and beat topics before running live
          workflows. Grounded fixtures work without a profile.
        </div>
      )}

      <div className="mt-10 space-y-10">
        {lanes.map((lane) => (
          <section key={lane.id}>
            <h2 className="text-xl font-semibold">{lane.title}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {workflowCatalog
                .filter((workflow) => workflow.lane === lane.id)
                .map((workflow) => (
                  <article
                    className={`rounded-xl border p-4 ${
                      workflow.enabled
                        ? "border-white/15 bg-zinc-950"
                        : "border-white/5 bg-zinc-950/40 text-zinc-500"
                    }`}
                    key={workflow.slug}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-medium">{workflow.name}</h3>
                      <span className="font-mono text-[10px] uppercase tracking-wider">
                        {workflow.enabled ? "Ready" : "Later"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6">
                      {workflow.enabled
                        ? workflow.summary
                        : workflow.unavailableReason}
                    </p>
                    {workflow.enabled && (
                      <Link
                        className="mt-4 inline-block text-sm text-emerald-300 underline"
                        href={`/app/workflows/${workflow.slug}`}
                      >
                        Open form
                      </Link>
                    )}
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Recent jobs</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          {jobs.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">No jobs yet.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {jobs.map((job) => (
                <li
                  className="flex items-center justify-between gap-4 p-4"
                  key={job.id}
                >
                  <div>
                    <Link
                      className="font-medium hover:text-emerald-300"
                      href={`/app/jobs/${job.id}`}
                    >
                      {job.workflowSlug}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-mono text-xs uppercase text-zinc-400">
                    {job.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}
