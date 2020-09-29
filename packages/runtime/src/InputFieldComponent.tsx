import { AppendableOpts } from '@omega/core';
import React, { InputHTMLAttributes, FC, useMemo } from 'react';
import { FieldArray, useField } from 'formik';

export type InputHTMLAttributesStrict = InputHTMLAttributes<
  HTMLInputElement
> & { name: string };

export type InputHTMLAttributesStrictWithName = InputHTMLAttributesStrict & {
  component: string;
};

export type InputFieldProps = Pick<
  InputHTMLAttributesStrict,
  'name' | 'type'
> & {
  label: string;
  required?: boolean;
  supplementalText?: string;
};

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

export const MultiInputHTML: FC<
  InputHTMLAttributesStrictWithName & {
    multi: AppendableOpts;
  }
> = ({ component, multi, ...attributes }) => {
  if (!multi) throw new Error('never');
  const { name } = attributes;
  const [{ value }] = useField(name);
  const [removable, addable] = useMemo(() => {
    const min = (typeof multi === 'object' && multi.min) || 0;
    const max = (typeof multi === 'object' && multi.max) || Infinity;
    return [value.length > min, value.length < max];
  }, [value.length]);
  return (
    <>
      <FieldArray
        name={name}
        render={(arrayHelpers) =>
          value && value.length > 0 ? (
            (value as any[]).map((v, index) => {
              const itemName = `${name}.${index}`;
              return (
                <div key={itemName} className="omega-input-arrayitem">
                  <SingleInputHTML
                    component={component}
                    {...attributes}
                    value={v}
                    name={itemName}
                  />
                  {removable && (
                    <button
                      type="button"
                      className="omega-form__button omega-form__button--link"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      Remove
                    </button>
                  )}
                  {addable && (
                    <button
                      type="button"
                      className="omega-form__button omega-form__button--link"
                      onClick={() => {
                        arrayHelpers.insert(index + 1, '');
                      }} // insert an empty string at a position
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <button
              type="button"
              className="omega-form__button omega-form__button--link"
              onClick={() => {
                arrayHelpers.push('');
              }}
            >
              Add
            </button>
          )
        }
      />
    </>
  );
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
