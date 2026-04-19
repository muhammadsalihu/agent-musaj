# agent-musaj + text2sim Development Plan

**Current Date:** April 19, 2026  
**Paper Deadline:** May 5, 2026 (16 days)  
**Status:** Foundation scaffolding complete, ready for agent implementation

---

## Vision

**agent-musaj**: An agentic AI platform for domain-specific workflows.  
**text2sim**: The first agent — converts natural language descriptions of multiphysics simulations into executable Gmsh (.geo) and Elmer (.sif) files.

---

## Architecture Decision

### Framework Choice: GitHub Copilot SDK
- **Why:** TypeScript/Node.js native, custom tool support, no security debt, focused scope
- **Launch Status:** Public preview as of April 2, 2026
- **Approach:** Standalone agentic app (not Copilot extension)

### Stack
```
agent-musaj/ (monorepo, npm workspaces)
├── packages/
│   ├── core/           # OrchestrationEngine (Copilot SDK wrapper)
│   ├── gmsh-generator/ # Geometry script generation
│   └── elmer-generator/# Physics SIF generation
├── agents/
│   └── text2sim/       # Main agent with tool definitions
├── cli/                # Command-line interface
└── web/                # Future: React UI
```

---

## What's Been Built (Session 1)

### ✅ Foundational Scaffolding
1. **Monorepo structure** with npm workspaces
2. **@agent-musaj/core** — OrchestrationEngine class
   - Wraps Copilot SDK CopilotClient
   - Manages sessions, tool registration, prompt execution
   
3. **@agent-musaj/gmsh-generator** — GmshGenerator class
   - Converts geometry descriptions (2D shapes: rectangle, circle) → Gmsh .geo syntax
   - Mesh configuration support
   - Basic scaffold for polygon and hole operations (Boolean CAD)
   
4. **@agent-musaj/elmer-generator** — ElmerGenerator class
   - Converts physics config (heat transfer, elasticity, thermomechanical) → Elmer SIF syntax
   - Boundary conditions (Dirichlet, Neumann, Robin)
   - Material definitions
   - Timestepping support
   
5. **@agent-musaj/text2sim** — Text2SimAgent class
   - Tool definitions: `generateGmshScript`, `generateElmerSIF`, `validateGeometry`
   - System prompt for Copilot agent
   - Tool handlers (JSON parsing, validation, file generation)

---

## What's NOT Done Yet (Next Steps)

### Phase 1: Core Agent Loop (Days 1-3)
**Objective:** Get Copilot SDK talking to text2sim tools, validate end-to-end flow

- [ ] **Install Copilot SDK dependencies**
  - `npm install @github/copilot-sdk`
  - Verify Node.js 20+ available
  - Check Copilot CLI is installed (required for SDK to work)

- [ ] **Build CLI entry point** (`cli/src/main.ts`)
  - Parse command-line input: `"Simulate a 2D rectangle with heat transfer, 100°C boundary"`
  - Initialize Copilot SDK session
  - Register text2sim tools with OrchestrationEngine
  - Execute prompt against agent
  - Save output to `geometry.geo` and `simulation.sif`

- [ ] **Test with minimal MVP geometry**
  - **Demo case:** 2D rectangle (10 × 10) with circular hole (radius 2)
  - Heat transfer: 100°C left boundary, insulated top/bottom, 20°C right
  - No Boolean operations yet (focus on agent orchestration)

- [ ] **Validate tool calling**
  - Agent should invoke `validateGeometry` → `generateGmshScript` → `generateElmerSIF` in sequence
  - Check that files are generated correctly

### Phase 2: Geometry Refinement (Days 4-6)
**Objective:** Close the Boolean CAD gap (the core research contribution)

- [ ] **Enhance Gmsh generator**
  - Implement `generateHole` properly (Boolean subtraction)
  - Add support for multiple holes in a single geometry
  - Generate valid Gmsh scripts that don't fail on OpenCASCADE operations

- [ ] **Test Boolean operations**
  - Run generated .geo files through actual Gmsh
  - Validate that geometry compiles without errors
  - Debug any geometry generation failures

- [ ] **Add geometry validation tool**
  - Check for overlapping shapes
  - Verify hole parameters fit within parent geometry
  - Catch common Boolean CAD pitfalls early

### Phase 3: Physics Configuration (Days 7-9)
**Objective:** Full Elmer SIF generation, solver configuration

- [ ] **Expand Elmer generator**
  - Add thermomechanical solver configuration
  - Implement proper material property mapping
  - Support multiple boundary conditions per boundary

- [ ] **Solver tuning**
  - Linear/nonlinear convergence settings
  - Timestep configuration for transient problems
  - Output options (result files, logging)

- [ ] **Material library**
  - Pre-defined materials: steel, aluminum, copper
  - Agent should resolve "steel" → density, conductivity, heat capacity, etc.

### Phase 4: Validation & Testing (Days 10-12)
**Objective:** Prove agent generates valid, runnable simulations

- [ ] **Integration testing**
  - Agent → Gmsh script generation → `gmsh geometry.geo -2` (actual mesh generation)
  - Agent → Elmer SIF → `ElmerSolver` execution (if available, or at least syntax validation)

- [ ] **Demo case: 20-tooth gear** (Paper 3 target)
  - Full thermomechanical analysis
  - Multiple materials (shaft vs. gear teeth)
  - Boundary conditions: temperature + stress

- [ ] **Error handling**
  - Agent gracefully handles malformed inputs
  - Suggests corrections when geometry fails Boolean operations
  - Provides clear error messages for physics configuration issues

