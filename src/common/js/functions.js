/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

import _ from 'lodash';

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Logger } from 'meteor/pwix:logger';

import { amClass } from '../classes/am-class.class.js';

const logger = Logger.get();

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
    if( !action || !_.isString( action )){
        logger.error( 'isAllowed() expects \'action\' be a non-empty string, got', action, 'throwing...' );
        throw new Error( 'Bad data type' );
    }
    if( !userId ){
        logger.error( 'isAllowed() expects \'userId\' be a non-falsy data, got', userId, 'throwing...' );
        throw new Error( 'Bad data type' );
    }
    if( !args || !args.amInstance || ( !_.isString( args.amInstance ) && !( args.amInstance instanceof amClass ))){
        logger.error( 'isAllowed() expects \'amInstance\' be a string or an instance of amClass, got', args.amInstance, 'throwing...' );
        throw new Error( 'Bad data type' );
    }
    let amInstance = args.amInstance;
    if( _.isString( args.amInstance )){
        amInstance = AccountsHub.getInstance( args.amInstance );
    }
    if( !amInstance || !( amInstance instanceof amClass )){
        logger.error( 'isAllowed() expects \'amInstance\' be an instance of amClass, got', amInstance, 'throwing...' );
        throw new Error( 'Bad data type' );
    }
    let allowed = false;
    const fn = amInstance.allowFn();
    if( fn ){
        args.amInstance = amInstance;
        allowed = await fn( ...arguments );
    }
    return allowed;
}
