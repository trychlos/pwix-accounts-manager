# pwix:accounts-manager

## What is it ?

A try to mutualize and factorize the most common part of a simple accounts management system:

- defines the account schema and provides client and server check functions

- provides components to list and edit accounts.

Most of the configuration is done through the provided class which must be insciated in common application code.

## Provides

### `AccountsManager`

The exported `AccountsManager` global object provides following items:

#### Classes

##### `AccountsManager.amClass`

The `AccountsManager.amClass` class notably determines which schema is handled in which collection. All permissions are also managed at this class level.

The `AccountsManager.amClass` class extends the `AccountsHub.ahClass` and so takes all its instanciation arguments. Like this later, it must be instanciated by the application in its common code.

Constructor takes an object as single argument, with following keys:

- `baseFieldset`

    When set, the `baseFieldset` is expected to provide a `Field.Set` definition for schema, tabular and forms handlings.

    It defaults to a standard (though a bit extended) schema from Meteor `accounts-base` as:

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

    Providing a `baseFieldset` replaces the above default fieldset definition.

- `additionalFieldset`

    When set, let the application extends the above default fieldset by providing additional fields as a `Field.Set` definition.

    Defauts to nothing.

    Example:

```js
    additionalFieldset: [
        {
            before: 'createdAt',
            fields: [
                {
                    name: 'apiAllowed',
                    type: Boolean,
                    defaultValue: false
                }
            ]
        }
    ]
```

- `allowFn`

    An async function which will be called with an action string identifier, and must return whether the current user is allowed to do the specified action.

    If the function is not provided, then the default is to deny all actions (and do you really want that ?).

    `allowFn` prototype is: `async allowFn( action<String>, userId<String> [, ...<Any> ] ): Boolean`

- `classes`

    Let the application provides some classes to add to the display. The classes mentionned here are added to the configured values if any.

    Defauts to nothing.

- `clientNewFn`

    A client-side function to insert a new account.

    Defaults to `AccountsUI.Features.createUser` for the `users` collection, or a warning message else.

    Prototype must be `async clientNewFn( item<Object> [, clientNewArgs ]): Boolean`.

- `clientNewArgs`

    Arguments to be passed to above `clientNewFn`, defaulting to none.

- `clientUpdateFn`

    A client-side function to update an account.

    Defaults to none.

    Prototype must be `async clientUpdateFn( item<Object> [, clientUpdateArgs ]): Boolean`.

- `clientUpdateArgs`

    Arguments to be passed to above `clientUpdateFn`, defaulting to none.

- `closeAfterNew`

    Whether the 'new account' dialog should be closed after having successfully created a new account, defaulting to `true`.

    When `false`, the 'new account' dialog is cleared after successful creation, and can be reused to define other new accounts.

- `feedNow`

    Whether the class should subscribe to the `all` publication to feed its internal list as soon as it is instanciated, defaulting to `true`.

    Note that this will run a `Meteor.subscribe()` function from inside a `Tracker.autorun()` computation code and is so subject to the usual limitations and caveats of Meteor computations.

- `hideDisabled`

    Whether to hide disabled actions instead of displaying the disabled state.

    Defaults to `true`: disabled actions are hidden.

- `haveIdent`

    Whether to display the 'ident' panel, defaulting to `true`.

- `haveRoles`

    Whether to display a Roles panel, defaulting to `true`.

    For the Roles panel be actually displayed, this `haveRoles` argument must be `true`, **AND** the `pwix:roles` package must be used by the application (it is not _used_ by this package).

- `preNewFn`

- `postNewFn`

- `preUpdateFn`

- `postUpdateFn`

    Async functions which are called for the relative operation.

    Prototype is: `async preNewFn( item<Object>)`.

    These let the caller a chance to modify the item before/after the database insert/update.

- `preferredLabel`

    Overrides the default `AccountsHub.preferredLabel()`.

    If provided, the function must have the same prootype than the default:

```js
    /**
     * @locus Anywhere
     * @param {String|Object} arg the user identifier or the user document
     * @param {String} preferred the optional caller preference, either AccountsHub.C.PreferredLabel.USERNAME or AccountsHub.C.PreferredLabel.EMAIL_ADDRESS,
     *  defaulting to the value configured at instanciation time
     * @returns {Promise} a Promise which eventually will resolve to an object with following keys:
     *  - label: the computed preferred label
     *  - origin: the origin, which may be 'ID' or AccountsHub.C.PreferredLabel.USERNAME or AccountsHub.C.PreferredLabel.EMAIL_ADDRESS
     */
```

- `serverTabularExtend`

    A server-side function which comes to extend the content of the dataset published for the tabular display.

    The function get the current entity item as its unique argument and returns a Promise when finished with its job.

    Defaults to `null`.

- `withGlobals`

    Whether the Roles panel, when displayed, should include a "Global roles" pane, defaulting to `true`.

- `withScoped`

    Whether the Roles panel, when displayed, should include a "Scoped roles" pane, defaulting to `true`.

