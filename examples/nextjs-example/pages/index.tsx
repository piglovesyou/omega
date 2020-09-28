import { useCallback, useState, FC } from 'react';
import Head from 'next/head';
import { FormComponent as ExampleFormComponent } from '../__generated__/example-app/form';
import { FormComponent as AllFieldTypesComponent } from '../__generated__/all-field-types/form';

const Tab: FC<{
  setSelectedIndex: any;
  selectedIndex: number;
  items: string[];
}> = ({ selectedIndex, setSelectedIndex, items }) => (
  <div className="omega-form-tab">
    {items.map((item, i) => (
      <button
        key={i}
        className={`omega-form-tab-item ${
          selectedIndex === i ? 'omega-form-tab-item--selected' : ''
        }`}
        onClick={() => setSelectedIndex(i)}
      >
        {item}
      </button>
    ))}
  </div>
);

export default function Application() {
  const [selectedIndex, setSelectedIndex] = useState(1);
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

      {selectedIndex === 0 && <ExampleFormComponent onSubmit={onSubmit} />}
      {selectedIndex === 1 && <AllFieldTypesComponent onSubmit={onSubmit} />}

      <Tab
        setSelectedIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
        items={['Simple example', 'All field types']}
      />

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
