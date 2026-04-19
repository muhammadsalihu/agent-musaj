import type {
  BoundaryConditionSpec,
  GeometryKind,
  GeometryPrimitive,
  GeometrySpec,
  MaterialSpec,
  MeshSpec,
  PhysicsDomain,
  SimulationPlan,
  SimulationRequest,
  SolverSpec
} from "@agent-musaj/core";

const SHAPE_KEYWORDS: Array<{ kind: Exclude<GeometryKind, "composite" | "unknown">; keywords: RegExp[] }> = [
  { kind: "beam", keywords: [/\bbeam\b/i, /\bi-beam\b/i] },
  { kind: "pipe", keywords: [/\bpipe\b/i] },
  { kind: "cylinder", keywords: [/\bcylinder\b/i, /\btube\b/i] },
  { kind: "circle", keywords: [/\bcircle\b/i, /\bdisk\b/i] },
  { kind: "rectangle", keywords: [/\brectangle\b/i, /\bsquare\b/i, /\bplate\b/i] },
  { kind: "box", keywords: [/\bbox\b/i, /\bblock\b/i, /\bbrick\b/i] }
];

const PHYSICS_KEYWORDS: Array<{ physics: PhysicsDomain; keywords: RegExp[] }> = [
  { physics: "structural", keywords: [/\bstress\b/i, /\bstrain\b/i, /\bstructural\b/i, /\bdeform/i, /\bforce\b/i, /\bload\b/i] },
  { physics: "thermal", keywords: [/\bheat\b/i, /\bthermal\b/i, /\btemperature\b/i, /\bconduction\b/i] },
  { physics: "fluid", keywords: [/\bfluid\b/i, /\bflow\b/i, /\bpressure\b/i, /\bcfd\b/i, /\binlet\b/i, /\boutlet\b/i] },
  { physics: "electrostatic", keywords: [/\belectro/i, /\bvoltage\b/i, /\bpotential\b/i, /\bfield\b/i] }
];

function cleanPrompt(prompt: string): string {
  return prompt.replace(/\s+/g, " ").trim();
}

function pickPhysics(prompt: string): PhysicsDomain {
  for (const candidate of PHYSICS_KEYWORDS) {
    if (candidate.keywords.some((regex) => regex.test(prompt))) {
      return candidate.physics;
    }
  }

  return "custom";
}

function findShapeKeywords(prompt: string): GeometryPrimitive["kind"][] {
  const kinds: GeometryPrimitive["kind"][] = [];

  for (const candidate of SHAPE_KEYWORDS) {
    if (candidate.keywords.some((regex) => regex.test(prompt))) {
      kinds.push(candidate.kind);
    }
  }

  return kinds;
}

function parseNumbers(prompt: string): number[] {
  return [...prompt.matchAll(/(\d+(?:\.\d+)?)/g)].map(([value]) => Number(value));
}

function inferGeometryKind(prompt: string): GeometryKind {
  const shapes = findShapeKeywords(prompt);

  if (shapes.length === 0) {
    return "unknown";
  }

  if (shapes.length === 1) {
    return shapes[0] ?? "unknown";
  }

  if (/\b(inside|next to|adjacent|attached|composite|assembly|with)\b/i.test(prompt)) {
    return "composite";
  }

  return "unknown";
}

function defaultDimensionFor(kind: GeometryKind, values: number[]): Record<string, number> {
  switch (kind) {
    case "beam":
      return {
        length: values[0] ?? 10,
        webThickness: values[1] ?? 1,
        flangeThickness: values[2] ?? 0.5
      };
    case "pipe":
      return {
        outerRadius: values[0] ?? 2,
        innerRadius: values[1] ?? Math.max((values[0] ?? 2) * 0.7, 0.5),
        height: values[2] ?? 10
      };
    case "cylinder":
      return {
        radius: values[0] ?? 2,
        height: values[1] ?? 10
      };
    case "circle":
      return {
        radius: values[0] ?? 1
      };
    case "rectangle":
      return {
        width: values[0] ?? 10,
        height: values[1] ?? 5
      };
    case "box":
      return {
        length: values[0] ?? 10,
        width: values[1] ?? 5,
        height: values[2] ?? 2
      };
    default:
      return {
        value: values[0] ?? 1
      };
  }
}

function buildPrimitives(kind: GeometryKind, prompt: string, values: number[]): GeometryPrimitive[] {
  if (kind === "unknown") {
    return [];
  }

  if (kind !== "composite") {
    return [
      {
        kind,
        label: kind,
        dimensions: defaultDimensionFor(kind, values)
      }
    ];
  }

  const shapes = findShapeKeywords(prompt);
  const primary = shapes[0] ?? "box";
  const secondary = shapes[1] ?? "circle";

  return [
    {
      kind: primary,
      label: `${primary}-primary`,
      dimensions: defaultDimensionFor(primary, values)
    },
    {
      kind: secondary,
      label: `${secondary}-secondary`,
      dimensions: defaultDimensionFor(secondary, values.slice(1))
    }
  ];
}

