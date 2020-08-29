import React, { InputHTMLAttributes } from 'react';
import { useField } from 'formik';

export type InputFieldProps = {
  label: string;
  required?: boolean;
  supplementalText?: string;
} & InputHTMLAttributes<HTMLInputElement>;
export const InputFieldComponent: React.FC<InputFieldProps> = ({
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
        <input {...attributes} {...field} id={name} />
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
