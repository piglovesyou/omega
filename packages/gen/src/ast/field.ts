import {
  tsBooleanKeyword,
  tsNumberKeyword,
  tsStringKeyword,
} from '@babel/types';
import { AllowedFieldTypes } from '@omega/core';

export function getFieldValueType(type: AllowedFieldTypes) {
  switch (type) {
    case 'text':
    case 'email':
    case 'url':
    case 'uuid':
    case 'select':
    case 'date':
    case 'datetime-local':
    case 'time':
    case 'month':
    case 'color':
    case 'tel':
    case 'radio':
    case 'textarea':
      return tsStringKeyword();
    case 'number':
    case 'range':
      return tsNumberKeyword();
    case 'checkbox':
      return tsBooleanKeyword();
    default:
      throw new Error(`Never: ${type} is not a valid field.type.`);
  }
}
