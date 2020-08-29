import {
  tsStringKeyword,
  tsNumberKeyword,
  tsBooleanKeyword,
} from '@babel/types';
import { FieldTypes } from '@omega/core';

export function getFieldType(type: FieldTypes) {
  switch (type) {
    case 'text':
    case 'email':
    case 'url':
    case 'uuid':
      return tsStringKeyword();
    case 'number':
      return tsNumberKeyword();
    case 'checkbox':
      return tsBooleanKeyword();
    case 'date':
      return tsStringKeyword();
    default:
      throw new Error(`${type} is not a valid field.type.`);
  }
}
