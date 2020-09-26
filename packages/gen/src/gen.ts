import { Application, Field, SelectField, validateCond } from '@omega/core';
import { getFieldType } from './ast/field';
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

function genInputHTMLComponent(field: Field) {
  const {
    type,
    disabled_if,
    supplemental_text,
    placeholder_text,
    valid_if,
    multi,
  } = field;
  const inputAttrs: string[] = [];
  const fieldAttrs: string[] = [];

  if (disabled_if) inputAttrs.push(`disabled={disabled}`);
  if (placeholder_text) inputAttrs.push(`placeholder="${placeholder_text}"`);
  if (valid_if && !validateCond(type, '', valid_if))
    fieldAttrs.push(`required`);
  if (supplemental_text)
    fieldAttrs.push(`supplementalText="${supplemental_text}"`);

  fieldAttrs.push(`{...props}`);
  inputAttrs.push(`{...props}`);

  const inputHTMLName = multi === true ? 'MultiInputHTML' : 'SingleInputHTML';

  switch (type) {
    case 'date':
    case 'checkbox':
    case 'number':
    case 'uuid':
    case 'text':
    case 'email':
    case 'url':
      return `<InputFieldComponent ${fieldAttrs.join('\n')}>
                <${inputHTMLName} component="input" ${inputAttrs.join('\n')} />
              </InputFieldComponent>`;
    case 'select': {
      const { options } = field as SelectField;
      const optionEntires = Array.from(Object.entries(options));
      return `<InputFieldComponent ${fieldAttrs.join('\n')} >
                <${inputHTMLName} component="select" ${inputAttrs.join('\n')}>
                  ${optionEntires
                    .map(
                      ([value, label]) =>
                        `<option value="${value}">${label}</option>`,
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
        'InputFieldComponent',
        'SingleInputHTML',
        'MultiInputHTML',
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
              type: 'Identifier',
              name: field_id,
            },
            computed: false,
            typeAnnotation: {
              type: 'TSTypeAnnotation',
              typeAnnotation: getFieldType(type),
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
          fields.reduce(
            (acc, { field_id, initial_value, multi }) => ({
              ...acc,
              [field_id]: initial_value || multi ? [''] : '',
            }),
            {} as any,
          ),
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

  return format(code, { parser: 'typescript' });
}
