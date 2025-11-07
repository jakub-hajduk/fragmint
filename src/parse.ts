import { html } from './plugins/html/html';
import type { ASTNode, ParserPlugin } from './types';
import { normalize } from './utils/normalize';
import { parseTemplate } from './utils/parse-template';
import { stripComments } from './utils/strip-comments';

export function parse(
  source: string,
  plugin: ParserPlugin = html,
): ASTNode[][] {
  const norm = normalize(source);
  const extracted = plugin.extractTemplates(norm);

  return extracted.map(({ template, offset }) => {
    const html = stripComments(template);
    return parseTemplate(html, plugin, offset);
  });
}
