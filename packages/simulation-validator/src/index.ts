import type { SimulationPlan, ValidationIssue, ValidationReport } from "@agent-musaj/core";

function createIssue(code: string, message: string, severity: "error" | "warning" = "error", path?: string): ValidationIssue {
  return { code, message, severity, path };
}

export function validateSimulationPlan(plan: SimulationPlan): ValidationReport {
  const issues: ValidationIssue[] = [];

  if (!plan.request.prompt.trim()) {
    issues.push(createIssue("request.prompt.empty", "A prompt is required to build the simulation plan.", "error", "request.prompt"));
  }

  if (plan.geometry.kind === "unknown") {
    issues.push(createIssue("geometry.unknown", "The prompt did not resolve to a known geometry kind.", "error", "geometry.kind"));
  }

  if (plan.geometry.primitives.length > 1 && !plan.geometry.allowMultipleBodies) {
    issues.push(createIssue("geometry.multiple-bodies", "Multiple geometry bodies were inferred, but the MVP only supports a single body or an explicitly composite shape.", "error", "geometry.primitives"));
  }

  if (plan.mesh.characteristicLength <= 0) {
    issues.push(createIssue("mesh.invalid-length", "Mesh characteristic length must be greater than zero.", "error", "mesh.characteristicLength"));
  }

  if (plan.mesh.minElementSize <= 0 || plan.mesh.maxElementSize <= 0) {
    issues.push(createIssue("mesh.invalid-bounds", "Mesh element sizes must be positive.", "error", "mesh"));
  }

  if (plan.mesh.minElementSize > plan.mesh.maxElementSize) {
    issues.push(createIssue("mesh.bounds-order", "Minimum mesh size cannot exceed maximum mesh size.", "error", "mesh"));
  }

  if (plan.solver.physics === "custom") {
    issues.push(createIssue("solver.physics.custom", "Custom physics are accepted only as a placeholder in the v1 scaffold.", "warning", "solver.physics"));
  }

  if (plan.solver.materials.length === 0) {
    issues.push(createIssue("solver.materials.empty", "At least one material definition is required.", "error", "solver.materials"));
  }

  if (plan.solver.boundaryConditions.length === 0) {
    issues.push(createIssue("solver.boundary-conditions.empty", "At least one boundary condition is required.", "warning", "solver.boundaryConditions"));
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
    summary: issues.length === 0 ? "Plan is valid." : `${issues.length} issue(s) found.`
  };
}
