export function stripComments(html: string): string {
  // Remove HTML comments safely. Do not touch conditional comments, just remove all <!-- ... --> blocks
  return html.replace(/<!--([\s\S]*?)-->/g, '');
}
