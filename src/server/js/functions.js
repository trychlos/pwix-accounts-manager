/*
 * pwix:accounts-manager/src/common/collections/accounts/server/functions.js
 *
 * Server-only functions
 */

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

AccountsManager.s = AccountsManager.s || {};

// @summary builkd a Mongo '$unset' modifier object
// @param {Object} item
// @returns {Object} item
AccountsManager.s.addUnset = function( instanceName, item ){
    let $unset = {};
    const amInstance = AccountsHub.getInstance( instanceName );
    amInstance.fieldSet().names().forEach(( it ) => {
        if( it.indexOf( '.' ) === -1 && !Object.keys( item ).includes( it )){
            $unset[it] = true;
        }
    });
    // updatedAt and updatedBy are never unset
    delete $unset.updatedAt;
    delete $unset.updatedBy;
    return $unset;
};

AccountsManager.s.getBy = async function( instanceName, query, userId ){
    let ret = null;
    const amInstance = AccountsHub.getInstance( instanceName );
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        try {
            ret = await amInstance.collection().find( query ).fetchAsync();
        } catch( e ){
            throw new Meteor.Error(
                'pwix.accounts_manager.s.getBy' );
        }
    } else {
        logger.warn( 'getBy() unknown or invalid instance name', instanceName );
    }
    return ret;
};

AccountsManager.s.removeById = async function( instanceName, id, userId ){
    let ret = null;
    const amInstance = AccountsHub.getInstance( instanceName );
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.delete', userId, { amInstance: amInstance, id: id })){
            return null;
        }
        try {
            ret = await amInstance.collection().removeAsync({ _id: id });
            AccountsManager.s.eventEmitter.emit( 'delete', { amInstance: instanceName, id: id });
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
    const amInstance = AccountsHub.getInstance( instanceName );
    if( !amInstance || !( amInstance instanceof AccountsManager.amClass )){
        logger.error( 'updateAccount() expects \'amInstance\' be an instance of AccountsManager.amClass, got', amInstance, 'throwing...' );
        throw new Error( 'Bad argument: amInstance' );
    }
    if( !await AccountsHub.isAllowed( 'pwix.accounts_manager.feat.edit', userId, { instance: amInstance, id: item._id })){
        return null;
    }
    // item._id is lost during update !?
    const itemId = item._id;
    try {
        let orig = await amInstance.collection().findOneAsync({ _id: itemId });
        //logger.debug( 'orig', orig );
        if( itemId === userId && !item.loginAllowed && orig?.loginAllowed ){
            logger.warn( 'updateAccount() cowardly refusing to disallow current user login' );
            item.loginAllowed = true;
        }
        // item._id is lost during update !?
        const itemId = item._id;
        try {
            let orig = await amInstance.collection().findOneAsync({ _id: itemId });
            //logger.debug( 'orig', orig );
            if( itemId === userId && !item.loginAllowed && orig?.loginAllowed ){
                logger.warn( 'updateAccount() cowardly refusing to disallow current user login' );
                item.loginAllowed = true;
            }
            let ret = null;
            if( orig ){
                await amInstance.preUpdateFn( item );
                delete item._id;
                const DYN = item.DYN;
                delete item.DYN;
                ret = await amInstance.collection().updateAsync({ _id: itemId }, { $set: item });
                item.DYN = DYN;
                item._id = itemId;
                await amInstance.postUpdateFn( item );
                AccountsManager.s.eventEmitter.emit( 'update', { amInstance: instanceName, item: item, userId: userId });
                if( !ret ){
                    throw new Meteor.Error(
                        'pwix.accounts_manager.fn.updateAccount',
                        'Unable to update "'+itemId+'" account' );
                // force user logout if needed
                } else if( !item.loginAllowed && orig.loginAllowed ){
                    amInstance.collection().updateAsync({ _id: itemId }, { $set: { 'services.resume.loginTokens': [] }}).then(( res ) => {
                        logger.log( 'updateAccount() forced user logout', itemId, 'res', res );
                    });
                }
            } else {
                logger.warn( 'updateAccount() user not found', itemId );
            }
            return ret;
        } catch( e ){
            logger.debug( 'updateAccount() ', e );
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.updateAccount',
                'Unable to update "'+itemId+'" account' );
        }
    } else {
        logger.warn( 'updateAccount() unknown or invalid instance name', instanceName );
    }
};

// this is called when only some attributes need to be updated
// always in an already existing item
// doesn't participate to preUpdateFn/postUpdateFn
AccountsManager.s.updateById = async function( instanceName, id, userId, modifier ){
    let ret = null;
    const amInstance = AccountsHub.getInstance( instanceName );
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.edit', userId, { amInstance: amInstance, id: id })){
            return null;
        }
        try {
            const orig = await amInstance.collection().findOneAsync({ _id: id });
            let ret = null;
            if( orig ){
                ret = await amInstance.collection().updateAsync({ _id: id }, { $set: modifier });
                AccountsManager.s.eventEmitter.emit( 'update', { amInstance: instanceName, item: item });
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
// delegates onCreateUser() hook to AccountsHub
AccountsManager.onCreateUser = function( f ){
    AccountsHub.onCreateUser( f );
};