### Phase 5: Paper & Documentation (Days 13-16)
**Objective:** Write Paper 3, finalize code, prepare submission

- [ ] **Write Paper 3: "An Agentic LLM Framework for Automated Multiphysics Simulation Setup: Closing the Boolean Gap"**
  - Abstract & Introduction: Problem statement (Boolean CAD gap from Papers 1-2)
  - Methodology: Agent architecture, tool design, agentic loop
  - Results: Successful generation of geometry.geo + simulation.sif for 20-tooth gear case
  - Discussion: Why agent reasoning improves Boolean CAD success vs. naive prompt engineering
  - Conclusion & future work

- [ ] **Code cleanup**
  - Add JSDoc comments to all public APIs
  - Create README.md with setup instructions
  - Document tool schemas and expected input/output

- [ ] **Reproducibility**
  - Publish to GitHub (musaj/agent-musaj)
  - Include example prompts and expected outputs
  - Provide step-by-step guide to run text2sim locally

- [ ] **Submit to Results in Engineering** (deadline May 5)

---

## Key Technical Decisions

### LLM Provider
- **Option A:** GitHub Copilot subscription + Copilot SDK (free for subscribers)
- **Option B:** BYOK (Bring Your Own Key) with Azure OpenAI or Claude
- **Current:** Flexible — SDK supports both. Copilot is cheaper for research use.

### Geometry Complexity Scope
- **MVP (Phase 1-2):** 2D shapes (rectangle, circle, holes)
- **Paper case (Phase 4):** 20-tooth gear (2D cross-section, extruded to 3D in Elmer)
- **Out of scope for May 5:** Full 3D gear geometry (too complex for agent reasoning in 16 days)

### Boolean Operations Strategy
- **Phase 1:** Skip Boolean operations entirely; use simple shapes
- **Phase 2:** Implement rectangle with hole (single Boolean subtraction)
- **Phase 3:** Multiple holes and complex subtractions
- **Paper focus:** Demonstrate that agent reasoning (decomposing the problem) is more effective than raw prompt-to-Gmsh

---

## Deliverables for May 5

1. **Code repository** (`agent-musaj/`) on GitHub with:
   - Full monorepo structure
   - text2sim agent fully functional
   - CLI to run simulations from command line
   - README with examples

2. **Paper 3** submitted to Results in Engineering:
   - ~6,000 words
   - Figures: agent architecture diagram, example Gmsh/Elmer output, 20-tooth gear mesh
   - Tables: benchmark results (success rates for various geometries)

3. **Demo case:** 20-tooth gear thermomechanical simulation
   - Input: `"Simulate a 20-tooth steel gear in contact with a shaft. Apply 100°C at the root, analyze stress and temperature."`
   - Output: `geometry.geo` + `simulation.sif` (verified to run without errors)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Copilot SDK bugs/limitations | Fallback: use direct Azure OpenAI API with manual orchestration |
| Boolean CAD still fails | Focus paper on agent reasoning approach, not just success rate |
| Elmer solver not installed | Generate SIF syntax only; validate against official schema |
| 16-day timeline too tight | Skip full 3D gear; use 2D cross-section + clear path to 3D |
| GitHub authentication issues | Use BYOK with Azure OpenAI from day 1 |

---

## Next Session Action Items

### Session 2 Immediate Priorities (Day 1)

1. **Install dependencies & verify Copilot SDK**
   ```bash
   cd agent-musaj
   npm install
   npm run build
   # Verify @github/copilot-sdk is accessible
   ```

2. **Build CLI entry point** (`cli/src/main.ts`)
   - Accept command-line argument: `node cli.js "Simulate a 10x10 rectangle with 100°C heat"`
   - Initialize Copilot session
   - Execute text2sim agent
   - Write output files

3. **Test MVP: Rectangle + Circle with minimal heat transfer**
   - No Boolean operations
   - Single boundary condition
   - Prove tool calling works end-to-end

4. **Debug & iterate**
   - Check Copilot SDK tool invocation format
   - Verify geometry.geo is valid Gmsh syntax
   - Ensure simulation.sif is parseable

---

## File Structure Reference

```
/home/claude/agent-musaj/
├── package.json (root, workspaces config)
├── tsconfig.base.json (shared TS config)
├── .gitignore
├── README.md
├── DEVELOPMENT_PLAN.md (this file)
│
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts (OrchestrationEngine)
│   │
│   ├── gmsh-generator/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts (GmshGenerator)
│   │
│   └── elmer-generator/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/index.ts (ElmerGenerator)
│
├── agents/
│   └── text2sim/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/index.ts (Text2SimAgent tools + system prompt)
│
├── cli/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts (CLI entry point — NOT YET BUILT)
│       └── index.ts (CLI handler — NOT YET BUILT)
│
└── web/
    └── (future React UI — not yet started)
```

---

## Success Criteria

By May 5, 2026:
- ✅ Agent accepts natural language simulation description
- ✅ Generates valid Gmsh .geo file that compiles without Boolean errors
- ✅ Generates valid Elmer .sif file with correct physics configuration
- ✅ Paper submitted with results showing Boolean gap closure through agentic reasoning
- ✅ Demo case (20-tooth gear) runs end-to-end with no manual intervention

---

## Questions for Next Session

1. **LLM provider:** Start with Copilot subscription or BYOK?
2. **Geometry complexity:** Does 2D gear (extruded in Elmer) count as "closing the Boolean gap" for the paper?
3. **Validation:** Should generated files be tested against actual Gmsh/Elmer, or is syntax validation enough?
4. **Agent autonomy:** Should the agent ask the user for clarifications, or assume reasonable defaults?

