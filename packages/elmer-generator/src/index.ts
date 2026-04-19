import type { BoundaryConditionSpec, GeneratedArtifact, SolverSpec } from "@agent-musaj/core";

export interface ElmerGenerationResult {
  artifacts: GeneratedArtifact[];
  command: string[];
}

function renderBoundaryCondition(bc: BoundaryConditionSpec, index: number): string {
  const lines = [
    `Boundary Condition ${index + 1}`,
    `  Name = "${bc.name}"`,
    `  Target = "${bc.target}"`,
    `  Type = "${bc.type}"`
  ];

  if (bc.value !== undefined) {
    lines.push(`  Value = ${bc.value}`);
  }

  lines.push("End");
  return lines.join("\n");
}

function buildSifContent(solver: SolverSpec): string {
  const lines: string[] = [
    "Header",
    "  CHECK KEYWORDS Warn",
    "  Mesh DB \".\" \"model\"",
    "End",
    "",
    "Simulation",
    "  Coordinate System = Cartesian 3",
    `  Max Output Level = ${Math.max(1, Math.min(10, solver.iterations))}`,
    "End",
    "",
    "Constants",
    "  Gravity = 0 0 -9.81",
    "End",
    ""
  ];

  solver.materials.forEach((material, index) => {
    lines.push(`Material ${index + 1}`);
    lines.push(`  Name = "${material.name}"`);
    Object.entries(material.properties).forEach(([key, value]) => {
      lines.push(`  ${key} = ${value}`);
    });
    lines.push("End", "");
  });

  lines.push("Equation 1");
  lines.push(`  Name = "${solver.physics} Equation"`);
  lines.push(`  Active Solvers(1) = 1`);
  lines.push("End", "");

  lines.push("Solver 1");
  lines.push(`  Equation = "${solver.physics}"`);
  lines.push("  Procedure = \"ElmerSolver\" \"ElmerSolver\"");
  lines.push("End", "");

  solver.boundaryConditions.forEach((boundaryCondition, index) => {
    lines.push(renderBoundaryCondition(boundaryCondition, index));
    lines.push("");
  });

  lines.push("Body 1");
  lines.push("  Target Bodies = 1");
  lines.push("  Name = \"MainBody\"");
  lines.push("  Equation = 1");
  lines.push("  Material = 1");
  lines.push("End");

  return lines.join("\n") + "\n";
}

export function generateElmerArtifacts(solver: SolverSpec): ElmerGenerationResult {
  const sifContent = buildSifContent(solver);
  const artifacts: GeneratedArtifact[] = [
    {
      kind: "elmer-sif",
      fileName: "simulation.sif",
      content: sifContent,
      description: "Elmer solver input file"
    },
    {
      kind: "manifest",
      fileName: "simulation.elmer.manifest.json",
      content: JSON.stringify(
        {
          solver,
          commands: [
            "ElmerGrid 14 2 model.msh -autoclean",
            "ElmerSolver simulation.sif"
          ]
        },
        null,
        2
      ),
      description: "Machine-readable summary of the Elmer generation step"
    }
  ];

  return {
    artifacts,
    command: ["ElmerGrid 14 2 model.msh -autoclean", "ElmerSolver simulation.sif"]
  };
}
