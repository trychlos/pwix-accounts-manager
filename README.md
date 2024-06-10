# pwix:accounts-manager

## What is it

A try to mutualize and factorize the most common part of a simple accounts management system:

- defines the account schema and provides client and server check functions

- provides components to list and edit accounts.

## Schema

`pwix:accounts-manager` is based on Meteor `accounts-base`, and extends its standard schema as:

```
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

```
    createdAt
    updatedAt
    CreatedBy
    updatedBy
```

## Configuration

The package's behavior can be configured through a call to the `AccountsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `schema`

    Let the application extends the default schema by providing an object suitable to be used for a `SimpleSchema` instanciation.

    Defauts to nothing.

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

## Provides

### `AccountsManager`

The globally exported object of this package.

### Blaze components

#### `AccountsList`

The component list the defined accounts as a `pwix:tabular_ext` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

## NPM peer dependencies

This package has no NPM dependencies.

---
P. Wieser
- Last updated on 2024, May. 24th
