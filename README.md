# Fragmint

Fragmint is a lightweight, **zero-dependency** library for parsing HTML templates from various frontend frameworks and libraries. It provides a unified interface to extract and analyze attributes and tag usage across various template syntaxes.

## Purpose

The main purpose of Fragmint is to provide a simple and extensible way to work with HTML-like templates in a framework-agnostic manner. It allows you to extract attributes, and their values, from your component templates, regardless of whether you're using Angular, React, Vue, Svelte, or Lit.

## Why

Because I want to check the usage of web component libraries, their  across various code bases

## Usage

To use Fragmint, you need to select a parsing strategy explicitly. This is useful when you know the framework in advance or want to enforce a specific parsing behavior.

```typescript
import { angular, parse } from 'fragmint';

const source = '<div class="foo" [bar]="baz"></div>';
const ast = parse(source, angular);

console.log(ast);
```

## API

### `parse(source: string, plugin: ParserPlugin): ASTNode[][]`

Parses the source code using the specified plugin.

-   `source`: The source code to parse.
-   `plugin`: The parsing plugin to use. By default, it uses the `html` plugin.
-   **Returns**: An array of arrays of `ASTNode` objects. Each inner array represents a parsed template.

### `ParserPlugin`

A `ParserPlugin` is an object that defines how to parse a specific template syntax. Fragmint exports the following built-in strategies:

-   `angular`
-   `html`
-   `jsx`
-   `lit`
-   `svelte`
-   `vue`

Each strategy has the following properties:

-   `name`: The name of the strategy (e.g., 'vue', 'angular').
-   `extractTemplates`: A function that extracts one or more templates from the source code.
-   `extractAttributes`: A function that extracts attributes from a template.

### `ASTNode`

Represents a node in the Abstract Syntax Tree (AST) of a template. It can be an `ElementNode` or a `TextNode`.

```typescript
export type ASTNode = ElementNode | TextNode
```

**`ElementNode`**
```typescript
export interface ElementNode {
  /** The type of the node */
  type: 'Element'
  /** The tag name for 'Element' nodes (e.g., 'div', 'my-component', 'SomeElement'). */
  tag: string;
  /** An array of attributes for 'Element' nodes. */
  attributes: ASTAttribute[];
  /** An array of child nodes. */
  children: ASTNode[];
  /** The start and end offsets of the node in the source code. */
  loc: { start: number; end: number };
  /** The original source string for the node. */
  raw: string;
}
```

**`TextNode`**
```typescript
export interface TextNode {
  /** The type of the node */
  type: 'Text';
  /** The start and end offsets of the node in the source code. */
  loc: { start: number; end: number };
  /** The original source string for the node. */
  raw: string;
}
```

**`ASTAttribute`**

```typescript
export interface ASTAttribute {
  /** The raw name of the attribute as it appears in the template. */
  name: string;
  /** The raw value of the attribute, including quotes or braces. Null for boolean attributes. */
  value: string | null;
  /** A flag indicating if the attribute's value is defined staticly or computed (e.g., a variable or expression). */
  computed?: boolean;
  /** The original source string for the entire attribute (e.g., 'attr="value"'). */
  raw: string;
  /** The start and end offsets of the attribute in the source code. */
  loc: { start: number; end: number };
}
```
