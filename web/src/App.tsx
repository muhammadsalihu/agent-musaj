import { useMemo, useState } from "react";
import { runText2Sim } from "@agent-musaj/text2sim";

const DEFAULT_PROMPT = "Create a steel beam under a transverse load";

export default function App() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [submittedPrompt, setSubmittedPrompt] = useState(DEFAULT_PROMPT);

  const result = useMemo(() => runText2Sim(submittedPrompt), [submittedPrompt]);

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">agent-musaj</div>
        <h1>Text to Gmsh to Elmer</h1>
        <p>
          A thin demo shell over the text2sim pipeline. Enter a simulation request, generate a plan, and inspect the
          artifacts that would be written by the CLI.
        </p>
      </section>

      <section className="panel">
        <label className="label" htmlFor="prompt">
          Simulation prompt
        </label>
        <textarea
          id="prompt"
          className="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={6}
        />
        <button className="button" type="button" onClick={() => setSubmittedPrompt(prompt)}>
          Run text2sim
        </button>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Plan</h2>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{result.status}</dd>
            </div>
            <div>
              <dt>Physics</dt>
              <dd>{result.plan.request.physics}</dd>
            </div>
            <div>
              <dt>Geometry</dt>
              <dd>{result.plan.geometry.kind}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{result.plan.request.confidence.toFixed(2)}</dd>
            </div>
          </dl>
        </article>

        <article className="card">
          <h2>Validation</h2>
          <p>{result.validation.summary}</p>
          <ul>
            {result.validation.issues.map((issue) => (
              <li key={issue.code}>
                <strong>{issue.severity}</strong> {issue.message}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <h2>Artifacts</h2>
        <ul>
          {result.artifacts.map((artifact) => (
            <li key={artifact.fileName}>
              <strong>{artifact.fileName}</strong> - {artifact.description}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
