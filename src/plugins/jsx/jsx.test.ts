import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { jsx } from './jsx';

describe('JSX Strategy', () => {
  describe('extractTemplates', () => {
    it('should extract a simple JSX component', () => {
      const code = 'const MyComponent = () => <div>Hello</div>';
      const templates = jsx.extractTemplates(code);
      deepStrictEqual(templates, [
        { template: '<div>Hello</div>', offset: 26 },
      ]);
    });

    it('should handle empty string', () => {
      const templates = jsx.extractTemplates('');
      deepStrictEqual(templates, []);
    });

    it('should extract multiple components', () => {
      const code = `
            const Comp1 = () => <p>First</p>;
            const Comp2 = () => <span>Second</span>;
        `;
      const templates = jsx.extractTemplates(code);
      deepStrictEqual(templates, [
        { template: '<p>First</p>', offset: 33 },
        { template: '<span>Second</span>', offset: 79 },
      ]);
    });

    it('should handle JSX fragments', () => {
      const code = 'const MyFragment = () => <><td>A</td><td>B</td></>;';
      const templates = jsx.extractTemplates(code);
      deepStrictEqual(templates, [
        { template: '<><td>A</td><td>B</td></>', offset: 25 },
      ]);
    });
  });

  describe('extractAttributes', () => {
    it('should extract static string attributes', () => {
      const tag = 'attr="value" attr2=\'value2\'';
      const attributes = jsx.extractAttributes(tag, 0);
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
      const attributes = jsx.extractAttributes(tag, 0);
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

    it('should extract dynamic attributes with identifiers', () => {
      const tag = 'attr={value}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: '{value}',
          computed: true,
          raw: 'attr={value}',
          loc: { start: 0, end: 12 },
        },
      ]);
    });

    it('should extract dynamic attributes with string literals', () => {
      const tag = "attr={'value'}";
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: "{'value'}",
          computed: true,
          raw: "attr={'value'}",
          loc: { start: 0, end: 14 },
        },
      ]);
    });

    it('should extract dynamic attributes with numbers', () => {
      const tag = 'attr={42}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: '{42}',
          computed: true,
          raw: 'attr={42}',
          loc: { start: 0, end: 9 },
        },
      ]);
    });

    it('should extract dynamic attributes with booleans', () => {
      const tag = 'attr={true} attr2={false}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: '{true}',
          computed: true,
          raw: 'attr={true}',
          loc: { start: 0, end: 11 },
        },
        {
          name: 'attr2',
          value: '{false}',
          computed: true,
          raw: 'attr2={false}',
          loc: { start: 12, end: 25 },
        },
      ]);
    });

    it('should extract ternary expressions', () => {
      const tag = "attr={condition ? 'a' : 'b'}";
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'attr',
          value: "{condition ? 'a' : 'b'}",
          computed: true,
          raw: "attr={condition ? 'a' : 'b'}",
          loc: { start: 0, end: 28 },
        },
      ]);
    });

    it('should extract function and arrow function attributes', () => {
      const tag = 'onClick={() => doSomething()} onChange={(e) => handle(e)}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'onClick',
          value: '{() => doSomething()}',
          computed: true,
          raw: 'onClick={() => doSomething()}',
          loc: { start: 0, end: 29 },
        },
        {
          name: 'onChange',
          value: '{(e) => handle(e)}',
          computed: true,
          raw: 'onChange={(e) => handle(e)}',
          loc: { start: 30, end: 57 },
        },
      ]);
    });

    it('should extract spread attributes', () => {
      const tag = '{...props}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '{...spread}',
          value: null,
          computed: true,
          raw: '{...props}',
          loc: { start: 0, end: 10 },
        },
      ]);
    });

    it('should extract ref attributes', () => {
      const tag = 'ref={el => input = el}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'ref',
          value: '{el => input = el}',
          computed: true,
          raw: 'ref={el => input = el}',
          loc: { start: 0, end: 22 },
        },
      ]);
    });

    it('should extract boolean properties via dynamic attribute', () => {
      const tag = 'disabled={isDisabled}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'disabled',
          value: '{isDisabled}',
          computed: true,
          raw: 'disabled={isDisabled}',
          loc: { start: 0, end: 21 },
        },
      ]);
    });

    it('should extract object binding for classList', () => {
      const tag = 'classList={{ active: isActive }}';
      const attributes = jsx.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'classList',
          value: '{{ active: isActive }}',
          computed: true,
          raw: 'classList={{ active: isActive }}',
          loc: { start: 0, end: 32 },
        },
      ]);
    });
  });
});
