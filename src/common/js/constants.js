/*
 * pwix:accounts-manager/src/common/js/constants.js
 */

AccountsManager.C = {

    // username / email address input rule
    //  to keep aligned with /src/common/definitions/input-convert.def.js
    Input: {
        NONE: 'AM_FIELD_NONE',
        OPTIONAL: 'AM_FIELD_OPTIONAL',
        MANDATORY: 'AM_FIELD_MANDATORY'
    },

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

// tabular identifier
TABULAR_ID = 'pwix:accounts-manager/tabular';

// i18n namespace
I18N = 'pwix:accounts-manager:i18n:namespace';
