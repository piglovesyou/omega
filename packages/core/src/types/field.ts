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

export type AppendableOpts =
  | boolean
  | {
      min?: number;
      max?: number;
      required?: boolean;
    }
  | undefined;

// TODO: This seems not good design, reconsider
export interface FieldAppendable {
  multi?: AppendableOpts;
}

/**
 * Concrete field types
 */
export type HTMLTextboxLikeField = FieldBase<
  'text' | 'email' | 'url' | 'uuid' | 'number' | 'tel' | 'textarea'
  // | 'week' // We don't support this, it's not valid date in yup
> &
  FieldAppendable & {
    placeholder_text?: string | number;
  };

export type HTMLWidgetLikeField = FieldBase<
  'range' | 'date' | 'datetime-local' | 'time' | 'month' | 'color'
> &
  FieldAppendable;

// TODO: "options" should be iterable, not hashed map
export type HTMLRadioField = FieldBase<'radio'> & {
  options: { [value: string]: /* optionlabel */ string };
};

export type HTMLCheckboxField = FieldBase<'checkbox'> & {
  options?: { [value: string]: /* optionlabel */ string };
};

export type HTMLSelectField = FieldBase<'select'> &
  FieldAppendable & {
    options: { [value: string]: /* optionlabel */ string };
  };

export type Field =
  | HTMLTextboxLikeField
  | HTMLWidgetLikeField
  | HTMLRadioField
  | HTMLCheckboxField
  | HTMLSelectField;

export type AllowedFieldTypes = Field['type'];

export type FieldMap = Map</*field_id*/ string, Field>;
