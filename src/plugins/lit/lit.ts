import type {
  ASTAttribute,
  ExtractedTemplate,
  ParserPlugin,
} from '../../types';

import { parseAttributeToken, splitAttributes } from '../../utils/scanner';

function extractTemplates(source: string): ExtractedTemplate[] {
  const results: ExtractedTemplate[] = [];
  // Match `html` tagged template literals only (not myHtml`...`)
  const regex = /(?<![A-Za-z0-9_$])html`([\s\S]*?)`/g;

  for (const match of source.matchAll(regex)) {
    const fullMatch = match[0];
    const inner = match[1];

    // Absolute index of opening backtick content
    const backtickIndex = fullMatch.indexOf('`');
    const absoluteStart = match.index + backtickIndex + 1;

    // Trim whitespace inside template, but preserve original offset alignment
    const leadingWhitespace = inner.length - inner.trimStart().length;
    const adjustedOffset = absoluteStart + leadingWhitespace;
    const trimmed = inner.trim();

    // Skip empty templates after trimming
    if (!trimmed) continue;

    results.push({
      template: trimmed,
      offset: adjustedOffset,
    });
  }

  // Fallback: nothing found -> return []
  return results;
}

export const lit: ParserPlugin = {
  name: 'lit',
  extractTemplates,
  extractAttributes(rawAttributes: string, baseOffset: number): ASTAttribute[] {
    const tokens = splitAttributes(rawAttributes, baseOffset);
    return tokens.map(parseAttributeToken);
  },
};
