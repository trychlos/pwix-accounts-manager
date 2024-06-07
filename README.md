# pwix:accounts-manager

## What is it

A try to mutualize and factorize the most common part of a simple accounts management system:

- defines the account schema and provides client and server check functions

- provides components to list and edit accounts.

## Usage

## Configuration

None at the moment.

## Provides

### `AccountsManager`

The globally exported object of this package.

### Blaze components

#### `AccountsList`

The component list the defined accounts.

It can be called with following data context:

- `canDelete`: whether the `Delete` button is to be enabled (only considered if displayed)

- `canEdit`: whether the `Edit` button is to be enabled (only considered if displayed)

- `canInfo`: whether the `Info` button is to be enabled (only considered if displayed)

## NPM peer dependencies

This package has no NPM dependencies.

---
P. Wieser
- Last updated on 2024, May. 24th
