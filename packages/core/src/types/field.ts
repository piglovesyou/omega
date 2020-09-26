/**
 * Node: Do not use Record<> that JSON Schema validation cannot recognize.
 */
import { Cond, CondRoot, TPrimitive } from './cond';

export interface FieldBase<FieldType> {
  type: FieldType;
  field_id: string;
  label: string;
  placeholder_text?: string | number;
  supplemental_text?: string;
  initial_value?: TPrimitive | TPrimitive[];
  valid_if?: Cond;
  shown_if?: CondRoot;
  disabled_if?: CondRoot;
}

export interface FieldPluralable {
  multi?:
    | boolean
    | {
        min?: number;
        max?: number;
      };
}

/**
 * Concrete field types
 */
export type HTMLInputField = FieldBase<
  | 'text'
  | 'email'
  | 'url'
  | 'uuid'
  | 'number'
  | 'checkbox'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'color'
  | 'tel'
  | 'radio'
  | 'range'
  // | 'week' // We don't support this, it's not valid date in yup
> &
  FieldPluralable;

export type HTMLRadioField = FieldBase<'radio'>;

export type HTMLSelectField = FieldBase<'select'> & {
  options: { [value: string]: /* optionlabel */ string };
} & FieldPluralable;

export type HTMLTextareaField = FieldBase<'textarea'> & FieldPluralable;

export type Field =
  | HTMLInputField
  | HTMLRadioField
  | HTMLSelectField
  | HTMLTextareaField;

export type AllowedFieldTypes = Field['type'];

export type FieldMap = Map</*field_id*/ string, Field>;
