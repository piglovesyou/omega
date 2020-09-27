import { MixedSchema, Schema, ValidationError } from 'yup';
import * as yup from 'yup';
import { Cond, CondForTypes, MixedCond, NestCond } from './types/cond';
import { AllowedFieldTypes, AppendableOpts } from './types/field';

function wrapAsMulti(v: Schema<any>, multi: AppendableOpts) {
  let m = yup.array();
  if (typeof multi === 'object') {
    if (multi.required) m = m.required();
    if (multi.min) m = m.min(multi.min);
    if (multi.max) m = m.max(multi.max);
  }
  return m.of(v);
}

function getValidatorForType(type: AllowedFieldTypes) {
  switch (type) {
    case 'text':
    case 'color':
    case 'tel':
    case 'select':
    case 'radio':
    case 'textarea':
      return yup.string();
    case 'email':
      return yup.string().email();
    case 'uuid':
      return yup.string().uuid();
    case 'url':
      return yup.string().url();
    case 'number':
    case 'range':
      return yup.number();
    case 'checkbox':
      return yup.boolean();
    // case 'week':
    case 'date':
    case 'datetime-local':
    case 'time':
    case 'month':
      return yup.date();
    default:
      throw new Error(`${type} is not a valid field.type.`);
  }
}

function isEmpty(obj: any) {
  return Object.entries(obj).length === 0;
}

function validate(valid: Schema<any>, val: any, messages: string[]): boolean {
  try {
    valid.validateSync(val);
  } catch (err) {
    if (err instanceof ValidationError)
      for (const e of err.errors) messages.push(e);
    return false;
  }
  return true;
}

function validateCondRecur(
  type: AllowedFieldTypes,
  multi: AppendableOpts,
  val: any,
  conds: Cond,
  messages: string[],
): boolean {
  if (isEmpty(conds)) return true;

  // NextCond
  const { $and, $or, $not, ...mixedConds } = conds as Required<NestCond>;
  if ($and) {
    if (
      !Object.entries($and).every(([condK, condV]) => {
        return validateCondRecur(
          type,
          multi,
          val,
          { [condK]: condV },
          messages,
        );
      })
    )
      return false;
  }
  if ($or) {
    if (
      !Object.entries($or).some(([condK, condV]) => {
        return validateCondRecur(
          type,
          multi,
          val,
          { [condK]: condV },
          messages,
        );
      })
    )
      return false;
  }
  if ($not) {
    if (
      Object.entries($not).every(([condK, condV]) => {
        return validateCondRecur(type, multi, val, { [condK]: condV }, []); // $not should not load error messages
      })
    )
      return false;
  }

  // MixedCond
  const {
    $in,
    $nin,
    $eq,
    $ne,
    $required,
    ...typeConds
  } = mixedConds as Required<MixedCond>;
  let mixedValid: MixedSchema | null = null;
  if ($in) mixedValid = (mixedValid = yup.mixed()).oneOf($in);
  if ($nin)
    mixedValid = (mixedValid || (mixedValid = yup.mixed())).notOneOf($nin);
  if ($eq) mixedValid = (mixedValid || (mixedValid = yup.mixed())).oneOf([$eq]);
  if ($ne)
    mixedValid = (mixedValid || (mixedValid = yup.mixed())).notOneOf([$ne]);
  if (mixedValid && !validate(mixedValid, val, messages)) return false;

  // Other conditions
  const {
    $gt,
    $gte,
    $lt,
    $lte,
    $length,
    $integer,
    ...unknownConds
  } = typeConds as Required<CondForTypes>;
  if (!isEmpty(unknownConds))
    throw new Error(`There are unknown keys ${Object.keys(unknownConds)}`);

  let valid = getValidatorForType(type);

  if ($required) valid = valid.required();
  if ($gt) valid = (valid as yup.NumberSchema).moreThan($gt);
  if ($gte)
    valid = (valid as yup.StringSchema | yup.NumberSchema | yup.DateSchema).min(
      $gte,
    );
  if ($lt) valid = (valid as yup.NumberSchema).lessThan($lt);
  if ($lte)
    valid = (valid as yup.StringSchema | yup.NumberSchema | yup.DateSchema).max(
      $lte,
    );
  if ($length) valid = (valid as yup.StringSchema).length($length);
  if ($integer) valid = (valid as yup.NumberSchema).integer();

  if (multi) return validate(wrapAsMulti(valid, multi), val, messages);
  return validate(valid, val, messages);
}

export function validateCond(
  type: AllowedFieldTypes,
  multi: AppendableOpts,
  val: any,
  cond: Cond,
  messages: string[] = [],
): boolean {
  if (!validate(getValidatorForType(type), val, messages)) return false;
  return validateCondRecur(type, multi, val, cond, messages);
}
