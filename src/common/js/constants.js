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
        CONFIGURE:      0x01 <<  0
    }
};

// non exported variables

I18N = 'pwix:accounts-manager:i18n:namespace';
