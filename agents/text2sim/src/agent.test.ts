import assert from "node:assert/strict";
import test from "node:test";
import { runText2Sim } from "./agent.js";

test("builds a structural plan", () => {
  const result = runText2Sim("Create a steel beam under a transverse load");

  assert.equal(result.status, "ready");
  assert.ok(result.artifacts.length >= 4);
  assert.match(result.artifacts.map((artifact) => artifact.fileName).join(","), /simulation\.sif/);
});

test("flags ambiguous geometry", () => {
  const result = runText2Sim("Create a square and a circle in one prompt");

  assert.equal(result.status, "needs-clarification");
  assert.equal(result.validation.valid, false);
});
