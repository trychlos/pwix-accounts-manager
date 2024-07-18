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
        'emails.$.id': {
            type: String
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

As it also makes the collection timestampable, following fields are added and maintained too:

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

##### `AccountsManager.configure( o<Object> )`

See [below](#configuration)

##### `AccountsManager.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

#### Blaze components

##### `AccountEditPanel`

A tabbed editing panel to be run inside of a page or of a modal. Default tabs are named and ordered as:

- `ident_tab`
- `admin_notes_tab`
- `user_notes_tab`

If the `pwix:roles` package is used by the application, a `roles_tab` is inserted before `admin_notes_tab`.

When run from [`AccountsList`](#accountslist), it is run in a modal to edit the current item.

The `AccountEditPanel` component accepts a data context as:

- `item`: the item to be edited, or null (or unset)

- `tabbed`: the item to be edited, or null (or unset)

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

## Permissions management

This package can take advantage of `pwix:permissions` package to manage the user permissions.

It defines following tasks:

- at the user interface level
    - `pwix.accounts_manager.feat.edit`, with args `user<String|Object>`: edit the `user` account
    - `pwix.accounts_manager.feat.new`: display a button to create a new account

- at the server level
    - `pwix.accounts_manager.fn.removeAccount`, with args `user<String|Object>`: remove the `user` account
    - `pwix.accounts_manager.fn.updateAccount`, with args `user<Object>`: update the `user` account
    - `pwix.accounts_manager.fn.updateAttribute`, with args `user<String|Object>, modifier<Object>`: apply the `modifier` Mongo modifier to the `user` account

- on publications
    - `pwix.accounts_manager.pub.list_all`: list all accounts and their contents (but the `service` and `profile` objects)

## Configuration

This package relies on `pwix:accounts-conf` package for most of its configuration. Please see the relevant documentation.

This package's behavior can be configured through a call to the `AccountsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `allowFn`

    An async function which will be called with an action string identifier, and must return whether the current user is allowed to do the specified action.

    If the function is not provided, then the default is to deny all actions.

    `allowFn` prototype is: `async allowFn( action<String> [, ...<Any> ] ): Boolean`

- `classes`

    Let the application provides some classes to add to the display.

    Defauts to nothing.

- `datetime`

    The `strftime` format string used to display date and time timestamps.

    Defaults to `%Y-%m-%d %H:%M:%S`.

- `fields`

    Let the application extends the default schema by providing additional fields as a `Forms.FieldSet` definition.

    Defauts to nothing.

    Example:

```js
    AccountsManager.configure({
        fields: [
            {
                where: Field.C.Insert.BEFORE,
                name: 'loginAllowed',
                fields: [
                    {
                        name: 'apiAllowed',
                        type: Boolean,
                        defaultValue: false
                    }
                ]
            }
        ]
    });
```

- `hideDisabled`

    Whether to hide disabled actions instead of displaying the disabled state.

    Defaults to `true`: disabled actions are hidden.

- `scopesFn`

    An application-provided function which is expected to return all existing (roles) scopes.

    Defaults to only manage scopes that are already used in the `Roles` package.

- `tabularActiveCheckboxes`

    Whether the checkboxes rendered in the tabular display are active, i.e. accept a click to switch their state.

    Rationale: even if it would be very more easy to directly click on the tabular display to toggle a checkbox, some administrators may find this way too much easy, if not error prone, and prefer to have to pass through a distinct page/modal/display unit to securize a bit this update.

    Defaults to `false`.

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

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.0.0:

```js
    'email-validator': '^2.0.4',
    'lodash': '^4.17.0',
    'strftime': '^0.10.2'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

New and updated translations are willingly accepted, and more than welcome. Just be kind enough to submit a PR on the [Github repository](https://github.com/trychlos/pwix-accounts-manager/pulls).

## Cookies and comparable technologies

None at the moment.

## Issues & help

In case of support or error, please report your issue request to our [Issues tracker](https://github.com/trychlos/pwix-accounts-manager/issues).

---
P. Wieser
- Last updated on 2024, Jul. 18th
