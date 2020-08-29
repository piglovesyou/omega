import { Field } from './field';

export type Application = {
  application_id: string;
  label: string;
  version: string | number;
  fields: Field[];
};
