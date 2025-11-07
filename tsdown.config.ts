import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    angular: 'src/plugins/angular/angular.ts',
    html: 'src/plugins/html/html.ts',
    jsx: 'src/plugins/jsx/jsx.ts',
    lit: 'src/plugins/lit/lit.ts',
    svelte: 'src/plugins/svelte/svelte.ts',
    vue: 'src/plugins/vue/vue.ts',
  },
  dts: {
    sourcemap: true,
  },
  format: ['es', 'cjs'],
  exports: true,
});
