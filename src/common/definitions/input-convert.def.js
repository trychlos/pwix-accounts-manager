/*
 * pwix:accounts-manager/src/common/definitions/input-convert.def.js
 *
 * Convert the AccountsManager Input type (mandatory/optional) to the AccountsUI corresponding value.
 */

import { AccountsUI } from 'meteor/pwix:accounts-ui';

InputConvert = {
    K: {
        AM_FIELD_NONE: AccountsUI.C.Input.NONE,
        AM_FIELD_OPTIONAL: AccountsUI.C.Input.OPTIONAL,
        AM_FIELD_MANDATORY: AccountsUI.C.Input.MANDATORY
    },

    /**
     * @param {String} amValue
     * @returns {String} the AccountsUI value corresponding to the provided AccountsManager one, or null if not found
     */
    uiValue( amValue ){
        let res = null;
        Object.keys( InputConvert.K ).every(( value ) => {
            if( value === amValue ){
                res = InputConvert.K[value];
            }
            return res === null;
        });
        if( !res ){
            console.error( 'unknwon amValue', amValue );
        }
        return res;
    }
}
