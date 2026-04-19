export type PhysicsDomain = "structural" | "thermal" | "fluid" | "electrostatic" | "custom";

export type GeometryKind =
  | "box"
  | "rectangle"
  | "circle"
  | "cylinder"
  | "pipe"
  | "beam"
  | "composite"
  | "unknown";

export interface SimulationRequest {
  prompt: string;
  title: string;
  physics: PhysicsDomain;
  geometryKind: GeometryKind;
  geometryDescription: string;
  notes: string[];
  confidence: number;
}

export interface GeometryPrimitive {
  kind: Exclude<GeometryKind, "composite" | "unknown">;
  label: string;
  dimensions: Record<string, number>;
}

export interface GeometrySpec {
  name: string;
  kind: GeometryKind;
  dimension: 2 | 3;
  primitives: GeometryPrimitive[];
  dimensions: Record<string, number>;
  boundaryLabels: string[];
  allowMultipleBodies: boolean;
  notes: string[];
}

export interface MeshSpec {
  characteristicLength: number;
  refinementLevel: number;
  order: 1 | 2;
  maxElementSize: number;
  minElementSize: number;
}

export interface BoundaryConditionSpec {
  name: string;
  type: string;
  target: string;
  value?: string;
}

export interface MaterialSpec {
  name: string;
  properties: Record<string, string | number>;
}

export interface SolverSpec {
  solver: "elmer";
  physics: PhysicsDomain;
  equations: string[];
  materials: MaterialSpec[];
  boundaryConditions: BoundaryConditionSpec[];
  iterations: number;
  timestep?: number;
}

export interface SimulationPlan {
  request: SimulationRequest;
  geometry: GeometrySpec;
  mesh: MeshSpec;
  solver: SolverSpec;
}

export type ArtifactKind = "gmsh-geo" | "gmsh-script" | "elmer-sif" | "manifest" | "report" | "json";

export interface GeneratedArtifact {
  kind: ArtifactKind;
  fileName: string;
  content: string;
  description: string;
}

export interface ValidationIssue {
  code: string;
  message: string;
  severity: "error" | "warning";
  path?: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  summary: string;
}
