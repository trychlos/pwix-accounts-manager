# pwix:accounts-manager

## ChangeLog

### 2.4.1-rc.0

    Release date: 

    - 

### 2.4.0

    Release date: 2026- 4-23

    - Minor typo improvement and commented-out debug line
    - Let the application insert a template above the ident top row padder
    - Let the manager send reset password and email verification links

### 2.3.0

    Release date: 2026- 4-13

    - Update to new AccountsCore.getInstance() reactive function, thus bumping minor candidate version number
    - Remove pwix.accounts_manager.fn.getBy permission (as it must always be true)
    - configure() now warns for unmanaged keys
    - AccountsManager.isAllowed() now accepts both an instance name and an instance class
    - Update to new pwix:tabular naming convention
    - Improve AccountsList email address column to have the 'more' button inside
    - Restore (disappeared) lastConnection update on user login on 'users' collection
    - Use pwix:logger universal logger
    - Define a ready() reactive data source
    - Remove (most of) assert() tests, replacing with logger.error() for debugging facility
    - Fix the display of user roles and set contextual tooltips
    - Fix array concatenation of amAccount fieldset
    - Restore sort on email address column now that the column uses a Blaze template
    - Upgrade pwix:ui-bootstrap5 dependency to be able to use Bootstrap tooltips
    - Meteor methods handle exceptions throwned by server code
    - isAllowed() permission management function is now handled by AccountsCore
    - Make sure form data is updated on data context changes
    - Update to pwix:forms v1.6
    - Update to pwix:modal v2.5
    - Make sure methods and publications are prefixed with a full namespace
    - Prevent too many autorun's when calling setForm()
    - Both email adress and username must be identifiers in both email address and username namespaces
    - fix lastConnection update
    - Rename pwix:accounts-hub dependency to pwix:accounts-core, upgrading it to 2.0.0-rc.0
    - Remove 'serverTabularExtend' amAccount parameter obsoleted by AccountCore.Account.transform
    - Replace 'addtionalTabs, 'tabsUpdate', 'tabsBefore', 'tabs', 'haveIdent' and 'haveRoles' amAccount parameters by 'editTabsFn'
    - Remove unused AccountsManager.s.getBy() function (and redondant regarding AccountsCore.s.byQuery())
    - Exported AccountsManager.amAccount class is renamed to AccountsManager.Account
    - Introduce editAdminNotes ReactiveVar (todo #3)
    - Delegating onCreateUser() to AccountsCore means removing onCreateUser() from AccountsManager
    - Remove methods, only relying on AccountsCore for server accesses
    - Remove last server function, relying on AccountsCore too
    - Remove unused 'scopesFn' option

### 2.2.0

    Release date: 2025- 7- 8

    - Fix the stylesheet to ellipsize the scoped roles column
    - Fix datatables display just after logged-out user
    - Improve the message when user is not allowed
    - Delegate onCreateUser() server-side function to AccountsCore, thus bumping minor candidate version number
    - Replace an async helper with a ReactiveVar in AccountsList
    - Fix the addressing of objects inside arrays (e.g. emails)
    - Normalize class names to be 'am-' prefixed
    - Define new additionalTabs property to amAccount

### 2.1.0

    Release date: 2024-11-19

    - Improve README
    - Define new AccountsManager.s.getBy() function, thus bumping minor candidate version number
    - Define new 'serverAllExtend' configuration parameter
      NB: the two extend function now hold the publication userId
    - Define new 'editTitle' AccountsList component parameter
    - Fix the event emission, re-adding the DYN sub-object
    - Define new preferredLabel() amAccount argument
    - Change the internal email identifier 'id' to '_id', thus removing the limitation when removing emails rows
    - Fix the label computation when saving an item
    - AccountsManager.s.getBy() now use the special 'getBy' permission to handle cases where we do not have any userId
    - Name the AccountEditPanel checker to make the debug easier
    - Define preNewFn(), postNewFn(), preUpdateFn(), postUpdateFn(), clientUpdateFn() and clientUpdateArgs() functions
    - Define onCreateUser() server-side function
    - Improve the new account toaster label
    - Fix call to missing remove method
    - Fix instance name usage from data context
    - Define new amAccount.get() reactive data source
    - Let the subscription be delayed after the amAccount instanciation
    - Fix the display of account roles in tabular list
    - Let the caller choose whether auto close the 'new account' dialog after successful creation (todo #4)
    - Fix new email creation
    - Move the 'pwix_accounts_manager_accounts_list_all' publication to AccountsCore

### 2.0.0

    Release date: 2024-10- 4

    - Replace pwix:accounts-conf and pwix:accounts-tools dependencies with pwix:accounts-core, thus bumping major candidate version numner
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
    - Define new amAccount.defaultFieldDef() method
    - Always open new account dialog on the first pane
    - Define 'haveIdent' parameter
    - Consider the mdTitle passed by the caller
    - Define new clientNewFn() function to define a new account
    - Fix configuration overrides
    - Remove amAccount.collectionDb() method (rather use acAccount.collection())
    - Define 'serverTabularExtend' amAccount parameter
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
- Last updated on 2026, Apr. 23rd
