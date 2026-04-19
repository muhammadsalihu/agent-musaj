import assert from "node:assert/strict";
import test from "node:test";
import { generateElmerArtifacts } from "./index.js";

test("generates a sif file", () => {
  const result = generateElmerArtifacts({
    solver: "elmer",
    physics: "structural",
    equations: ["Linear Elasticity"],
    materials: [
      {
        name: "Steel",
        properties: {
          Density: 7850,
          YoungsModulus: 210e9,
          PoissonRatio: 0.3
        }
      }
    ],
    boundaryConditions: [
      {
        name: "Fixed support",
        type: "fixed",
        target: "fixed"
      }
    ],
    iterations: 10
  });

  const sif = result.artifacts.find((artifact) => artifact.kind === "elmer-sif");

  assert.ok(sif);
  assert.match(sif?.content ?? "", /Header/);
  assert.match(sif?.content ?? "", /Body 1/);
});
