# pwix:accounts-manager

## What is it ?

A try to mutualize and factorize the most common parts of a simple accounts management system. It relies on `pwix:accounts-core` and extends it to provide:

- a default schema to the collection, extending the standard `Meteor.users` one with properties:

    - whether the user is allowed to login to the client-side application, and the date and time of hist/her last connection

    - user and administrator notes

    - roles if opted-in for

- Blaze components:

    - to list the accounts

    - to edit an account

    - to select one or several accounts.

In the same way that `pwix:accounts-core`, `pwix:accounts-manager` is able to manage several named accounts collections.

Each managed collection is made timestampable, and following fields are added (and maintained) to the fieldset definition:

```js
    createdAt: Date
    createdBy: String
    updatedAt: Date
    updatedBy: String
```

Most of the configuration is done through the provided class which must be instanciated in common application code, apart from the schema which must be set, extended, updated via the provided method after class instanciation.

## Provides

### `AccountsManager`

The exported `AccountsManager` global object provides following items:

#### Classes

##### `Account`

This is a very thin extend of `AccountsCore.Account` class, and it actually eventually fully replace it. This means that invoking `AccountsCore.Account` and `AccountsManager.Account` provides you exactly the same extended class.

###### Methods

- `amAccount( args<Object> ): <amAccount>`

    The constructor takes an object as single argument, with following keys:

    - `editCloseAfterNew`

        Whether the 'new account' dialog should be closed after having successfully created a new account, defaulting to `true`.

        When `false`, the 'new account' dialog is cleared after successful creation, and can be reused to define other new accounts.

    - `editTabsFn`

        A function which, when set, will receive a list of tab objects to be displayed on edition panel, and must return a list of tab objects.

        Prototype of the function is `async fn( tabs<Array> ): tabs<Array>`, where each array item is an object with following keys:

        - `name`: an optional name for the tab, defaulting to the template name

        - `navLabel`: a localized string to display on the navigation bar

        - `paneTemplate`: the name of the template to be displayed

        - `paneData`: the data context to be provided to the template, as an object or a function, defaulting to the default data context:

            - `item`: a ReactiveVar which holds the account object to edit (may be empty, but not null)
            - `isNew`: true|false
            - `checker`: a ReactiveVar which holds the parent Forms.Checker
            - `amInstance`: a ReactiveVar which holds the amAccount instance

        Default it to have:

        - an identity tab to let the user enter email addresses and usernames
        - a roles tab if the application has roles
        - a tab for admin notes
        - a tab for user notes.

    - `listActiveCheckboxes`

        Whether the checkboxes rendered in the tabular display are active, i.e. accept a click to switch their state, defaulting to `false`.

        Rationale: even if it would be very more easy to directly click on the tabular display to toggle a checkbox, some administrators may find this way too much easy, if not error prone, and prefer to have to pass through a distinct page/modal/display unit to securize a bit this update. The chosen default privileges the security over the esayness.

    - `listFeedNow`

        Whether the class should subscribe to the `all` publication to feed its internal list as soon as it is instanciated, defaulting to `true`.

        Note that this will run a `Meteor.subscribe()` function from inside a `Tracker.autorun()` computation code and is so subject to the usual limitations and caveats of Meteor computations.

    - `scopesFn`

        An application-provided async function which is expected to return all existing (roles) scopes. Prototype is `async scopesFn( instance<amAccount> )`/

        Defaults to only manage scopes that are already used in the `Roles` package.

- `fieldSet(): <Field.Set>`

    This method returns the current `Field.Set` attached to the instance. This lets the caller reset, extend or update the collection fields set. It is the responsability of the caller to extend the previous collection schema to the new one after he/she has updated the fields set as this is not automatic.

    The default fields set is defined at instanciation time, and the corresponding schema attached to the collection at that same time. It is defined as:

