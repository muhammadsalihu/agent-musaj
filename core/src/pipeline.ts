export interface PipelineStep<TInput, TOutput> {
  name: string;
  run: (input: TInput) => Promise<TOutput> | TOutput;
}

export async function runPipeline<TInput>(input: TInput, steps: Array<PipelineStep<any, any>>) {
  let current: unknown = input;
  const traces: Array<{ step: string; output: unknown }> = [];

  for (const step of steps) {
    current = await step.run(current);
    traces.push({ step: step.name, output: current });
  }

  return {
    output: current,
    traces,
  };
}
