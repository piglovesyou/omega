import Head from 'next/head';
import { FormComponent } from '../__generated__/user-account/form';

export default function Application() {
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
      <FormComponent
        onSubmit={(values) =>
          alert(`👍\n\nYou posted:\n${JSON.stringify(values, undefined, 2)}`)
        }
      />
      <hr />
      <p className="my-trailing-text">
        This is a demonstration of{' '}
        <a href="https://github.com/piglovesyou/omega">omega</a>, a toolset
        that generates web application source from{' '}
        <a href="https://github.com/piglovesyou/omega/blob/master/examples/nextjs-example/schema/my-app.yml">
          a yaml
        </a>
        .
      </p>
    </div>
  );
}
