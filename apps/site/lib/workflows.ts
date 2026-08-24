export type WorkflowLane = "detect" | "act" | "strategize" | "ai-visibility";

export type WorkflowField = {
  name: string;
  label: string;
  kind: "text" | "url" | "textarea";
  help?: string;
  required?: boolean;
};

export type WorkflowDefinition = {
  slug: string;
  name: string;
  lane: WorkflowLane;
  summary: string;
  contractPath: string;
  enabled: boolean;
  fields: WorkflowField[];
  unavailableReason?: string;
};

const comingNext =
  "The web runner for this contract is coming in the next slice.";

export const workflowCatalog: WorkflowDefinition[] = [
  {
    slug: "relevance-coarse-filter",
    name: "Relevance coarse filter",
    lane: "detect",
    summary: "Keep, monitor, or reject one evidence-backed news signal.",
    contractPath: "skills/relevance-coarse-filter/SKILL.md",
    enabled: true,
    fields: [
      { name: "signalTitle", label: "Signal title", kind: "text", required: true },
      {
        name: "signalEvidence",
        label: "Excerpt or evidence",
        kind: "textarea",
        required: true,
      },
      { name: "sourceUrl", label: "Source URL", kind: "url", required: true },
    ],
  },
  {
    slug: "angle-generator",
    name: "Angle generator",
    lane: "act",
    summary: "Find distinct, journalist-shaped angles in supplied facts.",
    contractPath: "skills/angle-generator/SKILL.md",
    enabled: true,
    fields: [
      {
        name: "companyUpdate",
        label: "Company update",
        kind: "textarea",
        required: true,
      },
      {
        name: "supportingFacts",
        label: "Verified supporting facts",
        kind: "textarea",
        required: true,
        help: "Include only facts you can stand behind. Add source URLs where available.",
      },
      {
        name: "currentSignal",
        label: "Current news signal (optional)",
        kind: "textarea",
      },
    ],
  },
  ...stubbed("detect", [
    "news-search",
    "story-origin-check",
    "newsjack-triage",
    "newsjack-detector",
  ]),
  ...stubbed("act", [
    "headline-generator",
    "meanest-editor",
    "crisis-holding",
    "reactive-comment",
    "fact-check",
    "journalist-fit-check",
    "same-outlet-ranker",
    "find-journalists",
  ]),
  ...stubbed("strategize", [
    "pr-strategist",
    "newsworthiness-check",
    "pr-calendar",
  ]),
  ...stubbed("ai-visibility", [
    "ai-visibility-writing",
    "build-ai-visibility-panel",
    "icp-evidence-analysis",
    "buyer-job-intent-analysis",
    "prompt-proximity-architecture",
    "realistic-prompt-generation",
    "prompt-set-qa",
    "ai-visibility-panel-design",
  ]),
  {
    slug: "press-clip",
    name: "Press clip",
    lane: "act",
    summary: "Create a branded clip from a live article.",
    contractPath: "skills/press-clip/SKILL.md",
    enabled: false,
    fields: [],
    unavailableReason: "Needs worker browser, coming next.",
  },
];

export function getWorkflow(slug: string): WorkflowDefinition | undefined {
  return workflowCatalog.find((workflow) => workflow.slug === slug);
}

function stubbed(
  lane: WorkflowLane,
  slugs: string[],
): WorkflowDefinition[] {
  return slugs.map((slug) => ({
    slug,
    name: titleCase(slug),
    lane,
    summary: "Canonical skill contract queued for the web runner.",
    contractPath: `skills/${slug}/SKILL.md`,
    enabled: false,
    fields: [],
    unavailableReason: comingNext,
  }));
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => `${word[0]?.toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
