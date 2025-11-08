import { globSync } from 'node:fs';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { config } from 'dotenv';

config();

process.env.NODE_OPTIONS = '--import tsx';

const files = globSync('**/*.test.ts', {
  exclude: (filename) => filename.includes('node_modules/**'),
});

const args = process.argv.slice(2);

run({ files, concurrency: true, watch: args.includes('watch') })
  .compose(spec)
  .pipe(process.stdout);
