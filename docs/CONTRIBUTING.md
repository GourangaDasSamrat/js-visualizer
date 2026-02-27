# Contributing to JS Visualizer

First off — thank you for taking the time to contribute! Every bug report, feature suggestion, documentation fix, and pull request makes this project better for developers everywhere.

This guide covers everything you need to get from zero to a merged pull request.

**Live:** [js-visualizer.gouranga.qzz.io](https://js-visualizer.gouranga.qzz.io)
**Repository:** [github.com/GourangDasSamrat/js-visualizer](https://github.com/GourangDasSamrat/js-visualizer)
**Maintainer:** [gouranga.samrat@gmail.com](mailto:gouranga.samrat@gmail.com)

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Adding a New Visualization Panel](#adding-a-new-visualization-panel)
- [Improving the Execution Engine](#improving-the-execution-engine)
- [Issue Labels](#issue-labels)
- [Recognition](#recognition)

---

## Code of Conduct

By participating in this project you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Ways to Contribute

You do not need to write code to contribute meaningfully. Here are the main avenues:

| Type | How |
|------|-----|
| 🐛 Bug report | Open a [GitHub Issue](https://github.com/GourangDasSamrat/js-visualizer/issues) with the `bug` label |
| 💡 Feature request | Open an issue with the `enhancement` label |
| 📖 Documentation | Fix typos, clarify explanations, improve code comments |
| 🎨 UI/UX improvements | Better animations, layout tweaks, accessibility improvements |
| ⚙️ Engine improvements | More accurate simulation, support for new JS patterns |
| 🌐 Translation | Help translate the UI into other languages |
| 🔒 Security | See [SECURITY.md](./SECURITY.md) for the responsible disclosure process |

---

## Development Setup

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 20.x LTS |
| pnpm | 10.x |
| Git | 2.40+ |
| A modern browser | Chrome 120+ / Firefox 121+ / Edge 120+ |

### Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/js-visualizer.git
cd js-visualizer

# 2. Add the upstream remote
git remote add upstream https://github.com/GourangDasSamrat/js-visualizer.git

# 3. Install dependencies
pnpm install

# 4. Start the development server
pnpm run dev
# → http://localhost:5173

# 5. Verify the build passes
pnpm run build

# 6. Check types
pnpm tsc --noEmit
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `pnpm run dev` | Start Vite dev server with HMR |
| `pnpm run build` | Production build to `dist/` |
| `pnpm run preview` | Serve the production build locally |
| `pnpm tsc --noEmit` | TypeScript type-check with no output |

---

## Project Structure

```
src/
├── components/
│   ├── Editor/          # CodeMirror editor + theme switcher
│   ├── Visualizer/      # Individual runtime panels (CallStack, Queues, etc.)
│   ├── Controls/        # Run / Next / Prev / progress bar
│   └── Layout/          # Full-screen grid, mobile gate
├── engine/              # JS runtime simulation — the core logic
├── store/               # Zustand global state
├── types/               # TypeScript interfaces shared across layers
└── styles/              # globals.css (Tailwind import + scrollbars)
```

For a complete architectural walkthrough see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Branching Strategy

```
main                    ← production, always deployable
├── feat/short-name     ← new features
├── fix/short-name      ← bug fixes
├── docs/short-name     ← documentation only
├── refactor/short-name ← refactors with no behaviour change
└── chore/short-name    ← tooling, deps, CI
```

Always branch from the latest `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feat/your-feature-name
```

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(optional scope): <short summary in present tense>

[optional body]

[optional footer: Closes #123]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructure with no behaviour change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build process, tooling, dependency updates |
| `ci` | CI/CD configuration changes |

**Examples:**

```bash
feat(engine): support for Promise.allSettled simulation
fix(callstack): prevent duplicate frame IDs on fast step navigation
docs(architecture): add WASM boundary section to mermaid diagram
chore(deps): upgrade gsap to 3.12.5
```

---

## Pull Request Process

1. **Sync with upstream** before pushing:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Keep PRs focused.** One concern per PR. A PR that fixes a bug and adds a feature will be asked to split.

3. **Fill in the PR template** completely — description, motivation, screenshots for UI changes, and steps to test.

4. **Ensure the build passes:**
   ```bash
   pnpm run build
   pnpm tsc --noEmit
   ```

5. **Self-review your diff** before requesting review. Remove debug logs, commented-out code, and unrelated changes.

6. **Request review** from `@GourangDasSamrat` or leave it open — the maintainer triages open PRs weekly.

7. **Address review comments** with new commits (do not force-push during review). Once approved, the maintainer will squash-merge.

### PR Checklist

```
- [ ] Branched from latest main
- [ ] Commit messages follow Conventional Commits
- [ ] `pnpm run build` passes with zero errors
- [ ] `pnpm tsc --noEmit` passes with zero errors
- [ ] No inline CSS added (Tailwind classes only)
- [ ] No eval() or dynamic code execution introduced in the engine
- [ ] New components have proper TypeScript types (no `any`)
- [ ] GSAP animations use refs, not class selectors
- [ ] Screenshots or screen recording attached (for UI changes)
```

---

## Coding Standards

### TypeScript

- **Strict mode is on.** `any` is not allowed. Use `unknown` and narrow it.
- Export types and interfaces from `src/types/execution.ts` — do not declare them inline in components.
- Prefer `interface` over `type` for object shapes.
- All component props must have an explicit interface.

### React

- Functional components only — no class components.
- Use `useCallback` for stable event handler references passed to child components.
- Keep components small and single-purpose. If a component exceeds ~150 lines, consider splitting.
- Avoid `useEffect` for derived state — compute it inline or use Zustand selectors.

### Styling

- **Tailwind CSS utility classes only.** No inline `style={{}}` props.
- If a style truly cannot be expressed in Tailwind, add it to `src/styles/globals.css` with a comment explaining why.
- Dark theme is the only supported theme — do not add `light:` variants without a feature discussion first.

### Animations

- All GSAP targets must be captured via `useRef` — never use class or ID selectors.
- Diff previous vs current entries in `useEffect` and animate only changed elements.
- Prefer `gsap.fromTo` over `gsap.to` for entrance animations so the start state is explicit.
- Clean up GSAP timelines on component unmount: `return () => tl.kill()`.

---

## Testing

The project currently relies on TypeScript's type system and manual browser testing. Automated tests are a welcome contribution.

If you add tests, place them in `src/__tests__/` and follow the naming convention `ComponentName.test.tsx` or `engineName.test.ts`.

To run a type-check as a smoke test:

```bash
pnpm tsc --noEmit
pnpm run build
```

---

## Adding a New Visualization Panel

1. Create `src/components/Visualizer/YourPanel.tsx`.
2. Define the props interface using types from `src/types/execution.ts` — or add new types there.
3. Add the relevant data to `ExecutionStep` in `src/types/execution.ts`.
4. Update `ExecutionEngine.ts` to populate the new field in each snapshot.
5. Update `executionStore.ts` if new state is needed.
6. Mount the panel inside `src/components/Layout/AppLayout.tsx`.
7. Add GSAP entrance/exit animations using the `useRef` + `useEffect` diff pattern.
8. Update [ARCHITECTURE.md](./ARCHITECTURE.md) — component tree and folder structure sections.

---

## Improving the Execution Engine

The engine (`src/engine/ExecutionEngine.ts`) currently uses line-by-line pattern matching. Improvements are very welcome.

**Principles to preserve:**

- The public interface `analyze(code: string): ExecutionStep[]` must not change signature.
- Output must be deterministic — same input always produces same steps.
- `eval()` and `new Function()` must never be used — this is a security requirement.
- Each step must be a complete, immutable snapshot (no shared mutable references).

**Good areas for improvement:**

- Detecting `for...of`, `for...in`, array methods with callbacks
- Accurate generator function simulation
- Better `async/await` chain tracing
- Structured clone of snapshot data to prevent reference sharing bugs

---

## Issue Labels

| Label | Meaning |
|-------|---------|
| `bug` | Something is broken |
| `enhancement` | New feature or improvement |
| `good first issue` | Suitable for first-time contributors |
| `help wanted` | Maintainer is actively seeking contribution |
| `documentation` | Docs-only change |
| `wontfix` | Intentionally out of scope |
| `duplicate` | Already tracked elsewhere |
| `engine` | Related to the execution simulation core |
| `animation` | Related to GSAP animations |
| `ui` | Visual / layout change |

---

## Recognition

All contributors are listed in the GitHub contributors graph. Significant contributions may be highlighted in the project README.

Thank you again for helping make JS Visualizer better. 🙌
