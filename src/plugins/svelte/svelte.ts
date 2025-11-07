import type {
  ASTAttribute,
  ExtractedTemplate,
  ParserPlugin,
} from '../../types';
import { parseAttributeToken, splitAttributes } from '../../utils/scanner';

function extractTemplates(source: string): ExtractedTemplate[] {
  if (!source || typeof source !== 'string') return [];

  // Remove all <script> and <style> blocks (including context="module")
  const out = source
    // remove any <script ...> ... </script> (multiline safe)
    .replace(/<script(\s[^>]*)?>[\s\S]*?<\/script\s*>/gi, '')
    // remove any <style ...> ... </style>
    .replace(/<style(\s[^>]*)?>[\s\S]*?<\/style\s*>/gi, '')
    // trim leading/trailing whitespace
    .trim();

  // If there's nothing meaningful left, skip
  if (!out.trim()) return [];

  // Compute offset to first non-whitespace char (preserve position)
  const offset = source.length - source.trimStart().length;

  return [{ template: out, offset }];
}

export const svelte: ParserPlugin = {
  name: 'svelte',
  extractTemplates,
  extractAttributes(rawAttributes: string, baseOffset: number): ASTAttribute[] {
    const tokens = splitAttributes(rawAttributes, baseOffset);
    return tokens.map(parseAttributeToken);
  },
};
