import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { svelte } from './svelte';

describe('Svelte Strategy', () => {
  describe('extractTemplates', () => {
    it('should extract a simple svelte component', () => {
      const code = "<script>let name = 'world';</script><h1>Hello {name}!</h1>";
      const templates = svelte.extractTemplates(code);
      deepStrictEqual(templates, [
        { template: '<h1>Hello {name}!</h1>', offset: 0 },
      ]);
    });

    it('should handle empty string', () => {
      const templates = svelte.extractTemplates('');
      deepStrictEqual(templates, []);
    });

    it('should extract multiple templates', () => {
      const code = `
            <p>First</p>
            <span>Second</span>
        `;
      const templates = svelte.extractTemplates(code);
      deepStrictEqual(templates, [
        {
          template: '<p>First</p>\n            <span>Second</span>',
          offset: 13,
        },
      ]);
    });
  });

  describe('extractAttributes', () => {
    it('should extract static string attributes', () => {
      const tag = 'attr="value" attr2=\'value2\'';
      const attributes = svelte.extractAttributes(tag, 0);
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
      const attributes = svelte.extractAttributes(tag, 0);
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

    it('should extract event handlers', () => {
      const tag = 'on:click={handler}';
      const attributes = svelte.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'on:click',
          value: '{handler}',
          computed: true,
          raw: 'on:click={handler}',
          loc: { start: 0, end: 18 },
        },
      ]);
    });

    it('should extract two-way bindings', () => {
      const tag = 'bind:value={text}';
      const attributes = svelte.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'bind:value',
          value: '{text}',
          computed: true,
          raw: 'bind:value={text}',
          loc: { start: 0, end: 17 },
        },
      ]);
    });

    it('should extract class directives', () => {
      const tag = 'class:active={isActive}';
      const attributes = svelte.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'class:active',
          value: '{isActive}',
          computed: true,
          raw: 'class:active={isActive}',
          loc: { start: 0, end: 23 },
        },
      ]);
    });

    it('should extract style directives', () => {
      const tag = 'style:color={color}';
      const attributes = svelte.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'style:color',
          value: '{color}',
          computed: true,
          raw: 'style:color={color}',
          loc: { start: 0, end: 19 },
        },
      ]);
    });
  });
});
