Note: Still in alpha quality.

# omega

Write web apps by YAML.

## Table of Contents

-   [Why](#why)
-   [Abilities](#abilities)
-   [Dateless Milestones](#dateless-milestones)
-   [Next.js example](#nextjs-example)
-   [Sponsoring](#sponsoring)
-   [Licence](#licence)

## Why

Web applicaitons vary, but when we look close especially at **ones in office**,
we notice they all have:

-   Document lists
-   Document forms with validation and dependency
-   Roles and access controls to documents and actions
-   Workflow (who's in charge now and who's next) and actions on corresponding
    workflow states

This idea came to my mind suddenly, says "we've developed the same things and,
platform differs though, we'll be doing it forever".

It'll feed us, but I started to think if there's another approach to deal with
the problem. Omega is a platform to express 90% of ordinary web apps in YAML.

## Abilities

Currently it generates form components composed of [React](http://reactjs.org),
form control of [Formik](https://formik.org) and validation with
[Yup](https://github.com/jquense/yup). The following application schema will
generates a `.tsx` file that you'll probably expect.

```yaml
application_id: user
label: User
version: 1
fields:
    - field_id: name
      label: Name
      type: text
      valid_if:
          $required: true

    - field_id: age
      label: Age
      type: number
      shown_if:
          name:
              $required: true
              $gt: 10
              $lte: 100
```

See the configuration option from
[types](https://github.com/piglovesyou/omega/blob/master/packages/core/src/types/)
as a documentation.

## Dateless Milestones

### Form

-   [x] Command generates `.tsx`
-   [x] Validation by `valid_if`
-   [x] Dependant fields by `shown_if`, `disabled_if`
-   Field types
    -   [x] text
    -   [x] number
    -   [x] checkbox
    -   [x] email
    -   [x] url
    -   [x] date
    -   [x] select
    -   [ ] radio
    -   [ ] textarea
    -   [ ] multiple values of the primitive types
    -   [ ] select value from another applications
        -   [ ] filter, sort, aggregate

### List

-   [ ] Command generates `.tsx`
-   [ ] fiter
-   [ ] sort/multi column sort
-   [ ] aggregate

### Document

-   [ ] Command generates `.tsx`

### Customize

-   [ ] Accept external CSS with Tailwind CSS support
-   [ ] Layout customization using CSS Grid. Maybe turning style.yml into CSS?

### Database

-   [ ] Initialize RDB
-   [ ] Relations between apps
-   [ ] Data migration on version up of applications

### Server process connecting client and database

### Roles

### Workflow

## Next.js example

-   Demonstration: <https://omega-example.vercel.app/>
-   [The source](https://github.com/piglovesyou/omega/tree/master/examples/nextjs-example)

Schema:
<https://github.com/piglovesyou/omega/blob/master/examples/nextjs-example/schema/my-app.yml>

## Sponsoring

[Sponsor me](https://github.com/sponsors/piglovesyou) to support this project.

## Licence

MIT
