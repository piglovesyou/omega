import { CondRoot, FieldAppendable, FieldMap, validateCond } from '@omega/core';
import debounce from 'debounce-promise';
type Values = { [field_id: string]: any };

export function createValidator(fieldMap: FieldMap) {
  return debounce((values: Values) => {
    const errors: { [field_id: string]: string } = {};
    for (const [fieldId, field] of fieldMap) {
      const { type, valid_if } = field;
      if (!valid_if) continue;
      const val = values[fieldId];
      const messages: string[] = [];
      if (
        !validateCond(
          type,
          (field as FieldAppendable).multi,
          val,
          valid_if,
          messages,
        )
      )
        errors[fieldId] = messages[0];
    }
    return errors;
  }, 100);
}

export function testCondRoot(
  condRoot: CondRoot,
  values: Values,
  fieldMap: FieldMap,
) {
  for (const [fieldId, cond] of Object.entries(condRoot)) {
    const field = fieldMap.get(fieldId)!;
    const { type } = field;
    if (!type) throw new Error('never');
    const valid = validateCond(
      type,
      (field as FieldAppendable).multi,
      values[fieldId],
      cond,
      [],
    );
    if (!valid) return false;
  }
  return true;
}
