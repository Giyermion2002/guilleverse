---
name: strict-componentization
description: Enforces strict componentization by separating HTML, styles, and logic. Use when creating, refactoring, or reviewing frontend components.
---

# Strict Componentization

This skill ensures that all frontend components are highly modular, maintainable, and adhere to a strict Separation of Concerns (SoC).

## When to use this skill

- Use this when generating a new UI component.
- Use this when refactoring a large, monolithic component into smaller pieces.
- Use this during code reviews to check for architectural cleanliness.

## How to use it

When writing or modifying frontend code, you MUST follow these step-by-step conventions:

1. **Separation of Concerns:** Never mix structural logic, styling, and business logic in a single massive file. Each component must have dedicated files for its specific concerns (e.g., Template/HTML, Styles, and TypeScript/Logic).
2. **Single Responsibility Principle:** A component should do one thing. If a component grows too large or handles multiple UI features, break it down into smaller, reusable sub-components.
3. **Folder Structure:** Always group the files belonging to a single component inside its own dedicated directory named after the component (e.g., `Button/Button.tsx`, `Button/Button.scss`, `Button/Button.test.tsx`).
4. **Clean Interfaces:** Ensure components communicate via clearly defined props/inputs and events/outputs. Avoid deep prop-drilling.