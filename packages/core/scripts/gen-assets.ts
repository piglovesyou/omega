import { promises } from 'fs';
import makeDir from 'make-dir';
import { join } from 'path';
import _rimraf from 'rimraf';
import {
  generateSchema,
  getProgramFromFiles,
  PartialArgs,
} from 'typescript-json-schema';
import { promisify } from 'util';

const rimraf = promisify(_rimraf);
const { writeFile } = promises;
const baseDir = join(__dirname, '..');
const outDir = join(baseDir, 'src/__assets__');
const outFile = join(outDir, 'application.json');
const sourceFiles = [join(baseDir, 'src/types/application.ts')];

const settings: PartialArgs = {
  required: true,
  aliasRef: true,
  noExtraProps: true,
  strictNullChecks: true,
};

main().catch((err) => (console.error(err), process.exit(1)));

async function main() {
  await rimraf(outDir);
  await makeDir(outDir);

  const program = getProgramFromFiles(sourceFiles, undefined, baseDir);
  const schema = generateSchema(program, '*', settings);
  embedIdForTypes(schema);

  await writeFile(outFile, JSON.stringify(schema, undefined, 2));
}

// For 'jsonschema' validation
function embedIdForTypes(schema: any) {
  for (const [name, def] of Object.entries(schema.definitions!))
    (def as any).id = `#/definitions/${name}`;
}
