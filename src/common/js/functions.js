/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

/**
 * @param {String} action
 * @param {amClass} amInstance
 * @param {String} userId
 * @returns {Boolean} true if the current user is allowed to do the action
 */
AccountsManager.isAllowed = async function( action, amInstance, userId=null ){
    let allowed = false;
    const fn = amInstance.allowFn();
    if( fn ){
        allowed = await fn( ...arguments );
    }
    return allowed;
}
