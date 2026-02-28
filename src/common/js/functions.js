/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

import _ from 'lodash';

import { AccountsHub } from 'meteor/pwix:accounts-hub';

import { amClass } from '../classes/am-class.class.js';

/**
 * @param {String} action
 * @param {String} userId
 * @param {Any} args an object with following keys:
 *  - amInstance:
 *    > either a string, and so an amClass instance name
 *    > or a amClass instance.
 * @returns {Boolean} true if the current user is allowed to do the action
 */
AccountsManager.isAllowed = async function( action, userId=null, args ){
    if( args && args.amInstance && ( args.amInstance instanceof amClass || _.isString( args.amInstance ))){
        let amInstance = args.amInstance;
        if( _.isString( args.amInstance )){
            amInstance = AccountsHub.getInstance( args.amInstance );
        }
        if( amInstance instanceof amClass ){
            let allowed = false;
            const fn = amInstance.allowFn();
            if( fn ){
                args.amInstance = amInstance;
                allowed = await fn( ...arguments );
            }
            return allowed;
        } else {
            logger.error( 'isAllowed() expects \'amInstance\' be an instance of \'amClass\', got', amInstance, 'throwing...' );
            throw new Error( 'Bad data type' );
        }
    }
    logger.error( 'isAllowed() expects \'args\' be an Object with an \'amInstance\' key whose value is a string or a \'amClass\' instance, got', args, 'throwing...' );
    throw new Error( 'Bad data type' );
}
