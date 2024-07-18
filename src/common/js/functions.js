/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

/**
 * @param {String} action
 * @param {String} userId
 * @returns {Boolean} true if the current user is allowed to do the action
 */
AccountsManager.isAllowed = async function( action, userId=null ){
    let allowed = false;
    const fn = AccountsManager.configure().allowFn;
    if( fn ){
        allowed = await fn( ...arguments );
    }
    return allowed;
}
