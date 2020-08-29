import { validateCond, CondRoot, FieldMap } from '@omega/core';

type Values = { [field_id: string]: any };

export function createValidator(fieldMap: FieldMap) {
  return (values: Values) => {
    const errors: { [field_id: string]: string } = {};
    for (const [fieldId, { type, valid_if }] of fieldMap) {
      if (!valid_if) continue;
      const val = values[fieldId];
      const messages: string[] = [];
      if (!validateCond(type, val, valid_if, messages))
        errors[fieldId] = messages[0];
    }
    return errors;
  };
}

export function testCondRoot(
  condRoot: CondRoot,
  values: Values,
  fieldMap: FieldMap,
) {
  for (const [fieldId, cond] of Object.entries(condRoot)) {
    const { type } = fieldMap.get(fieldId)!;
    if (!type) throw new Error('never');
    const valid = validateCond(type, values[fieldId], cond, []);
    if (!valid) return false;
  }
  return true;
}