```js
    [
        // if have email addresses
        {
            name: 'emails',
            type: Array,
            optional: true,
            dt_visible: false
        },
        {
            name: 'emails.$',
            type: Object,
            optional: true,
            tabular: false
        },
        {
            name: 'emails.$._id',
            type: String,
            dt_data: false,
            dt_visible: false
        },
        {
            name: 'emails.$.address',
            type: String,
            regEx: SimpleSchema.RegEx.Email,
            dt_data: 'emails.0.address',
            dt_title: pwixI18n.label( I18N, 'list.email_address_th' ),
            dt_template: Meteor.isClient && Template.dt_email_addresses,
            form_check: amChecks.email_address,
            form_type: acInstance.emailAtLeastOne() ? Forms.FieldType.C.MANDATORY : Forms.FieldType.C.OPTIONAL
        },
        {
            name: 'emails.$.verified',
            type: Boolean,
            defaultValue: false,
            dt_data: 'emails.0.verified',
            dt_title: pwixI18n.label( I18N, 'list.email_verified_th' ),
            dt_template: Meteor.isClient && Template.dt_email_verified,
            dt_className: 'dt-center',
            dt_orderDataType: 'dom-checkbox',
            form_check: amChecks.email_verified
        },
        {
            name: 'emails.$.preferred',
            type: Boolean,
            optional: true,
            tabular: false,
            form_check: amChecks.email_preferred,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        {
            name: 'emails.$.label',
            type: String,
            optional: true,
            dt_data: 'any',
            dt_title: pwixI18n.label( I18N, 'list.email_label_th' ),
            form_check: amChecks.email_label,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // if have username(s)
        {
            name: 'username',
            type: String,
            optional: true,
            dt_title: pwixI18n.label( I18N, 'list.username_th' ),
            form_check: amChecks.username,
            form_type: acInstance.usernameAtLeastOne() ? Forms.FieldType.C.MANDATORY : Forms.FieldType.C.OPTIONAL
        },
        {
            name: 'usernames',
            type: Array,
            optional: true,
            tabular: false
        },
        {
            name: 'usernames.$',
            type: Object,
            optional: true,
            tabular: false
        },
        {
            name: 'usernames.$.username',
            type: String,
            optional: true,
            tabular: false
        },
        {
            name: 'usernames.$.preferred',
            type: Boolean,
            optional: true,
            tabular: false
        },
        {
            name: 'usernames.$.label',
            type: String,
            optional: true,
            tabular: false
        },
        // for Meteor.users compatibility
        {
            name: 'profile',
            type: Object,
            optional: true,
            blackbox: true,
            tabular: false
        },
        {
            name:  'services',
            type: Object,
            optional: true,
            blackbox: true,
            tabular: false
        },
        // if have roles, define a column to be used in the tabular display
        {
            name: 'roles',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.roles_th' ),
            dt_type: 'string',
            form: false
        },
        // AccountsManager specifics
        {
            name: 'loginAllowed',
            type: Boolean,
            defaultValue: true,
            dt_title: pwixI18n.label( I18N, 'list.login_allowed_th' ),
            dt_className: 'dt-center',
            dt_template: 'dt_checkbox',
            dt_templateContext( rowData ){
                return {
                    item: rowData,
                    readonly: true,
                    enabled: true
                }
            },
            dt_orderDataType: 'dom-checkbox',
            form_check: amChecks.loginAllowed,
            form_status: false
        },
        {
            name: 'loginLastConnection',
            type: Date,
            optional: true,
            dt_title: pwixI18n.label( I18N, 'list.last_connection_th' ),
            dt_render( data, type, rowData, meta ){
                return type === 'display' && rowData.loginLastConnection ? strftime( AccountsManager.configure().datetime, rowData.loginLastConnection ) : '';
            },
            dt_className: 'dt-center',
            dt_type: 'date',
            form_status: false,
            form_check: false
        },
        Notes.fieldDef({
            name: 'adminNotes',
            dt_title: pwixI18n.label( I18N, 'list.admin_notes_th' ),
            form_title: pwixI18n.label( I18N, 'tabs.admin_notes_title' )
        }),
        Notes.fieldDef({
            name: 'userNotes',
            dt_title: pwixI18n.label( I18N, 'list.user_notes_th' ),
            form_title: pwixI18n.label( I18N, 'tabs.user_notes_title' )
        }),
        Timestampable.fieldDef()
    ]
```

- `setupTabular( name<String>, args<Object> )`

    This method initialize a named tabular display. `args` is an object with following keys:

    - `fieldDef`: an optional list of fields definitions to replace the default tabular fields set (which is itself the default fields set for the collection)

    - `pub`: an optional publication name, defaulting to 'pwix.AccountsManager.p.tabularLast'

##### `Options`

The class extends the `AccountsCore.Options` class to reactively manage `amAccount` instanciation arguments.

In other words, all instanciation arguments are available through `<my_amAccount_instance>.opts().<my_argument>()`, e.g. `amInstance.opts().editTabsFn()`.

#### Helpers

##### `AccountsManager.Checks`

##### `AccountsManager.Fielddef`

##### `AccountsManager.Tabular`

##### `AccountsManager.Transforms`

#### Functions

##### `AccountsManager.configure( o<Object> )`

