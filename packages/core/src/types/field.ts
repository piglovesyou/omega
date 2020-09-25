/**
 * Node: Do not use Record<> that JSON Schema validation cannot recognize.
 */
import { Cond, CondRoot, TPrimitive } from './cond';

interface FieldBase<FieldType> {
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

/**
 * Concrete field types
 */
export type InputField = FieldBase<
  'text' | 'email' | 'url' | 'uuid' | 'number' | 'checkbox' | 'date'
>;

export interface SelectField extends FieldBase<'select'> {
  options: { [value: string]: /* optionlabel */ string };
}

export type Field = InputField | SelectField;

export type AllowedFieldTypes = Field['type'];

export type FieldMap = Map</*field_id*/ string, Field>;
