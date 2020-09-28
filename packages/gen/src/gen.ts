import {
  Application,
  Field,
  FieldAppendable,
  HTMLCheckboxField,
  HTMLRadioField,
  HTMLSelectField,
  HTMLTextboxLikeField,
  validateCond,
} from '@omega/core';
import React from 'react';
import { getFieldValueType } from './ast/field';
import { program } from '@babel/types';
import { parseExpression, ParserOptions } from '@babel/parser';
import generate from '@babel/generator';
import { format } from 'prettier';
import { pascalCase } from 'pascal-case';

const parserOpts: ParserOptions = { plugins: ['typescript', 'jsx'] };

function expr(expression: string) {
  return parseExpression(expression, parserOpts);
}

function getComponentName(fieldId: string) {
  return `${pascalCase(fieldId)}FieldComponent`;
}

function getInitialValue(field: Field) {
  const { initial_value } = field;
  if (initial_value) return initial_value;
  const { multi } = field as FieldAppendable;
  if (multi) {
    if (typeof multi === 'object' && multi.min)
      return Array.from(Array(multi.min)).map(() => '');
    return [''];
  }
  return '';
}

function getInitialValues(fields: Field[]) {
  return fields.reduce((acc, field) => {
    const { field_id } = field;
    return {
      ...acc,
      [field_id]: getInitialValue(field),
    };
  }, {} as Record<string, any>);
}

function genInputHTMLComponent(field: Field) {
  const { type, disabled_if, supplemental_text, valid_if } = field;
  const { placeholder_text } = field as HTMLTextboxLikeField;
  const inputAttrs: string[] = [];
  const fieldAttrs: string[] = [];

  if (disabled_if) inputAttrs.push(`disabled={disabled}`);
  if (placeholder_text) inputAttrs.push(`placeholder="${placeholder_text}"`);
  if (
    valid_if &&
    !validateCond(type, (field as FieldAppendable).multi, '', valid_if)
  )
    fieldAttrs.push(`required`);
  if (supplemental_text)
    fieldAttrs.push(`supplementalText="${supplemental_text}"`);

  fieldAttrs.push(`{...props}`);
  inputAttrs.push(`{...props}`);

  const inputHTMLName = (field as FieldAppendable).multi
    ? 'MultiInputHTML multi={(fieldMap.get(props.name) as FieldAppendable).multi}'
    : 'SingleInputHTML';
  function getFieldComponentName() {}

  switch (type) {
    case 'text':
    case 'email':
    case 'url':
    case 'uuid':
    case 'number':
    case 'date':
    case 'datetime-local':
    case 'time':
    case 'month':
    case 'color':
    case 'tel':
    case 'range':
      return `<InputFieldComponent ${fieldAttrs.join('\n')}>
                <${inputHTMLName} component="input" ${inputAttrs.join('\n')} />
              </InputFieldComponent>`;

    case 'checkbox': {
      const { options, field_id } = field as HTMLCheckboxField;
      if (!options) {
        return `<InputFieldComponent ${fieldAttrs.join('\n')}>
                  <SingleInputHTML component="input" ${inputAttrs.join('\n')} />
                </InputFieldComponent>`;
      }
      const entries = Array.from(Object.entries(options));
      return `<InputFieldComponent ${fieldAttrs.join('\n')}>
                ${entries.map(([value, label]) => {
                  // TODO: should be `${field_id}.${index}`
                  return `
                    <label>
                        <SingleFieldComponent component="input"
                                              ${inputAttrs.join('\n')}
                                              name="${field_id}.${value}"
                        />
                        <span>${label}</span>
                    </label>
                  `;
                })}
              </InputFieldComponent>`;
    }

    case 'select': {
      const { options } = field as HTMLSelectField;
      const entries = Array.from(Object.entries(options));
      return `<InputFieldComponent ${fieldAttrs.join('\n')} >
                <${inputHTMLName} component="select" ${inputAttrs.join('\n')}>
                  ${entries
                    .map(
                      ([value, label]) =>
                        `<option value="${value}">${label}</option>`,
                    )
                    .join('\n')}
                </${inputHTMLName}>
              </InputFieldComponent>`;
    }
    case 'radio': {
      const { options, field_id } = field as HTMLRadioField;
      const entries = Array.from(Object.entries(options));
      return `<InputFieldComponent ${fieldAttrs.join('\n')} >
                <SingleInputHTML component="select" ${inputAttrs.join('\n')}>
                  ${entries
                    .map(
                      ([value, label]) =>
                        `<label>
                                <SingleInputHTML value="${value}"
                                                 name="${field_id}"
                                                 type="${type}"
                                / >
                                <span>${label}</span>
                             </label>`,
                    )
                    .join('\n')}
                </${inputHTMLName}>
              </InputFieldComponent>`;
    }
    default:
      throw new Error(`Never: ${type} is not valid field.type.`);
  }
}

