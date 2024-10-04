/*
 * pwix:accounts-manager/src/common/collections/accounts/server/functions.js
 *
 * Server-only functions
 */

import { AccountsHub } from 'meteor/pwix:accounts-hub';

AccountsManager.s = AccountsManager.s || {};

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
        const itemId = item._id;
        try {
            const orig = await amInstance.collection().findOneAsync({ _id: itemId });
            //console.debug( 'orig', orig );
            const origAllowed = orig.loginAllowed;
            if( itemId === userId && !item.loginAllowed && orig.loginAllowed ){
                console.warn( 'cowardly refusing to disallow current user login' );
                item.loginAllowed = true;
            }
            let ret = null;
            if( orig ){
                delete item._id;
                delete item.DYN;
                ret = await amInstance.collection().updateAsync({ _id: itemId }, { $set: item });
                AccountsManager.s.eventEmitter.emit( 'update', { amInstance: instanceName, item: item });
                if( !ret ){
                    throw new Meteor.Error(
                        'pwix.accounts_manager.fn.updateAccount',
                        'Unable to update "'+itemId+'" account' );
                // force user logout if needed
                } else if( !item.loginAllowed && orig.loginAllowed ){
                    amInstance.collection().updateAsync({ _id: itemId }, { $set: { 'services.resume.loginTokens': [] }}).then(( res ) => {
                        console.log( 'forced user logged-out', itemId, 'res', res );
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
