import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { vue } from './vue';

describe('Vue Strategy', () => {
  describe('extractTemplates', () => {
    it('should extract a simple vue component', () => {
      const code = '<template><div>Hello</div></template>';
      const templates = vue.extractTemplates(code);
      deepStrictEqual(templates, [
        { template: '<div>Hello</div>', offset: 10 },
      ]);
    });

    it('should handle empty string', () => {
      const templates = vue.extractTemplates('');
      deepStrictEqual(templates, []);
    });

    it('should extract multiple templates', () => {
      const code = `
            <template>
              <p>First</p>
              <span>Second</span>
            </template>
        `;
      const templates = vue.extractTemplates(code);
      deepStrictEqual(templates, [
        {
          template:
            '\n              <p>First</p>\n              <span>Second</span>\n            ',
          offset: 23,
        },
      ]);
    });
  });

  describe('extractAttributes', () => {
    it('should extract static string attributes', () => {
      const tag = 'attr="value" attr2=\'value2\'';
      const attributes = vue.extractAttributes(tag, 0);
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
      const attributes = vue.extractAttributes(tag, 0);
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

    it('should extract v-bind directives', () => {
      const tag = 'v-bind:attr="expr" :prop="expr2"';
      const attributes = vue.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'v-bind:attr',
          value: '"expr"',
          computed: true,
          raw: 'v-bind:attr="expr"',
          loc: { start: 0, end: 18 },
        },
        {
          name: ':prop',
          value: '"expr2"',
          computed: true,
          raw: ':prop="expr2"',
          loc: { start: 19, end: 32 },
        },
      ]);
    });

    it('should extract v-on event handlers', () => {
      const tag = 'v-on:click="handler" @submit="submit"';
      const attributes = vue.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'v-on:click',
          value: '"handler"',
          computed: true,
          raw: 'v-on:click="handler"',
          loc: { start: 0, end: 20 },
        },
        {
          name: '@submit',
          value: '"submit"',
          computed: true,
          raw: '@submit="submit"',
          loc: { start: 21, end: 37 },
        },
      ]);
    });

    it('should extract v-model two-way bindings', () => {
      const tag = 'v-model="username"';
      const attributes = vue.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'v-model',
          value: '"username"',
          computed: true,
          raw: 'v-model="username"',
          loc: { start: 0, end: 18 },
        },
      ]);
    });
  });
});