- `scopesFn`

    An application-provided async function which is expected to return all existing (roles) scopes.

    Defaults to only manage scopes that are already used in the `Roles` package.

- `tabularActiveCheckboxes`

    Whether the checkboxes rendered in the tabular display are active, i.e. accept a click to switch their state.

    Rationale: even if it would be very more easy to directly click on the tabular display to toggle a checkbox, some administrators may find this way too much easy, if not error prone, and prefer to have to pass through a distinct page/modal/display unit to securize a bit this update.

    Defaults to `false`.

- `tabularFieldsDef`

    An optional array of columns definitions to replace the default tabular display.

    Defaults to none.

Each managed collection is made timestampable, and following fields are added (and maintained) to the fieldset definition:

```js
    createdAt
    updatedAt
    createdBy
    updatedBy
```

#### Functions

##### `AccountsManager.configure( o<Object> )`

See [below](#configuration)

##### `AccountsManager.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

##### `AccountsManager.isAllowed()`

Manages permissions to the accounts manager.

Prototype is `async AccountsManager.isAllowed( action<String>, userId<String>, args<Object> ): Boolean`.

The provided `args` argument MUST contain an `amInstance` key with an instance of `AccountsManager.amClass`.

Available both on the client and the server.

#### Events

On server side, `AccountsManager.s.eventEmitter` is an event emitter, and emits:

- `create`, when a new account is about to be created, only on the `users` collection, with an object as argument containing:

    - `amInstance`: the instance name
    - `item`: the account to be created.

- `update`, after an item has been updated, on any collection, with an object as argument containing:

    - `amInstance`: the instance name
    - `item`: the updated item.

- `delete`, after an item has been deleted, on any collection, with an object as argument containing:

    - `amInstance`: the instance name
    - `id`: the identifier of the deleted item.

### Blaze components

#### `AccountEditPanel`

A tabbed editing panel to be run inside of a page or of a modal. Default tabs are named and ordered as:

- `account_ident_tab`
- `account_admin_notes_tab`
- `account_user_notes_tab`

If the `pwix:roles` package is used by the application, a `account_roles_tab` is inserted before `admin_notes_tab`.

When run from [`AccountsList`](#accountslist), it is run in a modal to edit the current item.

#### `AccountNewButton`

A `PlusButton` component customized to create a new account.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either is disabled, or doesn't display at all if the user is not allowed.

It takes the very same data context than below `AccountsList`.

#### `AccountsList`

The component list the defined accounts as a `pwix:tabular` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either disabled, or doesn't display at all, the relevant buttons if the user is not allowed.

Known data context is:

- `name`

    The collection name to list, defaulting to standard Meteor `users`

- `tabs`

    An optional array of tabs to be displayed before the 'roles' tab (if any).

- `tabsBefore`

    An optional array of tabs to be displayed before the 'ident_tab' tab.

- `tabsUpdates`

    An optional object where keys are the name of the targeted tab, and the value an object which describes the update.

    E.g.

```js
    tabsUpdates: {
        account_ident_tab: {
            navLabel: 'Email & password'
        },
        account_admin_notes_tab: {
            shown: false
        }
```

- `editTitle`

    An optional function to be called with the to-be-edited item as an argument, expected to return the dialog title.

## Permissions management

This package can take advantage of `pwix:permissions` package to manage the user permissions.

It defines following tasks:
- `pwix.accounts_manager.feat.list`: list all accounts, with additional arguments as an object with following keys:
    - amInstance: the `amClass` instance

- `pwix.accounts_manager.feat.create`: create a new account, with additional arguments as an object with following keys:
    - amInstance: the `amClass` instance

- `pwix.accounts_manager.feat.edit`: update the user account, with additional arguments as an object with following keys:
    - amInstance: the `amClass` instance
    - id: the account identifier

- `pwix.accounts_manager.fn.delete`: remove the identified account, with additional arguments as an object with following keys:
    - amInstance: the `amClass` instance
    - id: the account identifier

## Configuration

This package relies on `pwix:accounts-conf` package for most of its configuration. Please see the relevant documentation.

This package's behavior can be configured through a call to the `AccountsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `classes`

    Let the application provides some classes to add to the display.

    Defauts to nothing.

- `datetime`

    The `strftime` format string used to display date and time timestamps.

    Defaults to `%Y-%m-%d %H:%M:%S`.

- `verbosity`

    The verbosity level as:

    - `AccountsManager.C.Verbose.NONE`

    or an OR-ed value of integer constants:

    - `AccountsManager.C.Verbose.CONFIGURE`

        Trace configuration operations

    - `AccountsManager.C.Verbose.FUNCTIONS`

        Trace functions calls

    Defaults to `AccountsManager.C.Verbose.CONFIGURE`.

A function can be provided by the application for each of these parameters. The function will be called without argument and must return a suitable value.

Please note that `AccountsManager.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `AccountsManager.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

`AccountsManager.configure()` is a reactive data source.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 2.1.0:

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
- Last updated on 2024, Nov. 19th
