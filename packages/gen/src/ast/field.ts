import {
  tsStringKeyword,
  tsNumberKeyword,
  tsBooleanKeyword,
} from '@babel/types';
import { AllowedFieldTypes } from '@omega/core';

export function getFieldType(type: AllowedFieldTypes) {
  switch (type) {
    case 'text':
    case 'email':
    case 'url':
    case 'uuid':
    case 'select':
      return tsStringKeyword();
    case 'number':
      return tsNumberKeyword();
    case 'checkbox':
      return tsBooleanKeyword();
    case 'date':
      return tsStringKeyword();
    default:
      throw new Error(`Never: ${type} is not a valid field.type.`);
  }
}
