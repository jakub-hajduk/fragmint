import type { ASTAttribute } from '../types';

const isSpace = (ch: string) => /\s/.test(ch);

/**
 * Reads a single attribute value beginning at `index`.
 * Supports quoted (", ') and braced ({...}) values and balances nested pairs so that
 * `>` inside strings/expressions doesn't terminate the tag prematurely.
 */
export function readAttributeValue(
  input: string,
  i: number,
): { value: string; end: number; computed: boolean } {
  const start = i;
  let computed = false;
  let index = i;
  const character = input[index];

  if (character === '"' || character === "'") {
    const quote = character;
    index++;
    while (index < input.length) {
      const c = input[index];
      if (c === '\\') {
        index += 2;
        continue;
      }
      if (c === quote) {
        index++;
        break;
      }
      if (c === '$' && input[index + 1] === '{') {
        computed = true;
      }
      index++;
    }
    return { value: input.slice(start, index), end: index, computed };
  }

  if (character === '{') {
    computed = true;
    let depth = 0;
    while (index < input.length) {
      const c = input[index];
      if (c === '"' || c === "'") {
        const q = c;
        index++;
        while (index < input.length) {
          const cc = input[index];
          if (cc === '\\') {
            index += 2;
            continue;
          }
          if (cc === q) {
            index++;
            break;
          }
          index++;
        }
        continue;
      }
      if (c === '{') depth++;
      if (c === '}') {
        depth--;
        if (depth === 0) {
          index++;
          break;
        }
      }
      index++;
    }
    return { value: input.slice(start, index), end: index, computed };
  }

  while (
    index < input.length &&
    !isSpace(input[index]) &&
    input[index] !== '>' &&
    input[index] !== '/'
  )
    index++;
  const raw = input.slice(start, index);

  if (raw.includes('`${') || /\$\{/.test(raw)) computed = true;
  return { value: raw, end: index, computed };
}

/**
 * Naive-but-safe attribute splitter that respects quotes and braces.
 * Returns array of { raw, start, end } segments for each attr token.
 */
export function splitAttributes(
  raw: string,
  baseOffset: number,
): { raw: string; start: number; end: number }[] {
  const out: { raw: string; start: number; end: number }[] = [];
  let position = 0;
  function skipSpaces() {
    while (position < raw.length && isSpace(raw[position])) position++;
  }

  while (position < raw.length) {
    skipSpaces();
    if (position >= raw.length) break;
    const segStart = position;

    // Get name
    while (position < raw.length) {
      const c = raw[position];
      if (isSpace(c) || c === '=' || c === '>' || c === '/') break;
      position++;
    }
    const nameEnd = position;

    if (nameEnd === segStart) {
      position++;
      continue;
    }

    let hasValue = false;
    let valueEnd = position;
    let valueStr = '';

    // Skip spaces around =
    while (position < raw.length && isSpace(raw[position])) position++;

    if (raw[position] === '=') {
      hasValue = true;
      position++;
      while (position < raw.length && isSpace(raw[position])) position++;
      const { value, end } = readAttributeValue(raw, position);
      valueStr = value;
      valueEnd = end;
      position = end;
    } else {
      valueEnd = nameEnd;
    }

    const segEnd = position;
    const slice = raw.slice(segStart, segEnd);
    out.push({
      raw: slice,
      start: baseOffset + segStart,
      end: baseOffset + segEnd,
    });
  }
  return out;
}

export function parseAttributeToken(token: {
  raw: string;
  start: number;
  end: number;
}): ASTAttribute {
  const raw = token.raw.trim();
  // name
  let index = 0;
  while (index < raw.length && !/\s|=/.test(raw[index])) index++;
  const name = raw.slice(0, index);
  while (index < raw.length && /\s/.test(raw[index])) index++;
  let value: string | null = null;
  let computed = false;
  if (raw[index] === '=') {
    index++;
    while (index < raw.length && /\s/.test(raw[index])) index++;
    value = raw.slice(index) ?? '';
    computed = /[{`]/.test(value) || /\$\{/.test(value);
  }
  return {
    name,
    value,
    computed,
    raw,
    loc: { start: token.start, end: token.end },
  };
}
