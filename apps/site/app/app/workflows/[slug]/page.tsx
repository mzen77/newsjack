import { notFound } from "next/navigation";

import { requireUser } from "../../../../lib/auth";
import {
  angleFixture,
  detectFixture,
} from "../../../../lib/skill-runner";
import { getWorkflow } from "../../../../lib/workflows";
import { AppShell } from "../../app-shell";
import { runWorkflowAction } from "../../actions";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WorkflowPage({ params }: Props) {
  const user = await requireUser();
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow?.enabled) {
    notFound();
  }
  const fixture = slug === "angle-generator" ? angleFixture : detectFixture;

  return (
    <AppShell user={user}>
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-wider text-emerald-300">
          {workflow.lane}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{workflow.name}</h1>
        <p className="mt-3 text-zinc-400">{workflow.summary}</p>
        <p className="mt-2 font-mono text-xs text-zinc-600">
          Contract: {workflow.contractPath}
        </p>

        <form action={runWorkflowAction} className="mt-8 space-y-5">
          <input name="workflowSlug" type="hidden" value={workflow.slug} />
          {workflow.fields.map((field) => (
            <label className="block text-sm font-medium" key={field.name}>
              {field.label}
              {field.kind === "textarea" ? (
                <textarea
                  className="mt-2 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 outline-none focus:border-emerald-300"
                  name={field.name}
                  required={field.required}
                  rows={6}
                />
              ) : (
                <input
                  className="mt-2 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 outline-none focus:border-emerald-300"
                  name={field.name}
                  required={field.required}
                  type={field.kind}
                />
              )}
              {field.help && (
                <span className="mt-1 block text-xs font-normal text-zinc-500">
                  {field.help}
                </span>
              )}
            </label>
          ))}
          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
            <button
              className="rounded-lg bg-emerald-300 px-5 py-2.5 font-semibold text-zinc-950"
              name="executionMode"
              type="submit"
              value="provider"
            >
              Run workflow
            </button>
            <button
              className="rounded-lg border border-white/15 px-5 py-2.5 text-sm"
              name="executionMode"
              type="submit"
              value="fixture"
            >
              Run grounded fixture
            </button>
          </div>
        </form>

        <details className="mt-8 rounded-xl border border-white/10 p-4 text-sm text-zinc-400">
          <summary className="cursor-pointer text-zinc-200">
            What the offline fixture uses
          </summary>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs">
            {JSON.stringify(
              { profile: fixture.profile, fields: fixture.fields },
              null,
              2,
            )}
          </pre>
        </details>
      </div>
    </AppShell>
  );
}
