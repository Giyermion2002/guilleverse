---
name: enforce-scss-styles
description: Enforces the use of external .scss files for styling. Use this whenever writing or modifying UI components or styles.
---

# Enforce SCSS Styles

This skill ensures that all styling in the project is strictly handled through external SCSS stylesheets, keeping the logic files clean.

## When to use this skill

- Use this when adding CSS/styles to a new component.
- Use this when modifying the visual appearance of an existing component.
- Use this when migrating legacy inline styles or CSS-in-JS to traditional stylesheets.

## How to use it

When dealing with styles, you MUST strictly adhere to the following rules:

1. **No Inline Styles:** NEVER use the `style={{...}}` attribute or inline CSS directly inside `.ts`, `.tsx`, `.html`, or `.jsx` files.
2. **No CSS-in-JS:** Do not use libraries like `styled-components`, `emotion`, or `@emotion/styled`. 
3. **Always use `.scss`:** Every component must have its own dedicated `.scss` (Sass) file located in the same directory as the component (e.g., `MyComponent.scss`).
4. **Importing Styles:** Import the `.scss` file at the top of your logic/template file (e.g., `import './MyComponent.scss';` or using CSS Modules if the project is configured for it: `import styles from './MyComponent.module.scss';`).
5. **Class Names:** Apply styles exclusively through CSS class names assigned to the HTML/JSX elements.