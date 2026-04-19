import assert from "node:assert/strict";
import test from "node:test";
import { validateSimulationPlan } from "./index.js";

test("flags empty prompts", () => {
  const report = validateSimulationPlan({
    request: {
      prompt: "",
      title: "",
      physics: "structural",
      geometryKind: "unknown",
      geometryDescription: "",
      notes: [],
      confidence: 0
    },
    geometry: {
      name: "demo",
      kind: "unknown",
      dimension: 3,
      primitives: [],
      dimensions: {},
      boundaryLabels: [],
      allowMultipleBodies: false,
      notes: []
    },
    mesh: {
      characteristicLength: 0,
      refinementLevel: 1,
      order: 1,
      maxElementSize: 0,
      minElementSize: 0
    },
    solver: {
      solver: "elmer",
      physics: "structural",
      equations: [],
      materials: [],
      boundaryConditions: [],
      iterations: 1
    }
  });

  assert.equal(report.valid, false);
  assert.ok(report.issues.length > 0);
});
