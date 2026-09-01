import { readFile, writeFile } from 'node:fs/promises';

/*
 * Takes the stylesheet import back out of the emitted declarations.
 *
 * The entry imports `lib.css` so the build has something to extract, and
 * TypeScript faithfully copies that line into `index.d.ts` — where it is a
 * lie: nothing called `lib.css` is published, and a consumer's compiler tries
 * to resolve it and fails. The styles ship as `bismuth-ui/style.css`, which is
 * an import a person writes, not one a type declaration should be making.
 */
const types = new URL('../dist/index.d.ts', import.meta.url);
const source = await readFile(types, 'utf8');

await writeFile(types, source.replace(/^import '\.\/lib\.css';\n/m, ''));
