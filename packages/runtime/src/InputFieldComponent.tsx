import React, { InputHTMLAttributes } from 'react';
import { useField } from 'formik';

export type InputFieldProps = {
  label: string;
  required?: boolean;
  supplementalText?: string;
} & InputHTMLAttributes<HTMLInputElement>;
export const InputFieldComponent: React.FC<
  {
    component: 'input' | 'select';
  } & InputFieldProps
> = ({
  component,
  children,
  label,
  required,
  supplementalText,
  ...attributes
}: any) => {
  const { type, name } = attributes;
  const [field, meta] = useField(attributes);
  return (
    <div
      className={`omega-field omega-field--${type} ${
        required ? `omega-field--required` : ''
      }`}
    >
      <label className={`omega-field__label`} htmlFor={name}>
        <span>{label}</span>
      </label>
      <div className={`omega-field__input`}>
        {React.createElement(
          component,
          {
            ...attributes,
            ...field,
            id: name,
          },
          children,
        )}
        {supplementalText && (
          <div className={`omega-field__supplemental-text`}>
            {supplementalText}
          </div>
        )}
        {meta.touched && !!meta.error && (
          <div className={`omega-field__message`}>{meta.error}</div>
        )}
      </div>
    </div>
  );
};