function inferDimension(kind: GeometryKind): 2 | 3 {
  return kind === "circle" || kind === "rectangle" ? 2 : 3;
}

function buildGeometrySpec(title: string, prompt: string, kind: GeometryKind, values: number[]): GeometrySpec {
  const primitives = buildPrimitives(kind, prompt, values);
  const allowMultipleBodies = kind === "composite";

  return {
    name: title,
    kind,
    dimension: inferDimension(kind),
    primitives,
    dimensions: primitives[0]?.dimensions ?? {},
    boundaryLabels: ["fixed", "load"],
    allowMultipleBodies,
    notes: kind === "unknown" ? ["The geometry could not be resolved confidently from the prompt."] : []
  };
}

function buildMeshSpec(geometry: GeometrySpec, values: number[]): MeshSpec {
  const largestValue = values.length > 0 ? Math.max(...values) : 10;
  const base = Math.max(largestValue / 10, geometry.dimension === 3 ? 0.5 : 0.25);

  return {
    characteristicLength: Number(base.toFixed(3)),
    refinementLevel: 1,
    order: 1,
    maxElementSize: Number((base * 1.5).toFixed(3)),
    minElementSize: Number((base * 0.5).toFixed(3))
  };
}

function buildMaterials(physics: PhysicsDomain): MaterialSpec[] {
  switch (physics) {
    case "structural":
      return [
        {
          name: "Steel",
          properties: {
            Density: 7850,
            YoungsModulus: 210e9,
            PoissonRatio: 0.3
          }
        }
      ];
    case "thermal":
      return [
        {
          name: "Aluminum",
          properties: {
            Density: 2700,
            HeatConductivity: 237
          }
        }
      ];
    case "fluid":
      return [
        {
          name: "Water",
          properties: {
            Density: 998,
            Viscosity: 0.001
          }
        }
      ];
    case "electrostatic":
    case "custom":
    default:
      return [
        {
          name: "GenericMaterial",
          properties: {
            Density: 1
          }
        }
      ];
  }
}

function buildBoundaryConditions(physics: PhysicsDomain): BoundaryConditionSpec[] {
  switch (physics) {
    case "structural":
      return [
        { name: "Fixed support", type: "fixed", target: "fixed" },
        { name: "Applied load", type: "force", target: "load", value: "1e3" }
      ];
    case "thermal":
      return [
        { name: "Hot side", type: "temperature", target: "hot", value: "350" },
        { name: "Cool side", type: "temperature", target: "cool", value: "300" }
      ];
    case "fluid":
      return [
        { name: "Inlet", type: "velocity", target: "inlet", value: "1.0" },
        { name: "Outlet", type: "pressure", target: "outlet", value: "0" }
      ];
    case "electrostatic":
      return [
        { name: "Positive potential", type: "potential", target: "anode", value: "5" },
        { name: "Ground", type: "potential", target: "cathode", value: "0" }
      ];
    case "custom":
    default:
      return [
        { name: "Default boundary", type: "generic", target: "domain", value: "0" }
      ];
  }
}

function buildSolverSpec(physics: PhysicsDomain): SolverSpec {
  return {
    solver: "elmer",
    physics,
    equations: [physics === "structural" ? "Linear Elasticity" : physics === "thermal" ? "Heat Equation" : physics === "fluid" ? "Navier-Stokes" : "Generic Equation"],
    materials: buildMaterials(physics),
    boundaryConditions: buildBoundaryConditions(physics),
    iterations: 25,
    timestep: physics === "fluid" ? 0.01 : undefined
  };
}

export function parseSimulationRequest(prompt: string): SimulationRequest {
  const normalized = cleanPrompt(prompt);
  const physics = pickPhysics(normalized);
  const geometryKind = inferGeometryKind(normalized);
  const title = normalized.slice(0, 60) || "simulation";
  const confidence = geometryKind === "unknown" ? 0.35 : geometryKind === "composite" ? 0.68 : 0.83;

  return {
    prompt: normalized,
    title,
    physics,
    geometryKind,
    geometryDescription: normalized,
    notes: geometryKind === "unknown" ? ["Geometry requires clarification."] : [],
    confidence
  };
}

export function buildSimulationPlan(prompt: string): SimulationPlan {
  const request = parseSimulationRequest(prompt);
  const values = parseNumbers(request.prompt);
  const geometry = buildGeometrySpec(request.title.replace(/[^\w-]+/g, "-").toLowerCase() || "simulation", request.prompt, request.geometryKind, values);
  const mesh = buildMeshSpec(geometry, values);
  const solver = buildSolverSpec(request.physics);

  return {
    request,
    geometry,
    mesh,
    solver
  };
}
