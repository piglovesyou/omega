import { join } from 'path';
import { loadApplicationSchema } from './load';

const cwd = join(__dirname, '__fixtures__/load');

describe('load.ts', () => {
  const orig = console.error;
  beforeEach(() => (console.error = () => {}));
  afterEach(() => (console.error = orig));

  test.each([['app_simple.yml'], ['app_complex.yml']])(
    'loads %p',
    async (schemaPath) => {
      const schema = await loadApplicationSchema({
        cwd,
        schemaPath,
      });
      expect(schema).toMatchSnapshot();
    },
  );

  // test('loads complex application schema', async () => {
  //   const schema = await loadApplicationSchema({
  //     cwd,
  //     schemaPath: 'app_complex.yml',
  //   });
  //   expect(schema).toMatchSnapshot();
  // });

  test('cannot load error schema', async () => {
    const fn = () =>
      loadApplicationSchema({ cwd, schemaPath: 'app_error.yml' });
    await expect(fn).rejects.toThrowErrorMatchingSnapshot();
  });
});
