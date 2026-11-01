# Project Guidelines: NOC Team Dashboard (Portfolio Edition)

## Project Overview & Concept
This project is a single-file HTML/CSS/JS operational command center dashboard designed as a GitHub portfolio piece. It showcases deep Vanilla JavaScript expertise, UI/UX execution, modular configuration architecture, and zero-framework performance.

## Core Architectural Rules
1. **Single File Output**: Everything resides in `index.html`. Do not split into separate `.js` or `.css` files unless explicitly requested.
2. **Zero Framework Policy**: Use pure Vanilla JS (ES6+), native DOM APIs, and plain CSS custom properties.
3. **Data-Driven UI**: Do not write static content rows in HTML. All data must render dynamically from the `SITE` JavaScript configuration object at the top of the script.
4. **State Management**: Every user action (checkboxes, active section, themes, scratchpad notes) must persist via `localStorage` using a prefixed key (`SITE.storagePrefix`).
5. **XSS Protection**: All user input or injected string data MUST be rendered through a global `esc()` sanitization function.

## Token Efficiency & Code Generation Rules
To prevent unnecessary token usage, high costs, or reaching context limits:
1. **Modular Refactoring**: When making changes, request or provide edits for specific numbered JS sections (`// --- 1. Section Name ---`) or specific CSS blocks rather than regenerating the entire 1,500+ line `index.html` file on every prompt.
2. **Concise Explanations**: Provide minimal conversational filler. Focus response output directly on code blocks or diffs.
3. **No Placeholders**: Never write dummy functions like `// TODO: implement this`. Ensure every snippet provided is functionally complete.
4. **Incremental Iteration**: Break large additions into structured modular prompts (Phase 1: Shell & Config, Phase 2: Data Tables, Phase 3: Utilities & Games).

## Deployment & GitHub Rules
1. **GitHub Pages Compatibility**: Ensure all relative paths and assets work when hosted directly on GitHub Pages root or sub-paths.
2. **Git Commit Structure**: Use clear commit types: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`.
3. **Documentation**: Maintain a clean `README.md` explaining project features, architecture, and customization instructions for recruiters.