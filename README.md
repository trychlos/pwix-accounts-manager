# pwix:accounts-manager

## What is it ?

A try to mutualize and factorize the most common part of a simple accounts management system:

- defines the account schema and provides client and server check functions

- provides components to list and edit accounts.

## Schema

`pwix:accounts-manager` is based on Meteor `accounts-base`, and extends its standard schema as:

```js
    {
        _id: {
            type: String
        },
        emails: {
            type: Array,
            optional: true
        },
        'emails.$': {
            type: Object
        },
        'emails.$.address': {
            type: String,
            regEx: SimpleSchema.RegEx.Email,
        },
        'emails.$.verified': {
            type: Boolean
        },
        username: {
            type: String,
            optional: true
        },
        profile: {
            type: Object,
            optional: true,
            blackbox: true
        },
        services: {
            type: Object,
            optional: true,
            blackbox: true
        },
        lastConnection: {
            type: Date
        },
        loginAllowed: {
            type: Boolean,
            defaultValue: true
        },
        userNotes: {
            type: String
        },
        adminNotes: {
            type: String
        }
    }
```

As it also makes the collection timestampable, following fields are also added and maintained:

```js
    createdAt
    updatedAt
    CreatedBy
    updatedBy
```

## Provides

### `AccountsManager`

The exported `AccountsManager` global object provides following items:

#### Functions

#### Blaze components

##### `AccountEditPanel`

A tabbed editing panel to be run inside of a page or of a modal.

When run from (below) `AccountsList`, it is run in a modal to edit the current item.

##### `AccountNewButton`

A `PlusButton` component customized to create a new account.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either is disabled, or doesn't display at all if the user is not allowed.

##### `AccountsList`

The component list the defined accounts as a `pwix:tabular` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either disabled, or doesn't display at all, the relevant buttons if the user is not allowed.

Known data context is:

- `classes`: the classes to be added to any display, defaulting to none

- `disableUnallowed`: whether to display the unallowed functions as disabled buttons, defaulting to `true`.

    When `false`, the unallowed functions links are not displayed at all.

## Configuration

The package's behavior can be configured through a call to the `AccountsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `classes`

    Let the application provides some classes to add to the display.

    Defauts to nothing.

- `fieldsSet`

    Let the application extends the default schema by providing additional fields as a `Forms.FieldSet` definition.

    Defauts to nothing.

    Example:

```js
    AccountsManager.configure({
        fieldsSet: new Forms.FieldsSet(
            {
                name: 'apiAllowed',
                type: Boolean,
                defaultValue: false
            }
        ),
        //haveEmailAddress: AC_FIELD_MANDATORY,
        //haveUsername: AC_FIELD_NONE
        roles: {
            list: 'ACCOUNTS_LIST',
            create: 'ACCOUNT_CREATE',
            edit: 'ACCOUNT_EDIT',
            delete: 'ACCOUNT_DELETE'
        }
        // verbosity: AccountsManager.C.Verbose.CONFIGURE
    });
```

- `haveEmailAddress`
- `haveUsername`

    Whether the user accounts are to be configured with or without a username (resp. an email address), and whether it is optional or mandatory.

    For each of these terms, accepted values are:

    - `AccountsManager.C.Input.NONE`: the field is not displayed nor considered
    - `AccountsManager.C.Input.OPTIONAL`: the input field is proposed to the user, but may be left empty
    - `AccountsManager.C.Input.MANDATORY`: the input field must be filled by the user

    At least one of these fields MUST be set as `AccountsManager.C.Input.MANDATORY`. Else, the default value will be applied.

    Defauts to:

    - `haveEmailAddress`: `AccountsManager.C.Input.MANDATORY`
    - `haveUsername`: `AccountsManager.C.Input.NONE`

    Please be conscious that some features of your application may want display an identifier for each user. It would be a security hole to let the application display a verified email address anywhere, as this would be some sort of spam magnet!

- `hideDisabled`

    Whether to hide disabled actions instead of displaying the disabled state.

    Defaults to `true`: disabled actions are hidden.

- `roles`

    Let the application provides the permissions required to perform CRUD operations on the Users collection. This is an object with following keys:

    - `list`: defaulting to `null` (allowed to all)
    - `create`: defaulting to `null` (allowed to all)
    - `edit`: defaulting to `null` (allowed to all)
    - `delete`: defaulting to `null` (allowed to all)

- `scopesFn`

    An application-provided function which is expected to return all existing (roles) scopes.

    Defaults to only manage scopes that are already used in the `Roles` package.

- `verbosity`

    The verbosity level as:

    - `AccountsManager.C.Verbose.NONE`

    or an OR-ed value of integer constants:

    - `AccountsManager.C.Verbose.CONFIGURE`

        Trace configuration operations

    Defaults to `AccountsManager.C.Verbose.CONFIGURE`.

A function can be provided by the application for each of these parameters. The function will be called without argument and must return a suitable value.

Please note that `AccountsManager.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `AccountsManager.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

`AccountsManager.configure()` is a reactive data source.

## NPM peer dependencies

Starting with v 0.1.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 0.3.0:

```js
    '@popperjs/core': '^2.11.6',
    'bootstrap': '^5.2.1',
    'lodash': '^4.17.0'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

None at the moment.

## Cookies and comparable technologies

None at the moment.

## Issues & help

In case of support or error, please report your issue request to our [Issues tracker](https://github.com/trychlos/pwix-accounts-manager/issues).

---
P. Wieser
- Last updated on 2024, May. 24th
