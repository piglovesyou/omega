import { promises } from 'fs';
import globby from 'globby';
import makeDir from 'make-dir';
import { join } from 'path';
import yargs from 'yargs';
import { genForm } from './gen';
import { loadApplicationSchema } from './load';

const { writeFile } = promises;
const { argv } = yargs.option('outDir', {
  alias: 'o',
  description: 'Output directory for generated .tsx files',
  default: '__generated__',
});

async function main() {
  const { outDir, _: schemaPaths } = argv;
  const cwd = process.cwd();

  for (const schemaPath of await globby(schemaPaths, { cwd })) {
    const schema = await loadApplicationSchema({ cwd, schemaPath });
    const { application_id } = schema;
    const dir = join(cwd, outDir, application_id);
    await makeDir(dir);
    const formCode = genForm(schema);
    await writeFile(join(dir, 'form.tsx'), formCode);
  }
}

main().catch((err) => (console.error(err), process.exit(1)));
