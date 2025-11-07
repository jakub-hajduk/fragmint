import type { ASTNode, ParserPlugin } from '../types';
import { parseTemplate } from './parse-template';

export function readChildren(
  input: string,
  from: number,
  tagName: string,
  strategy: ParserPlugin,
  baseOffset: number,
): { children: ASTNode[]; endIndex: number } {
  const children: ASTNode[] = [];
  let position = from;
  while (position < input.length) {
    if (input.startsWith(`</${tagName}`, position)) break;
    if (input[position] === '<') {
      if (input.startsWith('</', position)) {
        // foreign close tag for nested structures; bubble up
        break;
      }
      // nested element
      const nested = parseTemplate(
        input.slice(position),
        strategy,
        baseOffset + position,
      );
      if (nested.length) {
        // take the first node (current head), then advance by its length
        const node = nested[0];
        children.push(node);
        position += node.raw.length;
        continue;
      }
    }
    // text until next '<' or close
    const textStart = position;
    const nextLt = input.indexOf('<', position);
    const end = nextLt === -1 ? input.length : nextLt;
    const raw = input.slice(textStart, end);
    if (raw.trim().length) {
      children.push({
        type: 'Text',
        loc: { start: baseOffset + textStart, end: baseOffset + end },
        raw,
      });
    }
    position = end;
  }
  return { children, endIndex: position };
}
