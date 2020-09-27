import { validateCond } from './cond';
import { Cond } from './types/cond';
import { AllowedFieldTypes, AppendableOpts } from './types/field';

const testTypes = [
  'text',
  'email',
  'url',
  'uuid',
  'number',
  'checkbox',
  'date',
];

const testValues: any[] = [
  '',
  'Carrie Mathison',
  '123e4567-e89b-12d3-a456-426614174000',
  'true',
  'false',
  true,
  false,
  '8',
  '-8',
  8,
  -8,
  0,
  '2020-10-10T10:10:00.000Z',
  '9999-99-99T10:10:00.000Z',
  null,
  undefined,
];

const testConds: Cond[] = [
  {},
  { $required: true },
  { $in: ['Carrie Mathison', false, 8] },
  { $nin: ['Carrie Mathison', false, 8] },
  { $eq: 'Carrie Mathison' },
  { $ne: 'Carrie Mathison' },
  { $gt: 4 },
  { $gt: 4, $lt: 8 },
  { $gte: 4 },
  { $gte: 4, $lte: 8 },
  { $and: { $gte: 8, $integer: true } },
  { $or: { $gte: 8, $integer: true } },
  { $not: { $gte: 8, $integer: true } },
];

const cases: [string, AppendableOpts, any, Cond][] = [];
for (const t of testTypes)
  for (const m of [true, false, { min: 1, max: 3 }])
    for (const v of testValues)
      for (const c of testConds) cases.push([t, m, v, c]);

// const x: [string, any, Cond][] = [
//     ["text", "", { '$required': true } ],
// ]

test.each(cases)('testCond %p, %p, %o', (type, multi, value, cond) => {
  const errorMessages: string[] = [];
  try {
    const isValid = validateCond(
      type as AllowedFieldTypes,
      multi,
      value,
      cond,
      errorMessages,
    );
    expect([isValid, errorMessages[0]].join(', ')).toMatchSnapshot();
  } catch (err) {
    expect(err.stack).toContain('TypeError: ');
  }
});
