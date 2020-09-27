import Head from 'next/head';
import { useCallback, useState } from 'react';
import { FormComponent as SimpleFormComponent } from '../__generated__/simple-example-app/form';
import { FormComponent as ComplexFormComponent } from '../__generated__/complex-example-app/form';
import { FormComponent as AllTypesFormComponent } from '../__generated__/all-types-example-app/form';

export default function Application() {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const onSubmit = useCallback(
    (values) =>
      alert(`👍\n\nYou posted:\n${JSON.stringify(values, undefined, 2)}`),
    [],
  );
  return (
    <div className="my-form">
      <Head>
        <title>My form | Omega demonstration</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, maximum-scale=1.0, width=device-width"
        />
      </Head>
      <h1>My form</h1>

      {selectedIndex === 0 && <SimpleFormComponent onSubmit={onSubmit} />}
      {selectedIndex === 1 && <ComplexFormComponent onSubmit={onSubmit} />}
      {selectedIndex === 2 && <AllTypesFormComponent onSubmit={onSubmit} />}

      <div className="omega-form-tab">
        <button
          className={`omega-form-tab-item ${
            selectedIndex === 0 ? 'omega-form-tab-item--selected' : ''
          }`}
          onClick={() => setSelectedIndex(0)}
        >
          Simple example
        </button>
        <button
          className={`omega-form-tab-item ${
            selectedIndex === 1 ? 'omega-form-tab-item--selected' : ''
          }`}
          onClick={() => setSelectedIndex(1)}
        >
          Complex example
        </button>
        <button
          className={`omega-form-tab-item ${
            selectedIndex === 2 ? 'omega-form-tab-item--selected' : ''
          }`}
          onClick={() => setSelectedIndex(2)}
        >
          All field types example
        </button>
      </div>

      <hr />
      <p className="my-trailing-text">
        This is a demonstration of{' '}
        <a href="https://github.com/piglovesyou/omega">omega</a>, a toolset that
        generates web application source from{' '}
        <a href="https://github.com/piglovesyou/omega/blob/master/examples/nextjs-example/schema/my-app.yml">
          a yaml
        </a>
        .
      </p>
    </div>
  );
}
