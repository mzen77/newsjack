"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  deleteCurrentSession,
  requestMagicLink,
  requireUser,
} from "../../lib/auth";
import {
  completeJob,
  createJob,
  failJob,
  getCompanyProfile,
  markJobRunning,
  saveCompanyProfile,
} from "../../lib/saas-data";
import { skillContracts } from "../../lib/generated-skill-contracts";
import {
  angleFixture,
  detectFixture,
  runFixtureWorkflow,
  runProviderWorkflow,
  type CompanyProfileInput,
  type WorkflowRunInput,
} from "../../lib/skill-runner";
import { getWorkflow } from "../../lib/workflows";

export async function sendMagicLinkAction(formData: FormData): Promise<void> {
  const email = requiredString(formData, "email");
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  let result: Awaited<ReturnType<typeof requestMagicLink>>;
  try {
    result = await requestMagicLink(email, `${protocol}://${host}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send sign-in link.";
    redirect(`/app/sign-in?error=${encodeURIComponent(message)}`);
  }
  const params = new URLSearchParams({ sent: "1" });
  if (result.developmentUrl) {
    params.set("developmentUrl", result.developmentUrl);
  }
  redirect(`/app/sign-in?${params}`);
}

export async function signOutAction(): Promise<void> {
  await deleteCurrentSession();
  const { cookies } = await import("next/headers");
  (await cookies()).delete("newsjack_session");
  redirect("/app/sign-in");
}

export async function saveProfileAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const profile: CompanyProfileInput = {
    companyName: requiredString(formData, "companyName"),
    description: requiredString(formData, "description"),
    standing: requiredString(formData, "standing"),
    beatTopics: requiredString(formData, "beatTopics")
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean)
      .slice(0, 12),
  };
  await saveCompanyProfile(user.id, profile);
  redirect("/app/dashboard?profile=saved");
}

export async function runWorkflowAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const slug = requiredString(formData, "workflowSlug");
  const workflow = getWorkflow(slug);
  if (!workflow?.enabled) {
    throw new Error("This workflow is not enabled in the first web slice.");
  }

  const requestedMode = formData.get("executionMode");
  let input: WorkflowRunInput;
  if (requestedMode === "fixture") {
    input = slug === "angle-generator" ? angleFixture : detectFixture;
  } else {
    const profile = await getCompanyProfile(user.id);
    if (!profile) {
      redirect("/app/profile?required=1");
    }
    input = {
      workflowSlug: slug,
      fields: Object.fromEntries(
        workflow.fields.map((field) => [
          field.name,
          field.required
            ? requiredString(formData, field.name)
            : optionalString(formData, field.name),
        ]),
      ),
      profile,
      now: new Date().toISOString(),
    };
  }

  const jobId = await createJob(user.id, input);
  await markJobRunning(jobId, user.id);
  try {
    const result =
      requestedMode === "fixture"
        ? runFixtureWorkflow(input)
        : await runProviderWorkflow(
            input,
            contractFor(slug),
            skillContracts.ethics,
          );
    await completeJob(
      jobId,
      user.id,
      result.markdown,
      result.mode,
      result.model,
    );
  } catch (error) {
    await failJob(
      jobId,
      user.id,
      error instanceof Error ? error.message : "Workflow execution failed.",
    );
  }
  redirect(`/app/jobs/${jobId}`);
}

function contractFor(slug: string): string {
  if (slug === "relevance-coarse-filter") {
    return skillContracts["relevance-coarse-filter"];
  }
  if (slug === "angle-generator") {
    return skillContracts["angle-generator"];
  }
  throw new Error(`No bundled contract for ${slug}.`);
}

function requiredString(formData: FormData, name: string): string {
  const value = optionalString(formData, name);
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function optionalString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
