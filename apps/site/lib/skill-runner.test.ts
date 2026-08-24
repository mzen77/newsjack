import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSkillPrompt,
  runFixtureWorkflow,
  type WorkflowRunInput,
} from "./skill-runner.ts";

const input: WorkflowRunInput = {
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

test("runner prompt contains the canonical contract and grounded inputs", () => {
  const prompt = buildSkillPrompt(
    input,
    "# Relevance Coarse Filter\nReturn one evidence-bound decision.",
    "# ETHICS\nDo not invent facts.",
  );

  assert.match(prompt, /# Relevance Coarse Filter/);
  assert.match(prompt, /Do not invent facts/);
  assert.match(prompt, /2026-08-24T14:54:00.000Z/);
  assert.match(prompt, /https:\/\/example\.com\/reporting\/ai-audit-rules/);
});

test("offline fixture returns a labeled, grounded detect result", () => {
  const result = runFixtureWorkflow(input);

  assert.equal(result.mode, "fixture");
  assert.match(result.markdown, /Fixture mode/);
  assert.match(result.markdown, /Regulator proposes AI audit rules/);
  assert.match(result.markdown, /example\.com\/reporting\/ai-audit-rules/);
});

test("fixture mode refuses unsupported arbitrary generation", () => {
  assert.throws(
    () =>
      runFixtureWorkflow({
        ...input,
        fields: { ...input.fields, signalTitle: "Different story" },
      }),
    /fixture inputs/i,
  );
});
