import type { GeneratedArtifact, SimulationPlan, ValidationReport } from "@agent-musaj/core";
import { generateElmerArtifacts } from "@agent-musaj/elmer-generator";
import { generateGmshArtifacts } from "@agent-musaj/gmsh-generator";
import { validateSimulationPlan } from "@agent-musaj/simulation-validator";
import { buildSimulationPlan } from "./prompt.js";

export interface Text2SimRunResult {
  plan: SimulationPlan;
  validation: ValidationReport;
  artifacts: GeneratedArtifact[];
  commands: string[];
  status: "ready" | "needs-clarification";
}

function buildManifest(plan: SimulationPlan, validation: ValidationReport): GeneratedArtifact {
  return {
    kind: "manifest",
    fileName: `${plan.geometry.name}.text2sim.manifest.json`,
    content: JSON.stringify(
      {
        request: plan.request,
        geometry: plan.geometry,
        mesh: plan.mesh,
        solver: plan.solver,
        validation
      },
      null,
      2
    ),
    description: "Overall text2sim planning manifest"
  };
}

export function runText2Sim(prompt: string): Text2SimRunResult {
  const plan = buildSimulationPlan(prompt);
  const validation = validateSimulationPlan(plan);

  if (!validation.valid) {
    return {
      plan,
      validation,
      artifacts: [buildManifest(plan, validation)],
      commands: [],
      status: "needs-clarification"
    };
  }

  const gmsh = generateGmshArtifacts(plan.geometry, plan.mesh);
  const elmer = generateElmerArtifacts(plan.solver);
  const manifest = buildManifest(plan, validation);

  return {
    plan,
    validation,
    artifacts: [...gmsh.artifacts, ...elmer.artifacts, manifest],
    commands: [gmsh.command, ...elmer.command],
    status: "ready"
  };
}
