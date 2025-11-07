import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { angular } from './angular';

describe('Angular Strategy', () => {
  describe('extractTemplates', () => {
    it('should extract template from inline component with backticks', () => {
      const code = `
        @Component({
          selector: 'app-root',
          template: \`
            <h1>Hello World</h1>
          \`
        })
        export class AppComponent {}
      `;

      const result = angular.extractTemplates(code);
      strictEqual(result.length, 1);
      const { template, offset } = result[0];
      strictEqual(template, '<h1>Hello World</h1>');
      strictEqual(offset, 88);
    });

    it('should extract template from inline component with single quotes', () => {
      const code = `
        @Component({
          selector: 'app-root',
          template: '<h2>Single Quotes</h2>'
        })
        export class AppComponent {}
      `;
      const result = angular.extractTemplates(code);
      strictEqual(result.length, 1);
      const { template, offset } = result[0];
      strictEqual(template, '<h2>Single Quotes</h2>');
      strictEqual(offset, 75);
    });

    it('should extract template from inline component with double quotes', () => {
      const code = `
        @Component({
          selector: 'app-root',
          template: "<h3>Double Quotes</h3>"
        })
        export class AppComponent {}
      `;
      const result = angular.extractTemplates(code);
      strictEqual(result.length, 1);
      const { template, offset } = result[0];
      strictEqual(template, '<h3>Double Quotes</h3>');
      strictEqual(offset, 75);
    });

    it('should return an empty array if no inline template is found', () => {
      const code = `
        @Component({
          selector: 'app-root',
          templateUrl: './app.component.html'
        })
        export class AppComponent {}
      `;
      const result = angular.extractTemplates(code);
      deepStrictEqual(result, []);
    });

    it('should treat the whole file as a template if it is not a component file', () => {
      const code = '<div><span>hello</span></div>';
      const result = angular.extractTemplates(code);
      strictEqual(result.length, 1);
      const { template, offset } = result[0];
      strictEqual(template, '<div><span>hello</span></div>');
      strictEqual(offset, 0);
    });

    it('should handle leading whitespace in HTML files', () => {
      const code = '  \n <div><span>hello</span></div>';
      const result = angular.extractTemplates(code);
      strictEqual(result.length, 1);
      const { template, offset } = result[0];
      strictEqual(template, '<div><span>hello</span></div>');
      strictEqual(offset, 4);
    });

    it('should return an empty array for an empty string', () => {
      const result = angular.extractTemplates('');
      deepStrictEqual(result, []);
    });

    it('should return an empty array for a component file with no template', () => {
      const code = `import { Component } from '@angular/core';`;
      const result = angular.extractTemplates(code);
      deepStrictEqual(result, []);
    });

    it('should extract multiple templates from a single file', () => {
      const code = `
          @Component({ template: '<h1>Template 1</h1>' })
          class MyComponent1 {}

          @Component({
            template: \`
              <h2>Template 2</h2>
            \`
          })
          class MyComponent2 {}
        `;
      const result = angular.extractTemplates(code);
      strictEqual(result.length, 2);
      strictEqual(result[0].template, '<h1>Template 1</h1>');
      strictEqual(result[0].offset, 35);
      strictEqual(result[1].template, '<h2>Template 2</h2>');
      strictEqual(result[1].offset, 153);
    });
  });

  describe('extractAttributes', () => {
    it('should extract attributes from a simple tag', () => {
      const tag = ' class="foo" id="bar"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: 'class',
          value: '"foo"',
          computed: false,
          raw: 'class="foo"',
          loc: { start: 1, end: 12 },
        },
        {
          name: 'id',
          value: '"bar"',
          computed: false,
          raw: 'id="bar"',
          loc: { start: 13, end: 21 },
        },
      ]);
    });

    it('should handle attributes with no value', () => {
      const tag = 'disabled';
      const attributes = angular.extractAttributes(tag, 0);
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

    it('should extract property binding', () => {
      const tag = '[prop]="expr"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '[prop]',
          value: '"expr"',
          computed: false,
          raw: '[prop]="expr"',
          loc: { start: 0, end: 13 },
        },
      ]);
    });

    it('should extract event binding', () => {
      const tag = '(event)="expr"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '(event)',
          value: '"expr"',
          computed: false,
          raw: '(event)="expr"',
          loc: { start: 0, end: 14 },
        },
      ]);
    });

    it('should extract two-way binding', () => {
      const tag = '[(prop)]="expr"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '[(prop)]',
          value: '"expr"',
          computed: false,
          raw: '[(prop)]="expr"',
          loc: { start: 0, end: 15 },
        },
      ]);
    });

    it('should extract attribute binding', () => {
      const tag = '[attr.role]="role"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '[attr.role]',
          value: '"role"',
          computed: false,
          raw: '[attr.role]="role"',
          loc: { start: 0, end: 18 },
        },
      ]);
    });

    it('should extract class binding', () => {
      const tag = '[class.active]="isActive"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '[class.active]',
          value: '"isActive"',
          computed: false,
          raw: '[class.active]="isActive"',
          loc: { start: 0, end: 25 },
        },
      ]);
    });

    it('should extract event binding with params', () => {
      const tag = '(click)="onClick($event)"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '(click)',
          value: '"onClick($event)"',
          computed: false,
          raw: '(click)="onClick($event)"',
          loc: { start: 0, end: 25 },
        },
      ]);
    });

    it('should extract boolean property binding', () => {
      const tag = '[disabled]="isDisabled"';
      const attributes = angular.extractAttributes(tag, 0);
      deepStrictEqual(attributes, [
        {
          name: '[disabled]',
          value: '"isDisabled"',
          computed: false,
          raw: '[disabled]="isDisabled"',
          loc: { start: 0, end: 23 },
        },
      ]);
    });
  });
});
