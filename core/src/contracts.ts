import type { GeneratedArtifact } from "./types.js";

export interface ToolDefinition<TArgs, TResult> {
  name: string;
  description: string;
  invoke: (args: TArgs) => Promise<TResult> | TResult;
}

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition<unknown, unknown>>();

  register<TArgs, TResult>(tool: ToolDefinition<TArgs, TResult>): void {
    this.tools.set(tool.name, tool as ToolDefinition<unknown, unknown>);
  }

  get(name: string): ToolDefinition<unknown, unknown> | undefined {
    return this.tools.get(name);
  }

  list(): string[] {
    return [...this.tools.keys()].sort();
  }
}

export interface ArtifactSink {
  write(artifacts: GeneratedArtifact[], destination: string): Promise<void>;
}

export interface SimulationExecutor {
  execute(artifacts: GeneratedArtifact[], destination: string): Promise<ExecutionResult>;
}

export interface ExecutionResult {
  success: boolean;
  commands: string[];
  log: string[];
}