function getImportDeclaration(locals: string[], moduleName: string) {
  return {
    type: 'ImportDeclaration',
    importKind: 'value',
    specifiers: locals.map((local) => ({
      type: 'ImportSpecifier',
      imported: {
        type: 'Identifier',
        name: local,
      },
      local: {
        type: 'Identifier',
        name: local,
      },
    })),
    source: {
      type: 'StringLiteral',
      value: moduleName,
    },
  };
}

export function genForm(schema: Application) {
  const { fields } = schema;
  const p = program([
    // Import and export declarations
    {
      type: 'ImportDeclaration',
      importKind: 'value',
      specifiers: [
        {
          type: 'ImportDefaultSpecifier',
          local: {
            type: 'Identifier',
            name: 'React',
          },
        },
        {
          type: 'ImportSpecifier',
          imported: {
            type: 'Identifier',
            name: 'useState',
          },
          local: {
            type: 'Identifier',
            name: 'useState',
          },
        },
        {
          type: 'ImportSpecifier',
          imported: {
            type: 'Identifier',
            name: 'useEffect',
          },
          local: {
            type: 'Identifier',
            name: 'useEffect',
          },
        },
      ],
      source: {
        type: 'StringLiteral',
        value: 'react',
      },
    },
    getImportDeclaration(
      ['Formik', 'Form', 'useFormikContext', 'FormikConfig'],
      'formik',
    ),
    getImportDeclaration(['FieldMap', 'Field'], '@omega/core'),
    getImportDeclaration(
      [
        'InputFieldProps',
        'createValidator',
        'testCondRoot',
        'SingleInputHTML',
        'MultiInputHTML',
        'InputFieldComponent',
      ],
      '@omega/runtime',
    ),
    {
      type: 'ExportNamedDeclaration',
      exportKind: 'type',
      specifiers: [],
      source: null,
      leadingComments: [{ type: 'CommentBlock', value: ' Form value type ' }],
      declaration: {
        type: 'TSTypeAliasDeclaration',
        id: {
          type: 'Identifier',
          name: 'FieldValueTypes',
        },
        typeAnnotation: {
          type: 'TSTypeLiteral',
          members: fields.map(({ field_id, type }) => ({
            type: 'TSPropertySignature',
            key: {
              type: 'StringLiteral',
              value: field_id,
            },
            computed: false,
            typeAnnotation: {
              type: 'TSTypeAnnotation',
              typeAnnotation: getFieldValueType(type),
            },
          })),
        },
      },
    },

    // export const fieldMap = ...
    {
      leadingComments: [
        {
          type: 'CommentBlock',
          value: ' export const fieldMap: FieldMap = ... ',
        },
      ],
      type: 'ExportNamedDeclaration',
      exportKind: 'value',
      specifiers: [],
      source: null,
      declaration: {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'fieldMap',
              typeAnnotation: {
                type: 'TSTypeAnnotation',
                typeAnnotation: {
                  type: 'TSTypeReference',
                  typeName: {
                    type: 'Identifier',
                    name: 'FieldMap',
                  },
                },
              },
            },
            init: {
              type: 'NewExpression',
              callee: {
                type: 'Identifier',
                name: 'Map',
              },
              typeParameters: {
                type: 'TSTypeParameterInstantiation',
                params: [
                  {
                    type: 'TSStringKeyword',
                  },
                  {
                    type: 'TSTypeReference',
                    typeName: {
                      type: 'Identifier',
                      name: 'Field',
                    },
                  },
                ],
              },
              arguments: [
                {
                  type: 'ArrayExpression',
                  elements: fields.map((field) => ({
                    type: 'ArrayExpression',
                    elements: [
                      { type: 'StringLiteral', value: field.field_id },
                      expr(JSON.stringify(field)),
                    ],
                  })),
                },
              ],
            },
          },
        ],
        kind: 'const',
      },
    },

    // export const AgeField: React.FC<InputFieldProps> = (props) => {
    ...fields.map((field) => {
      const { field_id, shown_if, disabled_if } = field;
      const componentName = getComponentName(field_id);

      return {
        leadingComments: [
          {
            type: 'CommentBlock',
            value: ` Component function for "${field.field_id}" `,
          },
        ],
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        specifiers: [],
        source: null,
        declaration: {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: {
                type: 'Identifier',
                name: componentName,
                typeAnnotation: {
                  type: 'TSTypeAnnotation',
                  typeAnnotation: {
                    type: 'TSTypeReference',
                    typeName: {
                      type: 'TSQualifiedName',
                      left: {
                        type: 'Identifier',
                        name: 'React',
                      },
                      right: {
                        type: 'Identifier',
                        name: 'FC',
                      },
                    },
                    typeParameters: {
                      type: 'TSTypeParameterInstantiation',
                      params: [
                        {
                          type: 'TSTypeReference',
                          typeName: {
                            type: 'Identifier',
                            name: 'InputFieldProps',
                          },
                        },
                      ],
                    },
                  },
                },
              },
              init: expr(`

(props) => {
  ${
    shown_if || disabled_if
      ? `const { values, touched } = useFormikContext<FieldValueTypes>();`
      : ''
  }

  ${
    shown_if
      ? `
    /* shown_if */
    const [shown, setShown] = useState(
      testCondRoot(fieldMap.get('${field_id}')!.shown_if!, values, fieldMap),
    );
    useEffect(
      () => setShown(testCondRoot(fieldMap.get('${field_id}')!.shown_if!, values, fieldMap)),
      [ ${Object.keys(shown_if)
        .map(
          (dependeeFieldId) =>
            `values.${dependeeFieldId}, touched.${dependeeFieldId}`,
        )
        .join(', ')} ],
    );
  `
      : ''
  }

  ${
    disabled_if
      ? `
    /* disabled_if */
    const [disabled, setDisabled] = useState(
      testCondRoot(fieldMap.get('${field_id}')!.disabled_if!, values, fieldMap),
    );
    useEffect(
      () => setDisabled(testCondRoot(fieldMap.get('${field_id}')!.disabled_if!, values, fieldMap)),
      [ ${Object.keys(disabled_if)
        .map(
          (dependeeFieldId) =>
            `values.${dependeeFieldId}, touched.${dependeeFieldId}`,
        )
        .join(', ')} ],
    );
  `
      : ''
  }

  ${shown_if ? `if (!shown) return <></>;` : ''}

  return ${genInputHTMLComponent(field)};
}

`),
            },
          ],
          kind: 'const',
        },
      };
    }),
    {
      type: 'ExportNamedDeclaration',
      exportKind: 'type',
      specifiers: [],
      source: null,
      declaration: {
        type: 'TSTypeAliasDeclaration',
        id: {
          type: 'Identifier',
          name: 'FormComponentProps',
        },
        typeAnnotation: {
          type: 'TSTypeReference',
          typeName: {
            type: 'Identifier',
            name: 'Omit',
          },
          typeParameters: {
            type: 'TSTypeParameterInstantiation',
            params: [
              {
                type: 'TSTypeReference',
                typeName: {
                  type: 'Identifier',
                  name: 'FormikConfig',
                },
                typeParameters: {
                  type: 'TSTypeParameterInstantiation',
                  params: [
                    {
                      type: 'TSTypeReference',
                      typeName: {
                        type: 'Identifier',
                        name: 'FieldValueTypes',
                      },
                    },
                  ],
                },
              },
              {
                type: 'TSLiteralType',
                literal: {
                  type: 'StringLiteral',
                  value: 'initialValues',
                },
              },
            ],
          },
        },
      },
      leadingComments: [
        {
          type: 'CommentBlock',
          value: ' Form component ',
        },
      ],
    },

    {
      type: 'ExportNamedDeclaration',
      exportKind: 'value',
      specifiers: [],
      source: null,
      declaration: {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'FormComponent',
              typeAnnotation: {
                type: 'TSTypeAnnotation',
                typeAnnotation: {
                  type: 'TSTypeReference',
                  typeName: {
                    type: 'TSQualifiedName',
                    left: {
                      type: 'Identifier',
                      name: 'React',
                    },
                    right: {
                      type: 'Identifier',
                      name: 'FC',
                    },
                  },
                  typeParameters: {
                    type: 'TSTypeParameterInstantiation',
                    params: [
                      {
                        type: 'TSTypeReference',
                        typeName: {
                          type: 'Identifier',
                          name: 'FormComponentProps',
                        },
                      },
                    ],
                  },
                },
              },
            },
            init: expr(`
({children, ...props}) => (
    <Formik
        validate={createValidator(fieldMap)}
        initialValues={${JSON.stringify(
          getInitialValues(fields),
          undefined,
          2,
        )} as any}
        { ...props }
    >
      <Form className="omega-form">
        <div className="omega-form__fields">
          {children}
          ${fields
            .map((field) => {
              const { field_id, type, label } = field;
              return `<${getComponentName(field_id)}
                      name="${field_id}"
                      type="${type}"
                      label="${label}"
              />`;
            })
            .join('')}
        </div>
        <div className="omega-form__buttons">
          <button className="omega-form__button omega-form__button--primary" type="submit">Submit</button>
        </div>
      </Form>
    </Formik>
)
            `),
          },
        ],
        kind: 'const',
      },
    },
  ] as any);

  const { code } = generate(p);

  // return code;

  // TODO: Remove unused imports, TS errors in generated sources otherwise
  return format(code, { parser: 'typescript' });
}
