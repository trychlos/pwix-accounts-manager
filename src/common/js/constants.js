/*
 * pwix:accounts-manager/src/common/js/constants.js
 */

AccountsManager.C = {
    // verbosity levels
    Verbose: {
        NONE: 0,
        CONFIGURE:      0x01 <<  0,
        FUNCTIONS:      0x01 <<  1
    }
};

// non exported variables

// the name of the main Tabbed component
ACCOUNT_EDIT_TABBED = 'accounts-manager:account-edit-panel:tabbed';

// the name of the acUserLogin embedded panel when creating a new account
ACCOUNTS_UI_SIGNUP_PANEL = 'accounts-manager:account-ident-panel:new';

// i18n namespace
I18N = 'pwix:accounts-manager:i18n:namespace';
