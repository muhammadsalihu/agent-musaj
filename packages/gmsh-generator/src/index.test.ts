import assert from "node:assert/strict";
import test from "node:test";
import { generateGmshArtifacts } from "./index.js";

test("generates a gmsh geometry script", () => {
  const result = generateGmshArtifacts(
    {
      name: "beam",
      kind: "beam",
      dimension: 3,
      primitives: [
        {
          kind: "beam",
          label: "beam body",
          dimensions: { length: 12, webThickness: 1, flangeThickness: 0.5 }
        }
      ],
      dimensions: { length: 12 },
      boundaryLabels: ["fixed", "load"],
      allowMultipleBodies: false,
      notes: []
    },
    {
      characteristicLength: 0.5,
      refinementLevel: 1,
      order: 1,
      maxElementSize: 1,
      minElementSize: 0.25
    }
  );

  const geo = result.artifacts.find((artifact) => artifact.kind === "gmsh-geo");

  assert.ok(geo);
  assert.match(geo?.content ?? "", /SetFactory\("OpenCASCADE"\)/);
  assert.match(geo?.content ?? "", /Box\(1\)/);
});
