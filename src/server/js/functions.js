/*
 * pwix:accounts-manager/src/common/collections/accounts/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

AccountsManager.s = AccountsManager.s || {};

// @summary builkd a Mongo '$unset' modifier object
// @param {Object} item
// @returns {Object} item
AccountsManager.s.addUnset = function( instanceName, item ){
    let $unset = {};
    const acInstance = AccountsCore.getInstance( instanceName );
    acInstance.fieldSet().names().forEach(( it ) => {
        if( it.indexOf( '.' ) === -1 && !Object.keys( item ).includes( it )){
            $unset[it] = true;
        }
    });
    // updatedAt and updatedBy are never unset
    delete $unset.updatedAt;
    delete $unset.updatedBy;
    return $unset;
};

AccountsManager.s.removeById = async function( instanceName, id, userId ){
    let ret = null;
    const acInstance = AccountsCore.getInstance( instanceName );
    if( acInstance && acInstance instanceof AccountsManager.Account ){
        if( !await AccountsCore.isAllowed( 'pwix.accounts_manager.feat.delete', userId, { instance: acInstance, id: id })){
            return null;
        }
        try {
            ret = await acInstance.collection().removeAsync({ _id: id });
            AccountsManager.s.eventEmitter.emit( 'delete', { acInstance: instanceName, id: id });
        } catch( e ){
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.removeById',
                'Unable to remove "'+id+'" account' );
        }
    } else {
        logger.warn( 'removeById() unknown or invalid instance name', instanceName );
    }
    return ret;
};

// update the account
// NB 1: cowardly refuse to disallow login of the current user
// NB 2: on login no more allowed, make sure login tokens are cleared in the database
AccountsManager.s.updateAccount = async function( instanceName, item, userId, origItem ){
    let ret = null;
    //logger.debug( 'item', item, 'userId', userId, 'instanceName', instanceName );
    if( !instanceName || !_.isString( instanceName )){
        logger.error( 'updateAccount() expects \'instanceName\' be a non-empty string, got', instanceName, 'throwing...' );
        throw new Error( 'Bad argument: instanceName' );
    }
    const acInstance = AccountsCore.getInstance( instanceName );
    if( !acInstance || !( acInstance instanceof AccountsManager.Account )){
        logger.error( 'updateAccount() expects \'acInstance\' be an instance of AccountsManager.Account, got', acInstance, 'throwing...' );
        throw new Error( 'Bad argument: acInstance' );
    }
    if( !await AccountsCore.isAllowed( 'pwix.accounts_manager.feat.update', userId, { instance: acInstance, id: item._id })){
        return null;
    }
    // item._id is lost during update !?
    const itemId = item._id;
    try {
        let orig = await acInstance.collection().findOneAsync({ _id: itemId });
        //logger.debug( 'orig', orig );
        if( itemId === userId && !item.loginAllowed && orig?.loginAllowed ){
            logger.warn( 'updateAccount() cowardly refusing to disallow current user login' );
            item.loginAllowed = true;
        }
        let ret = null;
        if( orig ){
            await acInstance.preUpdateFn( item );
            delete item._id;
            const DYN = item.DYN;
            delete item.DYN;
            ret = await acInstance.collection().updateAsync({ _id: itemId }, { $set: item });
            item.DYN = DYN;
            item._id = itemId;
            await acInstance.postUpdateFn( item );
            AccountsManager.s.eventEmitter.emit( 'update', { acInstance: instanceName, item: item, userId: userId });
            if( !ret ){
                throw new Meteor.Error(
                    'pwix.accounts_manager.fn.updateAccount',
                    'Unable to update "'+itemId+'" account' );
            // force user logout if needed
            } else if( !item.loginAllowed && orig.loginAllowed ){
                acInstance.collection().updateAsync({ _id: itemId }, { $set: { 'services.resume.loginTokens': [] }}).then(( res ) => {
                    logger.log( 'updateAccount() forced user logout', itemId, 'res', res );
                });
            }
        } else {
            logger.warn( 'updateAccount() user not found', itemId );
        }
        return ret;
    } catch( e ){
        logger.warning( 'updateAccount() ', e );
        throw new Meteor.Error(
            'pwix.accounts_manager.fn.updateAccount',
            'Unable to update "'+itemId+'" account' );
    }
};

// this is called when only some attributes need to be updated
// always in an already existing item
// doesn't participate to preUpdateFn/postUpdateFn
AccountsManager.s.updateById = async function( instanceName, id, userId, modifier ){
    let ret = null;
    const acInstance = AccountsCore.getInstance( instanceName );
    if( acInstance && acInstance instanceof AccountsManager.Account ){
        if( !await AccountsCore.isAllowed( 'pwix.accounts_manager.feat.update', userId, { instance: acInstance, id: id })){
            return null;
        }
        try {
            const orig = await acInstance.collection().findOneAsync({ _id: id });
            let ret = null;
            if( orig ){
                ret = await acInstance.collection().updateAsync({ _id: id }, { $set: modifier });
                AccountsManager.s.eventEmitter.emit( 'update', { acInstance: instanceName, item: item });
                if( !ret ){
                    throw new Meteor.Error(
                        'pwix.accounts_manager.fn.updateById',
                        'Unable to update "'+id+'" account' );
                }
            } else {
                logger.warn( 'updateById() user not found', id );
            }
            return ret;
        } catch( e ){
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.updateById',
                'Unable to update "'+id+'" account' );
        }
    } else {
        logger.warn( 'updateById() unknown or invalid instance name', instanceName );
    }
};

// v 2.1.1
// delegates onCreateUser() hook to AccountsCore
AccountsManager.onCreateUser = function( f ){
    AccountsCore.onCreateUser( f );
};
