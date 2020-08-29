import { Application, CondRoot } from '@omega/core';
import { Validator } from 'jsonschema';
import { join } from 'path';
import { env } from 'string-env-interpolation';
import { parse as parseYaml } from 'yaml';
import ApplicationJSONSchema from './__assets__/application.json';
import { readFile } from './lib/file';
import { printError } from './lib/print';

const validator = new Validator();

validator.addSchema(ApplicationJSONSchema as any);

export async function readSchema(fullPath: string) {
  const content = await readFile(fullPath);
  const interpolated = env(content);
  return parseYaml(interpolated);
}

function validateSchema(schema: Application) {
  return validator.validate(schema, { $ref: '#/definitions/Application' });
}

function validateDependees(schema: Application) {
  const errors: any[] = [];
  const table = new Map<string, true>(
    schema.fields.map((e) => [e.field_id, true]),
  );
  function checkIfExists(cond: CondRoot | undefined) {
    if (!cond) return;
    for (const fieldId of Object.keys(cond))
      if (!table.has(fieldId))
        errors.push(new Error(`${fieldId} does not exist`));
  }
  for (const field of schema.fields) {
    checkIfExists(field.shown_if);
  }
  return errors;
}

export async function loadApplicationSchema({
  cwd,
  schemaPath,
}: {
  cwd: string;
  schemaPath: string;
}) {
  const schemaFullPath = join(cwd, schemaPath);
  const schema = await readSchema(schemaFullPath);
  const jsonSchemaValidationResult = validateSchema(schema);
  if (jsonSchemaValidationResult.errors.length) {
    for (const err of jsonSchemaValidationResult.errors) printError(err);
    throw new Error(
      `${schemaPath} has the above error(s).\n\n${jsonSchemaValidationResult.errors
        .map((e) => `- ${e.message}`)
        .join('\n')}`,
    );
  }
  const dependeeErrors = validateDependees(schema);
  if (dependeeErrors.length) {
    for (const err of dependeeErrors) printError(err);
    throw new Error(`field_id in ${schemaPath} points to one does not exist.`);
  }
  return schema as Application;
}
