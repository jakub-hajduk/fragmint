import { html } from '../plugins/html/html';
import type { ASTNode } from '../types';
import { isVoidElement } from './is-void';
import { readChildren } from './read-children';

export function parseTemplate(
  input: string,
  strategy = html,
  baseOffset = 0,
): ASTNode[] {
  const nodes: ASTNode[] = [];
  let position = 0;

  while (position < input.length) {
    if (input[position] === '<') {
      if (input.startsWith('</', position)) {
        // stray end-tag (should be consumed by parent). Move on.
        const close = input.indexOf('>', position + 2);
        position = close === -1 ? input.length : close + 1;
        continue;
      }

      // tag open
      const tagStart = position;
      position++; // skip '<'

      // get tag name
      const nameStart = position;
      while (position < input.length && /[A-Za-z0-9:_-]/.test(input[position]))
        position++;
      const tagName = input.slice(nameStart, position);

      // read attributes until '>' balancing quotes/braces via attribute reader
      const attrsStart = position;
      let selfClosing = false;
      while (position < input.length) {
        const character = input[position];
        if (character === '"' || character === "'") {
          // fast-skip quoted text
          const quote = character;
          position++;
          while (position < input.length) {
            const cc = input[position];
            if (cc === '\\') {
              position += 2;
              continue;
            }
            if (cc === quote) {
              position++;
              break;
            }
            position++;
          }
          continue;
        }
        if (character === '{') {
          // skip balanced braces inside attributes (handles JSX/Lit inline)
          let depth = 0;
          while (position < input.length) {
            const cc = input[position];
            if (cc === '"' || cc === "'") {
              const qq = cc;
              position++;
              while (position < input.length) {
                const c3 = input[position];
                if (c3 === '\\') {
                  position += 2;
                  continue;
                }
                if (c3 === qq) {
                  position++;
                  break;
                }
                position++;
              }
              continue;
            }
            if (cc === '{') depth++;
            if (cc === '}') {
              depth--;
              if (depth === 0) {
                position++;
                break;
              }
            }
            position++;
          }
          continue;
        }
        if (character === '>') {
          position++;
          break;
        }
        if (character === '/' && input[position + 1] === '>') {
          selfClosing = true;
          position += 2;
          break;
        }
        position++;
      }
      const tagOpenEnd = position;

      const attrsRaw = input.slice(
        attrsStart,
        tagOpenEnd - (selfClosing ? 2 : 1),
      );

      // Allow strategy to refine raw attributes if needed (still not interpreting features)
      const attrs = strategy.extractAttributes(
        attrsRaw,
        baseOffset + attrsStart,
      );

      const element: ASTNode = {
        type: 'Element',
        tag: tagName,
        attributes: attrs,
        children: [],
        loc: { start: baseOffset + tagStart, end: 0 },
        raw: '',
      };

      if (selfClosing || isVoidElement(tagName)) {
        element.loc.end = baseOffset + tagOpenEnd;
        element.raw = input.slice(tagStart, tagOpenEnd);
        nodes.push(element);
        continue;
      }

      // children until matching close tag
      const { children, endIndex } = readChildren(
        input,
        position,
        tagName,
        strategy,
        baseOffset,
      );
      element.children = children;
      position = endIndex;

      // consume the close tag
      let closeEnd = position;
      if (input.startsWith('</', position)) {
        const closeGt = input.indexOf('>', position + 2);
        closeEnd = closeGt === -1 ? input.length : closeGt + 1;
        position = closeEnd;
      }
      element.loc.end = baseOffset + closeEnd;
      element.raw = input.slice(tagStart, closeEnd);
      nodes.push(element);
      continue;
    }

    // text node
    const textStart = position;
    const nextLt = input.indexOf('<', position);
    const textEnd = nextLt === -1 ? input.length : nextLt;
    const raw = input.slice(textStart, textEnd);
    if (raw.trim().length) {
      nodes.push({
        type: 'Text',
        loc: { start: baseOffset + textStart, end: baseOffset + textEnd },
        raw,
      });
    }
    position = textEnd;
  }

  return nodes;
}
