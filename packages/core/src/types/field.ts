/**
 * Node: Do not use Record<> that JSON Schema validation cannot recognize.
 */
import { Cond, CondRoot, TPrimitive } from './cond';

export interface FieldBase<FieldType> {
  type: FieldType;
  field_id: string;
  label: string;
  supplemental_text?: string;
  initial_value?: TPrimitive | TPrimitive[];
  valid_if?: Cond;
  shown_if?: CondRoot;
  disabled_if?: CondRoot;
}

export type FieldMultiOpts =
  | boolean
  | {
      min?: number;
      max?: number;
      required?: boolean;
    }
  | undefined;

// TODO: This seems not good design, reconsider
// TODO: use "Appendable"
export interface FieldPluralable {
  multi?: FieldMultiOpts;
}

/**
 * Concrete field types
 */
export type HTMLTextboxLikeField = FieldBase<
  | 'text'
  | 'email'
  | 'url'
  | 'uuid'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'color'
  | 'tel'
  | 'range'
  // | 'week' // We don't support this, it's not valid date in yup
> &
  FieldPluralable & {
    placeholder_text?: string | number;
  };

// TODO: "options" should be iterable, not hashed map
export type HTMLRadioField = FieldBase<'radio'> & {
  options: { [value: string]: /* optionlabel */ string };
};

export type HTMLCheckboxField = FieldBase<'checkbox'> & {
  options?: { [value: string]: /* optionlabel */ string };
};

export type HTMLSelectField = FieldBase<'select'> &
  FieldPluralable & {
    options: { [value: string]: /* optionlabel */ string };
  };

export type HTMLTextareaField = FieldBase<'textarea'> & FieldPluralable;

export type Field =
  | HTMLTextboxLikeField
  | HTMLRadioField
  | HTMLCheckboxField
  | HTMLSelectField
  | HTMLTextareaField;

export type AllowedFieldTypes = Field['type'];

export type FieldMap = Map</*field_id*/ string, Field>;
