# pwix:accounts-limanagerst

## ChangeLog

### 2.0.0

    Release date: 2024-10- 4

    - Replace pwix:accounts-conf and pwix:accounts-tools dependencies with pwix:accounts-hub, thus bumping major candidate version numner
    - Increase AccountNewButton left margin
    - Define 'tabsBefore' parameter
    - Fix the modal detection
    - Let the caller choose the classes to apply to the modal
    - Let the caller change the configuration of existing tabs
    - Have a messager as soon as we run in a modal
    - Fix the data context of added tabs
    - Review the requested permissions to better suit CRUD standards
    - Simplify AccountsList component
    - Define tabularFieldsDef tabular display definition
    - Define new amClass.defaultFieldDef() method
    - Always open new account dialog on the first pane
    - Define 'haveIdent' parameter
    - Consider the mdTitle passed by the caller
    - Define new clientNewFn() function to define a new account
    - Fix configuration overrides
    - Remove amClass.collectionDb() method (rather use ahClass.collection())
    - Define 'serverTabularExtend' amClass parameter
    - Fix default ordering by ascending email address
    - AccountsManager is now an EventEmitter and sends a server-side event on create, update and delete operations

### 1.2.0

    Release date: 2024- 9-20

    - Accept aldeed:simple-schema v2.0.0, thus bumping minor candidate version number

### 1.1.1

    Release date: 2024- 9-13

    - Remove debug console lines
    - Upgrade pwix:tabbed to v 1.3.0

### 1.1.0

    Release date: 2024- 8-11

    - Remove pwix:roles dependency, only having roles tab when the package is present
    - Deny to current user the right to disallow himself
    - Force user logged-out when loginAllowed becomes false
    - API change to have an Accounts class, bumping minor candidate version number (due to lack of use at the moment)
    - Fix the fieldset definition to have a default non-verified email address

### 1.0.0

    Release date: 2024- 7-18

    - Initial release

---
P. Wieser
- Last updated on 2024, Oct. 4th