See [below](#configuration)

##### `AccountsManager.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

##### `AccountsCore.runAccountsSelection( selected<ReactiveVar>, opts<Object> )`

Runs a modal dialog to let the user choose zero to many user accounts.

Parameters are:

- `selected`: a ReactiveVar which contains the array of initially selected accounts identifiers (`_id`)

    This same ReactiveVar will contain the selection result when the dialog will be validated.

- `opts`: an optional options object with following keys:

    - `disabled`: whether the selection component should be disabled, defaulting to `false`
    - `selectOptions`: additional configuration options for `multiple-select` selection component
    - `instance`: the name of the accounts instance, defaulting to 'users'
    - `select_ph`: the select component placeholder, defaulting to (localized) 'Select the desired accounts'
    - `dialog_title`: the dialog title, defaulting to (localized) 'Select one or more user accounts'
    - `$target`: a jQuery object which will receive the 'ah-accounts-select' event at the validation of the dialog

The modal triggers an 'ah-accounts-select' event at validation time, with data as:

- `items`: an array of selected accounts documents
- `selected`: an array of selected accounts identifiers.

This function is available on client-side only.

##### `async AccountsManager.updateUser( userDoc<Object>, options<Object> ): <Boolean>`

#### Events

On server side, `AccountsManager.s.eventEmitter` is an event emitter, and emits:

- `insert`, when a new account has been created, on any collection, with an object as argument containing:

    - `amInstance`: the instance name
    - `item`: the created user document
    - `userId`: the responsible user identifier.

- `update`, after an item has been updated, on any collection, with an object as argument containing:

    - `amInstance`: the instance name
    - `item`: the updated user document
    - `userId`: the responsible user identifier.

- `delete`, after an item has been deleted, on any collection, with an object as argument containing:

    - `amInstance`: the instance name
    - `id`: the identifier of the deleted user
    - `userId`: the responsible user identifier.

### Blaze components

#### `AccountEditPanel`

A tabbed editing component to be run inside of a page or of a modal. Default tabs are named and ordered as:

- `account_ident_tab`
- maybe `account_roles_tab` if the `pwix:roles` package is used by the application
- `account_admin_notes_tab`
- `account_user_notes_tab`

This list of tabs can be reviewed, replaced or updated by the application via the `editTabsFn` instanciation parameter.

When run from [`AccountsList`](#accountslist), it is run in a modal to edit the current item.

It expects following data context:

- `name`: the amAccount instance name
- `item`: the account's object to be edited, or null
- `tabs`: an optional array of tabs provided by the application
- `tabsBefore`: an optional array of tabs provided by the application
- `tabsUpdates`: an optional updates object


#### `AccountNewButton`

A `PlusButton` component customized to create a new account.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either is disabled, or doesn't display at all if the user is not allowed.

It takes the very same data context than below `AccountsList`.

#### `AccountsList`

The component list the defined accounts as a `pwix:tabular` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either disabled, or doesn't display at all, the relevant buttons if the user is not allowed.

Known data context is:

- `name`

    The (mandatory) tabular name to display. Must have been previously defined in common code through `amAccount.setupTabular()` method.

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

This package extends `AccountsCore.isAllowed()` function with following permissions:

- `pwix.accounts_manager.data.adminNotes`: whether the current user is able to see/edit admin notes:
    - instance: the `amAccount` instance
    - id: the account identifier

- `pwix.accounts_manager.feat.create`: create a new account, with additional arguments as an object with following keys:
    - instance: the `amAccount` instance

- `pwix.accounts_manager.feat.delete`: remove the identified account, with additional arguments as an object with following keys:
    - instance: the `amAccount` instance
    - id: the account identifier

- `pwix.accounts_manager.feat.update`: update the user account, with additional arguments as an object with following keys:
    - instance: the `amAccount` instance
    - id: the account identifier

Note that reading accounts for a server task is not subject to permissions as this is nonetheless required for authentication needs. The above permissions talk about external requests or user-requested tasks.

## Configuration

This package relies on `pwix:accounts-conf` package for most of its configuration. Please see the relevant documentation.

This package's behavior can be configured through a call to the `AccountsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

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

    - `AccountsManager.C.Verbose.READY`

        Track the readyness status of the package.

    Defaults to `AccountsManager.C.Verbose.CONFIGURE`.

A function can be provided by the application for each of these parameters. The function will be called without argument and must return a suitable value.

Please note that `AccountsManager.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `AccountsManager.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

`AccountsManager.configure()` is a reactive data source.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 2.2.0:

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
- Last updated on 2025, Jul. 8th