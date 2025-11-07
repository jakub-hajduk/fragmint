import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { lit } from './lit';

describe('Lit Strategy', () => {
  describe('extractTemplates', () => {
    it('should extract a simple lit component', () => {
      const code = 'const MyComponent = () => html`<div>Hello</div>`';
      const templates = lit.extractTemplates(code);
      deepStrictEqual(templates, [
        { template: '<div>Hello</div>', offset: 31 },
      ]);
    });

    it('should handle empty string', () => {
      const templates = lit.extractTemplates('');
      deepStrictEqual(templates, []);
    });

    it('should extract multiple components', () => {
      const code = `
            const Comp1 = () => html\`<p>First</p>\`;
            const Comp2 = () => html\`<span>Second</span>\`;
        `;
      const templates = lit.extractTemplates(code);
      deepStrictEqual(templates, [
        { template: '<p>First</p>', offset: 38 },
        { template: '<span>Second</span>', offset: 90 },
      ]);
    });
  });

  describe('extractAttributes', () => {
    it('should extract static string attributes', () => {
      const tag = 'attr="value" attr2=\'value2\'';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: '"value"',
          computed: false,
          raw: 'attr="value"',
          loc: { start: 0, end: 12 },
        },
        {
          name: 'attr2',
          value: "'value2'",
          computed: false,
          raw: "attr2='value2'",
          loc: { start: 13, end: 27 },
        },
      ]);
    });

    it('should handle boolean attributes', () => {
      const tag = 'disabled checked';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'disabled',
          value: null,
          computed: false,
          raw: 'disabled',
          loc: { start: 0, end: 9 },
        },
        {
          name: 'checked',
          value: null,
          computed: false,
          raw: 'checked',
          loc: { start: 9, end: 16 },
        },
      ]);
    });

    it('should extract property bindings', () => {
      const tag = '.prop=${value}';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '.prop',
          value: '${value}',
          computed: true,
          raw: '.prop=${value}',
          loc: { start: 0, end: 14 },
        },
      ]);
    });

    it('should extract event bindings', () => {
      const tag = '@event=${handler}';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '@event',
          value: '${handler}',
          computed: true,
          raw: '@event=${handler}',
          loc: { start: 0, end: 17 },
        },
      ]);
    });

    it('should extract dynamic attributes', () => {
      const tag = 'attr=${value}';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: '${value}',
          computed: true,
          raw: 'attr=${value}',
          loc: { start: 0, end: 13 },
        },
      ]);
    });

    it('should extract dynamic attributes with quotes', () => {
      const tag = 'attr="${value}"';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: '"${value}"',
          computed: true,
          raw: 'attr="${value}"',
          loc: { start: 0, end: 15 },
        },
      ]);
    });

    it('should extract ternary expressions in attributes', () => {
      const tag = "attr=\"${cond ? 'yes' : 'no'}\"";
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: "\"${cond ? 'yes' : 'no'}\"",
          computed: true,
          raw: "attr=\"${cond ? 'yes' : 'no'}\"",
          loc: { start: 0, end: 29 },
        },
      ]);
    });

    it('should extract interpolated class attributes', () => {
      const tag = "class=\"foo ${bar ? 'active' : 'inactive'}\"";
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'class',
          value: "\"foo ${bar ? 'active' : 'inactive'}\"",
          computed: true,
          raw: "class=\"foo ${bar ? 'active' : 'inactive'}\"",
          loc: { start: 0, end: 42 },
        },
      ]);
    });

    it('should extract boolean properties', () => {
      const tag = '.disabled=${false}';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '.disabled',
          value: '${false}',
          computed: true,
          raw: '.disabled=${false}',
          loc: { start: 0, end: 18 },
        },
      ]);
    });

    it('should extract interpolated class with single variable', () => {
      const tag = 'class="foo ${bar}"';
      const attributes = lit.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'class',
          value: '"foo ${bar}"',
          computed: true,
          raw: 'class="foo ${bar}"',
          loc: { start: 0, end: 18 },
        },
      ]);
    });
  });
});
