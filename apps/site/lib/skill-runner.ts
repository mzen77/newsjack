export type CompanyProfileInput = {
  companyName: string;
  description: string;
  standing: string;
  beatTopics: string[];
};

export type WorkflowRunInput = {
  workflowSlug: string;
  fields: Record<string, string>;
  profile: CompanyProfileInput;
  now: string;
};

export type WorkflowRunResult = {
  mode: "provider" | "fixture";
  markdown: string;
  model?: string;
};

export const detectFixture: WorkflowRunInput = {
  workflowSlug: "relevance-coarse-filter",
  fields: {
    signalTitle: "Regulator proposes AI audit rules",
    signalEvidence: "The proposal covers vendors selling automated decisions.",
    sourceUrl: "https://example.com/reporting/ai-audit-rules",
  },
  profile: {
    companyName: "ProofLayer",
    description: "AI audit software for regulated companies",
    standing: "Operates audit software used by compliance teams",
    beatTopics: ["AI regulation", "algorithmic audits"],
  },
  now: "2026-08-24T14:54:00.000Z",
};

export const angleFixture: WorkflowRunInput = {
  workflowSlug: "angle-generator",
  fields: {
    companyUpdate:
      "ProofLayer published an audit of 120 automated lending decisions.",
    supportingFacts:
      "The supplied audit covers 120 decisions and documents 18 policy mismatches. Source: https://example.com/prooflayer-audit",
    currentSignal: "",
  },
  profile: detectFixture.profile,
  now: "2026-08-24T14:54:00.000Z",
};

export function buildSkillPrompt(
  input: WorkflowRunInput,
  contract: string,
  ethics: string,
): string {
  return [
    "Execute the canonical Newsjack skill below as a form workflow.",
    "Use only the supplied profile and form evidence. Never invent a fact, citation, person, email address, date, score, or source.",
    `Current time: ${input.now}`,
    "",
    "CANONICAL ETHICAL FLOOR",
    ethics,
    "",
    "CANONICAL SKILL CONTRACT",
    contract,
    "",
    "USER-OWNED COMPANY PROFILE",
    JSON.stringify(input.profile, null, 2),
    "",
    "FORM INPUT",
    JSON.stringify(input.fields, null, 2),
  ].join("\n");
}

export async function runProviderWorkflow(
  input: WorkflowRunInput,
  contract: string,
  ethics: string,
): Promise<WorkflowRunResult> {
  const apiKey = process.env.NEWSJACK_AI_API_KEY;
  const model = process.env.NEWSJACK_AI_MODEL;
  if (!apiKey || !model) {
    throw new Error(
      "AI execution is not configured. Set NEWSJACK_AI_API_KEY and NEWSJACK_AI_MODEL, or run the supplied fixture.",
    );
  }

  const baseUrl = (
    process.env.NEWSJACK_AI_BASE_URL ?? "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: buildSkillPrompt(input, contract, ethics),
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`AI provider returned ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const markdown = payload.choices?.[0]?.message?.content?.trim();
  if (!markdown) {
    throw new Error("AI provider returned no workflow result.");
  }
  return { mode: "provider", markdown, model };
}

export function runFixtureWorkflow(
  input: WorkflowRunInput,
): WorkflowRunResult {
  if (sameFixture(input, detectFixture)) {
    return {
      mode: "fixture",
      markdown: [
        "### Fixture mode — grounded sample",
        "",
        "**Decision:** keep",
        "",
        `**Signal:** ${input.fields.signalTitle}`,
        "",
        "**Reason:** plausible_client_bridge",
        "",
        `The supplied story concerns AI audit rules, which directly overlaps the saved beat topics and ProofLayer's stated standing. Evidence: ${input.fields.sourceUrl}.`,
        "",
        "This is a deterministic offline demonstration, not live news research.",
      ].join("\n"),
    };
  }

  if (sameFixture(input, angleFixture)) {
    return {
      mode: "fixture",
      markdown: [
        "### Fixture mode — grounded sample",
        "",
        "**An audit of 120 lending decisions found 18 policy mismatches**",
        "",
        "- **Story type:** data",
        "- **Why a journalist cares:** A lending-policy or algorithmic-accountability reporter can inspect a supplied, bounded audit rather than a product claim.",
        "- **Why now:** The audit was supplied as a new company update; no external breaking-news peg was provided.",
        "- **Decay:** week — the data can support analysis beyond announcement day.",
        "- **Proof it needs:** The audit methodology and the source document at https://example.com/prooflayer-audit.",
        "- **Facts it rests on:** 120 audited decisions and 18 documented policy mismatches.",
        "",
        "**Refused angles**",
        "- Any market-wide claim — `hallucinated_fact`; the fixture provides no market comparison.",
        "",
        "**Next step:** `fact-check` — verify the methodology and mismatch count before outreach.",
        "",
        "This is a deterministic offline demonstration, not generated analysis.",
      ].join("\n"),
    };
  }

  throw new Error(
    "Fixture mode accepts only the supplied fixture inputs so it cannot invent analysis.",
  );
}

function sameFixture(
  input: WorkflowRunInput,
  fixture: WorkflowRunInput,
): boolean {
  return (
    input.workflowSlug === fixture.workflowSlug &&
    JSON.stringify(input.fields) === JSON.stringify(fixture.fields) &&
    JSON.stringify(input.profile) === JSON.stringify(fixture.profile)
  );
}
