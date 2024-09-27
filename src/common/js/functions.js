/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

/**
 * @param {String} action
 * @param {String} userId
 * @param {Any} args any optional additional argument(s)
 *  Must always contain an 'amInstance' key
 * @returns {Boolean} true if the current user is allowed to do the action
 */
AccountsManager.isAllowed = async function( action, userId=null, args=null ){
    let allowed = false;
    const fn = args.amInstance.allowFn();
    if( fn ){
        allowed = await fn( ...arguments );
    }
    return allowed;
}
