import { Application } from '@omega/core';
import { genForm } from './gen';

const cases: Application[] = [
  {
    application_id: 'user',
    label: 'User',
    version: '1.0.0',
    fields: [
      { field_id: 'name', label: 'Name', type: 'text' },
      { field_id: 'age', label: 'Age', type: 'number' },
      // {
      //   field_id: 'sex',
      //   label: 'Sex',
      //   type: 'select',
      //   options: {
      //     male: 'Male',
      //     female: 'Female',
      //     na: 'N/A',
      //   },
      // },
    ],
  },
  {
    application_id: 'user',
    label: 'User',
    version: '1.0.0',
    fields: [
      {
        field_id: 'name',
        label: 'Name',
        type: 'text',
        valid_if: { $required: true },
      },
      {
        field_id: 'age',
        label: 'Age',
        type: 'number',
        valid_if: { $required: true },
        shown_if: { name: { $required: true } },
        disabled_if: { name: { $required: true } },
      },
    ],
  },
];

test.each(cases)('genForm %p', (app) => expect(genForm(app)).toMatchSnapshot());
