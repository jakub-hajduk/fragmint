import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { html } from './html';

describe('HTML Strategy', () => {
  describe('extractTemplates', () => {
    it('should return the full source as a template', () => {
      const code = '<div><span>hello</span></div>';
      const templates = html.extractTemplates(code);
      deepStrictEqual(templates, [{ template: code, offset: 0 }]);
    });

    it('should handle empty string', () => {
      const templates = html.extractTemplates('');
      deepStrictEqual(templates, [{ template: '', offset: 0 }]);
    });
  });

  describe('extractAttributes', () => {
    it('should extract attributes with double quotes', () => {
      const tag = 'class="foo" id="bar"';
      const attributes = html.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'class',
          value: '"foo"',
          computed: false,
          raw: 'class="foo"',
          loc: { start: 0, end: 11 },
        },
        {
          name: 'id',
          value: '"bar"',
          computed: false,
          raw: 'id="bar"',
          loc: { start: 12, end: 20 },
        },
      ]);
    });

    it('should extract attributes with single quotes', () => {
      const tag = "class='foo' id='bar'";
      const attributes = html.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'class',
          value: "'foo'",
          computed: false,
          raw: "class='foo'",
          loc: { start: 0, end: 11 },
        },
        {
          name: 'id',
          value: "'bar'",
          computed: false,
          raw: "id='bar'",
          loc: { start: 12, end: 20 },
        },
      ]);
    });

    it('should handle boolean attributes like disabled', () => {
      const tag = 'disabled';
      const attributes = html.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'disabled',
          value: null,
          computed: false,
          raw: 'disabled',
          loc: { start: 0, end: 8 },
        },
      ]);
    });

    it('should handle boolean attributes like checked', () => {
      const tag = 'type="checkbox" checked';
      const attributes = html.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'type',
          value: '"checkbox"',
          computed: false,
          raw: 'type="checkbox"',
          loc: { start: 0, end: 15 },
        },
        {
          name: 'checked',
          value: null,
          computed: false,
          raw: 'checked',
          loc: { start: 16, end: 23 },
        },
      ]);
    });

    it('should handle a mix of attribute types', () => {
      const tag = 'type=\'text\' value="hello" required';
      const attributes = html.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'type',
          value: "'text'",
          computed: false,
          raw: "type='text'",
          loc: { start: 0, end: 11 },
        },
        {
          name: 'value',
          value: '"hello"',
          computed: false,
          raw: 'value="hello"',
          loc: { start: 12, end: 25 },
        },
        {
          name: 'required',
          value: null,
          computed: false,
          raw: 'required',
          loc: { start: 26, end: 34 },
        },
      ]);
    });
  });
});
