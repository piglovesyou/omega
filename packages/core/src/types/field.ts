import { Cond, CondRoot, TPrimitive } from './cond';

export type FieldTypes =
  | 'text'
  | 'email'
  | 'url'
  | 'uuid'
  | 'number'
  | 'checkbox'
  | 'date';

export type Field = {
  field_id: string;
  label: string;
  placeholder_text?: string | number;
  supplemental_text?: string;
  type: FieldTypes;
  // component?: string;
  initial_value?: TPrimitive | TPrimitive[];
  valid_if?: Cond;
  shown_if?: CondRoot;
  disabled_if?: CondRoot;
};

export type FieldMap = Map</*field_id*/ string, Field>;
