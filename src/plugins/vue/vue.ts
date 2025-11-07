import type {
  ASTAttribute,
  ExtractedTemplate,
  ParserPlugin,
} from '../../types';
import { parseAttributeToken, splitAttributes } from '../../utils/scanner';

function extractTemplates(source: string): ExtractedTemplate[] {
  // Naive SFC <template> ... </template> extraction.
  const open = source.search(/<template(\s[^>]*)?>/i);
  if (open === -1) return [];
  const openEnd = source.indexOf('>', open) + 1;
  const close = source.search(/<\/template>/i);
  const end = close !== -1 ? close : source.length;
  return [{ template: source.slice(openEnd, end), offset: openEnd }];
}

export const vue: ParserPlugin = {
  name: 'vue',
  extractTemplates,
  extractAttributes(rawAttributes: string, baseOffset: number): ASTAttribute[] {
    const tokens = splitAttributes(rawAttributes, baseOffset);
    return tokens.map((attr) => {
      const parsedAttribute = parseAttributeToken(attr);
      return {
        ...parsedAttribute,
        computed: /^v-|:|@/.test(parsedAttribute.name),
      };
    });
  },
};
