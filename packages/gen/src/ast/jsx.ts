import {
  booleanLiteral,
  BooleanLiteral,
  identifier,
  Identifier,
  JSXAttribute,
  jsxAttribute,
  jsxClosingElement,
  jsxElement,
  JSXElement,
  jsxExpressionContainer,
  JSXExpressionContainer,
  jsxIdentifier,
  jsxOpeningElement,
  JSXSpreadChild,
  JSXText,
  numericLiteral,
  NumericLiteral,
  stringLiteral,
  StringLiteral,
} from '@babel/types';

export type JSXChild =
  | JSXText
  | JSXExpressionContainer
  | JSXSpreadChild
  | JSXElement;
// type JSXAttr =
//     | JSXElement
//     | JSXFragment
//     | StringLiteral
//     | JSXExpressionContainer
//     | null;

function createLiteral(
  value: string | boolean | number | null | undefined,
): StringLiteral | BooleanLiteral | NumericLiteral | Identifier {
  switch (typeof value) {
    case 'string':
      return stringLiteral(value);
    case 'boolean':
      return booleanLiteral(value);
    case 'number':
      return numericLiteral(value);
    default:
      return identifier('undefined');
  }
}

export function createAttributes(
  attributes: Record<string, string | boolean | undefined>,
) {
  return Object.entries(attributes).map(([name, value]) => {
    return jsxAttribute(
      jsxIdentifier(name),
      jsxExpressionContainer(createLiteral(value)),
    );
  });
}

export function createElement(
  name: string,
  attributes: JSXAttribute[],
  children?: JSXChild[],
) {
  if (!Array.isArray(attributes)) {
    attributes = createAttributes(attributes);
  }
  return jsxElement(
    jsxOpeningElement(jsxIdentifier(name), attributes),
    jsxClosingElement(jsxIdentifier(name)),
    children || [],
    !children,
  );
}
