import type {
  ASTAttribute,
  ExtractedTemplate,
  ParserPlugin,
} from '../../types';

import { parseAttributeToken, splitAttributes } from '../../utils/scanner';

function extractTemplates(source: string): ExtractedTemplate[] {
  if (!source || typeof source !== 'string') return [];

  const results: ExtractedTemplate[] = [];
  const code = source.trim();

  // Check if file looks like an Angular component (TypeScript)
  const isComponentFile =
    /@Component\s*\(/.test(code) || // classic decorator
    /import\s+{?\s*Component\s*}?/.test(code); // import { Component } from '@angular/core'

  // === CASE 1: Angular component with inline template(s)
  if (isComponentFile) {
    // Match both backticked and quoted templates inside @Component metadata
    const regex = /template\s*:\s*(?:`([\s\S]*?)`|'([\s\S]*?)'|"([\s\S]*?)")/g;

    for (const match of source.matchAll(regex)) {
      const fullMatch = match[0];
      const inner = match[1] || match[2] || match[3] || '';

      const quoteChar = fullMatch.includes('`')
        ? '`'
        : fullMatch.includes("'")
          ? "'"
          : '"';
      const quoteIndex = fullMatch.indexOf(quoteChar);
      const absoluteStart = match.index + quoteIndex + 1;

      const trimmed = inner.trim();
      if (!trimmed) continue;

      const leadingWhitespace = inner.length - inner.trimStart().length;
      const adjustedOffset = absoluteStart + leadingWhitespace;

      results.push({
        template: trimmed,
        offset: adjustedOffset,
      });
    }

    // If no inline templates found, return empty (don’t assume external HTML)
    return results;
  }

  // === CASE 2: Plain HTML template file (no @Component decorator)
  const trimmed = code.trim();
  if (!trimmed) return [];

  const leadingWhitespace = source.length - source.trimStart().length;
  return [{ template: trimmed, offset: leadingWhitespace }];
}

export const angular: ParserPlugin = {
  name: 'angular',
  extractTemplates,
  extractAttributes(rawAttributes: string, baseOffset: number): ASTAttribute[] {
    const tokens = splitAttributes(rawAttributes, baseOffset);

    return tokens.map(parseAttributeToken);
  },
};
