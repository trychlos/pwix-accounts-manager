/*
 * pwix:accounts-manager/src/common/collections/accounts/server/functions.js
 *
 * Server-only functions
 */

import { AccountsHub } from 'meteor/pwix:accounts-hub';

AccountsManager.s = AccountsManager.s || {};

// @summary builkd a Mongo '$unset' modifier object
// @param {Object} item
// @returns {Object} item
AccountsManager.s.addUnset = function( instanceName, item ){
    let $unset = {};
    const amInstance = AccountsHub.instances[instanceName];
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
    const amInstance = AccountsHub.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.getBy', userId, { amInstance: amInstance })){
            return null;
        }
        try {
            ret = await amInstance.collection().find( query ).fetchAsync();
        } catch( e ){
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.getBy' );
        }
    } else {
        console.warn( 'pwix:accounts-manager getBy() unknown or invalid instance name', instanceName );
    }
    return ret;
};

AccountsManager.s.removeById = async function( instanceName, id, userId ){
    let ret = null;
    const amInstance = AccountsHub.instances[instanceName];
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
        console.warn( 'pwix:accounts-manager removeById() unknown or invalid instance name', instanceName );
    }
    return ret;
};

// update the account
// NB 1: cowardly refuse to disallow login of the current user
// NB 2: on login no more allowed, make sure login tokens are cleared in the database
AccountsManager.s.updateAccount = async function( instanceName, item, userId, origItem ){
    let ret = null;
    //console.debug( 'item', item, 'userId', userId, 'instanceName', instanceName );
    const amInstance = AccountsHub.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.edit', userId, { amInstance: amInstance, id: item._id })){
            return null;
        }
        // item._id is lost during update !?
        const itemId = item._id;
        try {
            let orig = await amInstance.collection().findOneAsync({ _id: itemId });
            //console.debug( 'orig', orig );
            if( itemId === userId && !item.loginAllowed && orig?.loginAllowed ){
                console.warn( 'cowardly refusing to disallow current user login' );
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
                        console.log( 'forced user logout', itemId, 'res', res );
                    });
                }
            } else {
                console.warn( 'user not found', itemId );
            }
            return ret;
        } catch( e ){
            console.debug( e );
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.updateAccount',
                'Unable to update "'+itemId+'" account' );
        }
    } else {
        console.warn( 'pwix:accounts-manager updateAccount() unknown or invalid instance name', instanceName );
    }
};

// this is called when only some attributes need to be updated
// always in an already existing item
// doesn't participate to preUpdateFn/postUpdateFn
AccountsManager.s.updateById = async function( instanceName, id, userId, modifier ){
    let ret = null;
    const amInstance = AccountsHub.instances[instanceName];
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
                console.warn( 'user not found', id );
            }
            return ret;
        } catch( e ){
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.updateById',
                'Unable to update "'+id+'" account' );
        }
    } else {
        console.warn( 'pwix:accounts-manager updateById() unknown or invalid instance name', instanceName );
    }
};
