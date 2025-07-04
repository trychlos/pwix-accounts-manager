/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

import { strict as assert } from 'node:assert';

/**
 * @param {String} action
 * @param {String} userId
 * @param {Any} args any optional additional argument(s)
 *  Must always contain an 'amInstance' key of type amClass
 * @returns {Boolean} true if the current user is allowed to do the action
 */
AccountsManager.isAllowed = async function( action, userId=null, args=null ){
    //console.debug( arguments );
    assert( args && args.amInstance && args.amInstance instanceof AccountsManager.amClass, 'expects an instance of AccountsManager.amClass, got '+args?.amInstance );
    let allowed = false;
    const fn = args.amInstance.allowFn();
    if( fn ){
        allowed = await fn( ...arguments );
    }
    return allowed;
}
