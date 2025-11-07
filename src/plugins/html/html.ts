import type { ASTAttribute, ParserPlugin } from '../../types';
import { parseAttributeToken, splitAttributes } from '../../utils/scanner';

export const html: ParserPlugin = {
  name: 'html',
  extractTemplates(source) {
    // For plain HTML assume full file is a template
    return [{ template: source, offset: 0 }];
  },
  extractAttributes(rawAttributes: string, baseOffset: number): ASTAttribute[] {
    // Purely lexical; boolean attributes have no '='
    const tokens = splitAttributes(rawAttributes, baseOffset);
    return tokens.map(parseAttributeToken);
  },
};
