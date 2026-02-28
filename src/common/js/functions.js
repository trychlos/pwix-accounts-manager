/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

import _ from 'lodash';
import { strict as assert } from 'node:assert';

import { AccountsHub } from 'meteor/pwix:accounts-hub';

import { amClass } from '../classes/am-class.class.js';

/**
 * @param {String} action
 * @param {String} userId
 * @param {Any} args an object with following keys:
 *  - aminstance:
 *    > either a string, and so an amClass instance name
 *    > or a amClass instance.
 * @returns {Boolean} true if the current user is allowed to do the action
 */
AccountsManager.isAllowed = async function( action, userId=null, args ){
    assert.ok( args && args.amInstance, 'expects an object argument with \'amInstance\' key, got '+args );
    assert.ok( typeof( args.amInstance ) === 'string' || args.amInstance instanceof String || args.amInstance instanceof amClass, 'expects args.amInstance be a string or an amClass object, got '+args.amInstance );
    let amInstance = args.amInstance;
    if( typeof( args.amInstance ) === 'string' || args.amInstance instanceof String ){
        amInstance = AccountsHub.getInstance( args.amInstance );
        if( !( amInstance instanceof amClass )){
            msgWarn( 'unable to get the \''+args.amInstance+'\' amClass instance' );
            return false;
        }
    }
    assert.ok( amInstance instanceof amClass, 'code error, should have an amClass instance' );
    let allowed = false;
    const fn = amInstance.allowFn();
    if( fn ){
        args.amInstance = amInstance;
        allowed = await fn( ...arguments );
    }
    return allowed;
}
