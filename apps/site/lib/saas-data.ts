import { db } from "./database";
import type { CompanyProfileInput, WorkflowRunInput } from "./skill-runner";

export type WorkflowJob = {
  id: string;
  workflowSlug: string;
  status: "queued" | "running" | "completed" | "failed";
  input: WorkflowRunInput;
  outputMarkdown: string | null;
  executionMode: "provider" | "fixture" | null;
  model: string | null;
  error: string | null;
  createdAt: string;
};

export async function getCompanyProfile(
  userId: string,
): Promise<CompanyProfileInput | null> {
  const rows = await db()`
    SELECT company_name, description, standing, beat_topics
    FROM company_profiles
    WHERE user_id = ${userId}
  `;
  const row = rows[0];
  if (!row) {
    return null;
  }
  return {
    companyName: String(row.company_name),
    description: String(row.description),
    standing: String(row.standing),
    beatTopics: Array.isArray(row.beat_topics)
      ? row.beat_topics.map(String)
      : [],
  };
}

export async function saveCompanyProfile(
  userId: string,
  profile: CompanyProfileInput,
): Promise<void> {
  await db()`
    INSERT INTO company_profiles (
      user_id, company_name, description, standing, beat_topics, updated_at
    )
    VALUES (
      ${userId},
      ${profile.companyName},
      ${profile.description},
      ${profile.standing},
      ${JSON.stringify(profile.beatTopics)}::jsonb,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      description = EXCLUDED.description,
      standing = EXCLUDED.standing,
      beat_topics = EXCLUDED.beat_topics,
      updated_at = NOW()
  `;
}

export async function createJob(
  userId: string,
  input: WorkflowRunInput,
): Promise<string> {
  const id = crypto.randomUUID();
  await db()`
    INSERT INTO workflow_jobs (id, user_id, workflow_slug, status, input)
    VALUES (
      ${id},
      ${userId},
      ${input.workflowSlug},
      'queued',
      ${JSON.stringify(input)}::jsonb
    )
  `;
  return id;
}

export async function markJobRunning(id: string, userId: string): Promise<void> {
  await db()`
    UPDATE workflow_jobs
    SET status = 'running', updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

export async function completeJob(
  id: string,
  userId: string,
  output: string,
  mode: "provider" | "fixture",
  model?: string,
): Promise<void> {
  await db()`
    UPDATE workflow_jobs
    SET
      status = 'completed',
      output_markdown = ${output},
      execution_mode = ${mode},
      model = ${model ?? null},
      error = NULL,
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

export async function failJob(
  id: string,
  userId: string,
  error: string,
): Promise<void> {
  await db()`
    UPDATE workflow_jobs
    SET status = 'failed', error = ${error.slice(0, 1000)}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

export async function listJobs(userId: string): Promise<WorkflowJob[]> {
  const rows = await db()`
    SELECT
      id,
      workflow_slug,
      status,
      input,
      output_markdown,
      execution_mode,
      model,
      error,
      created_at
    FROM workflow_jobs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return rows.map(mapJob);
}

export async function getJob(
  id: string,
  userId: string,
): Promise<WorkflowJob | null> {
  const rows = await db()`
    SELECT
      id,
      workflow_slug,
      status,
      input,
      output_markdown,
      execution_mode,
      model,
      error,
      created_at
    FROM workflow_jobs
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ? mapJob(rows[0]) : null;
}

function mapJob(row: Record<string, unknown>): WorkflowJob {
  return {
    id: String(row.id),
    workflowSlug: String(row.workflow_slug),
    status: row.status as WorkflowJob["status"],
    input: row.input as WorkflowRunInput,
    outputMarkdown:
      typeof row.output_markdown === "string" ? row.output_markdown : null,
    executionMode:
      row.execution_mode === "provider" || row.execution_mode === "fixture"
        ? row.execution_mode
        : null,
    model: typeof row.model === "string" ? row.model : null,
    error: typeof row.error === "string" ? row.error : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}
