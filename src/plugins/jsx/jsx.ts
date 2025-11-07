import type {
  ASTAttribute,
  ExtractedTemplate,
  ParserPlugin,
} from '../../types';
import { parseAttributeToken, splitAttributes } from '../../utils/scanner';

function extractTemplates(source: string): ExtractedTemplate[] {
  const results: { template: string; offset: number }[] = [];

  // Strip comments
  const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const len = code.length;

  // Heuristic pattern for JSX entry points
  const regex = /(?:return\s*|=>\s*|^|[\s(])(<)/g;

  for (const match of source.matchAll(regex)) {
    const lt = match.index + match[0].lastIndexOf('<');
    const before = code.slice(Math.max(0, lt - 25), lt);

    // Skip generics or comparisons like `<T = ...>` or `a < b`
    if (/\w\s*$/.test(before) && !/(return\s*|=>\s*)$/.test(before)) continue;

    // Extract tag name (allow dotted and namespaced identifiers)
    let j = lt + 1;
    while (j < len && /[A-Za-z0-9._:-]/.test(code[j])) j++;
    const tagName = code.slice(lt + 1, j);
    const isFragment = tagName === '' || tagName === 'React.Fragment';

    if (!isFragment && !/^[A-Za-z]/.test(tagName)) continue;

    const closePattern = isFragment ? '</>' : `</${tagName}>`;
    let depth = 0;
    let k = j;

    while (k < len) {
      if (!isFragment && code.startsWith(`<${tagName}`, k)) {
        depth++;
        k += tagName.length + 1;
        continue;
      }
      if (code.startsWith(closePattern, k)) {
        if (depth === 0) {
          const closeGt = code.indexOf('>', k + closePattern.length - 1);
          if (closeGt !== -1) {
            // Include until closing tag
            let fragment = code.slice(lt, closeGt + 1);
            let endIndex = closeGt + 1;

            // Trim optional trailing semicolon
            const semicolonMatch = /^[\s;]+/.exec(code.slice(endIndex));
            if (semicolonMatch) endIndex += semicolonMatch[0].length;

            // Strip semicolon and trailing whitespace from template
            fragment = fragment.replace(/[\s;]+$/, '');

            results.push({
              template: fragment,
              offset: lt,
            });

            regex.lastIndex = endIndex;
          }
          break;
        }
        depth--;
      }
      k++;
    }
  }

  // fallback: top-level JSX
  if (!results.length) {
    const firstLt = code.indexOf('<');
    if (firstLt !== -1)
      results.push({
        template: code.slice(firstLt).replace(/[\s;]+$/, ''),
        offset: firstLt,
      });
  }

  return results;
}

export const jsx: ParserPlugin = {
  name: 'jsx',
  extractTemplates: extractTemplates,
  extractAttributes(rawAttributes: string, baseOffset: number): ASTAttribute[] {
    // Keep raw; do not evaluate. This allows {expr}, spreads, etc. Spreads are kept as name="{...props}"-like tokens by splitter
    const tokens = splitAttributes(rawAttributes, baseOffset);
    return tokens.map((t) => {
      const attr = parseAttributeToken(t);
      // Mark obvious spreads as computed, keep raw name (e.g., {...props}) as a single token
      if (/^\{\.\.\./.test(attr.raw)) {
        return { ...attr, name: '{...spread}', value: null, computed: true };
      }
      return attr;
    });
  },
};
