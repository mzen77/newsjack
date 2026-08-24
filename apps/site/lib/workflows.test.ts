import assert from "node:assert/strict";
import test from "node:test";

import { getWorkflow, workflowCatalog } from "./workflows.ts";

test("first SaaS slice exposes one detect and one act workflow", () => {
  assert.equal(getWorkflow("relevance-coarse-filter")?.lane, "detect");
  assert.equal(getWorkflow("angle-generator")?.lane, "act");
});

test("every enabled workflow points at its canonical skill contract", () => {
  for (const workflow of workflowCatalog.filter(({ enabled }) => enabled)) {
    assert.match(workflow.contractPath, /^skills\/[^/]+\/SKILL\.md$/);
    assert.ok(workflow.fields.length > 0);
  }
});

test("press clip is visibly stubbed rather than silently attempted", () => {
  const workflow = getWorkflow("press-clip");

  assert.equal(workflow?.enabled, false);
  assert.match(workflow?.unavailableReason ?? "", /worker browser, coming next/i);
});
