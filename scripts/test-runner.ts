import { globSync } from 'node:fs';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { config } from 'dotenv';

config();

process.env.NODE_OPTIONS = '--import tsx';

const files = globSync('**/*.test.ts', {
  exclude: (filename) => filename.includes('node_modules/**'),
});

run({ files, concurrency: true, watch: true })
  .compose(spec)
  .pipe(process.stdout);
