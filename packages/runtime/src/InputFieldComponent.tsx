import React, { InputHTMLAttributes, FC } from 'react';
import { useField } from 'formik';

export type InputHTMLAttributesStrict = InputHTMLAttributes<
  HTMLInputElement
> & { name: string };
export type InputHTMLAttributesStrictWithName = {
  component: string;
} & InputHTMLAttributesStrict;

export const SingleInputHTML: FC<InputHTMLAttributesStrictWithName> = ({
  component,
  children,
  ...attributes
}) => {
  const [field] = useField(attributes);
  const { name } = attributes;
  return React.createElement(
    component,
    {
      ...attributes,
      ...field,
      id: name,
    },
    children,
  );
};

export type InputFieldProps = {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  supplementalText?: string;
};

export const InputFieldComponent: FC<InputFieldProps> = ({
  name,
  type,
  label,
  required,
  supplementalText,
  children,
}) => {
  const [, meta] = useField(name);
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
        {children}
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
