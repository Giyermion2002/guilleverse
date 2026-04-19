---
name: spanish-javadoc-documentation
description: Enforces comprehensive Javadoc/TSDoc style documentation written in Spanish for all code structures. Use whenever writing or modifying code.
---

# Spanish Javadoc/TSDoc Documentation

This skill ensures that the codebase is thoroughly documented using standard Javadoc/TSDoc conventions, with the strict requirement that all documentation text is written in Spanish.

## When to use this skill

- Use this when generating new functions, classes, components, interfaces, or types.
- Use this when refactoring or modifying existing undocumented code.
- Use this when writing complex internal logic that requires explanation.

## How to use it

When documenting code, you MUST adhere strictly to the following rules:

1. **Mandatory Format:** Always use the standard Javadoc/TSDoc block comment format (`/** ... */`) for documenting APIs, functions, classes, and interfaces. 
2. **Strictly Spanish:** All descriptive text, explanations, and summaries inside the documentation blocks MUST be written in Spanish.
3. **Required Tags:** You must include the following tags when applicable:
    - `@param` - Explain what the parameter is (e.g., `@param {string} nombre - El nombre del usuario`).
    - `@returns` or `@return` - Explain what the function outputs.
    - `@throws` - Explain any errors or exceptions the code might throw.
    - `@example` - (Optional but recommended) Provide a short usage example for complex utilities.
4. **Content over Obviousness:** Describe *what* the code does and *why* it exists. Do not just repeat the function signature in words.
5. **Inline Comments:** For complex logic inside a function, use standard single-line comments (`//`) to explain the "why". These must also be in Spanish.

## Example Output

```typescript
/**
 * Calcula el precio total de un carrito de compras aplicando los impuestos correspondientes.
 * * @param {number} subtotal - El importe total de los productos antes de impuestos.
 * @param {number} porcentajeImpuesto - El porcentaje de impuesto a aplicar (ej. 21 para 21%).
 * @returns {number} El precio final con los impuestos incluidos.
 * @throws {Error} Si el subtotal o el porcentaje son números negativos.
 */