export function normalize(src: string): string {
  return src
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?|\u2028|\u2029/g, '\n')
    .replace(/[\t\f\v\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, ' ');
}
