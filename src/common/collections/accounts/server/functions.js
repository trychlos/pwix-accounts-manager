/*
 * pwix:accounts-manager/src/common/collections/accounts/server/functions.js
 *
 * Server-only functions
 */

import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';

AccountsManager.server = {};

AccountsManager.server.removeAccount = async function( id, userId, instanceName ){
    let ret = null;
    const amInstance = AccountsManager.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.fn.removeAccount', amInstance, userId, id )){
            return null;
        }
        try {
            ret = await amInstance.collectionDb().removeAsync({ _id: id });
        } catch( e ){
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.removeAccount',
                'Unable to remove "'+id+'" account' );
        }
    } else {
        console.warn( 'pwix:accounts-manager removeAccount() unknown or invalid instance name', instanceName );
    }
    return ret;
};

// update the account
// NB 1: cowardly refuse to disallow login of the current user
// NB 2: on login no more allowed, make sure login tokens are cleared in the database
AccountsManager.server.updateAccount = async function( item, userId, instanceName, origItem ){
    let ret = null;
    //console.debug( 'item', item, 'userId', userId, 'instanceName', instanceName );
    const amInstance = AccountsManager.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.fn.updateAccount', amInstance, userId, item )){
            return null;
        }
        const itemId = item._id;
        try {
            const orig = await amInstance.collectionDb().findOneAsync({ _id: itemId });
            console.debug( 'orig', orig );
            const origAllowed = orig.loginAllowed;
            if( itemId === userId && !item.loginAllowed && orig.loginAllowed ){
                console.warn( 'cowardly refusing to disallow current user login' );
                item.loginAllowed = true;
            }
            let ret = null;
            if( orig ){
                delete item._id;
                delete item.DYN;
                console.debug( 'calling updateAsync', itemId, item );
                ret = await amInstance.collectionDb().updateAsync({ _id: itemId }, { $set: item });
                console.debug( 'updateAsync', ret );
                if( !ret ){
                    throw new Meteor.Error(
                        'pwix.accounts_manager.fn.updateAccount',
                        'Unable to update "'+itemId+'" account' );
                // force user logout if needed
                } else if( !item.loginAllowed && orig.loginAllowed ){
                    amInstance.collectionDb().updateAsync({ _id: itemId }, { $set: { 'services.resume.loginTokens': [] }}).then(( res ) => {
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

AccountsManager.server.updateAttribute = async function( id, userId, instanceName, modifier ){
    let ret = null;
    const amInstance = AccountsManager.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.fn.updateAttribute', amInstance, userId, id, modifier )){
            return null;
        }
        try {
            const orig = await amInstance.collectionDb().findOneAsync({ _id: id });
            let ret = null;
            if( orig ){
                ret = await amInstance.collectionDb().updateAsync({ _id: id }, { $set: modifier });
                if( !ret ){
                    throw new Meteor.Error(
                        'pwix.accounts_manager.fn.updateAttribute',
                        'Unable to update "'+id+'" account' );
                }
            } else {
                console.warn( 'user not found', id );
            }
            return ret;
        } catch( e ){
            throw new Meteor.Error(
                'pwix.accounts_manager.fn.updateAttribute',
                'Unable to update "'+id+'" account' );
        }
    } else {
        console.warn( 'pwix:accounts-manager updateAttribute() unknown or invalid instance name', instanceName );
    }
};

// Server-side: this is a pre-create user, though an _id is already defined
Accounts.onCreateUser(( opts, user ) => {
    console.log( 'Accounts.onCreateUser: opts=%o, user=%o', opts, user );
    // make sure each email has its own identifier
    ( user.emails || [] ).forEach(( it ) => {
        if( !it.id ){
            it.id = Random.id();
        }
    });
    return user;
});

/*
// Server-side: validating the new user creation in Accounts collection
Accounts.validateNewUser(( user ) => {
    console.log( 'Accounts.validateNewUser: user=%o', user );
    new SimpleSchema({
        _id: { type: String },
        username: { type: String, optional: true },
        emails: { type: Array },
        'emails.$': { type: Object },
        'emails.$.address': { type: String },
        'emails.$.verified': { type: Boolean },
        createdAt: { type: Date },
        createdBy: { type: String },
        updatedAt: { type: Date, optional: true },
        updatedBy: { type: String, optional: true },
        services: { type: Object, blackbox: true },
        lastConnection: { type: Date, optional: true },
        isAllowed: { type: Boolean },
        apiAllowed: { type: Boolean, defaultValue: false },
        notes: { type: String, optional: true }
    }).validate( user );

    // Return true to allow user creation to proceed
    return true;
});
*/

// https://docs.meteor.com/api/accounts-multi.html#AccountsServer-validateLoginAttempt
// https://v3-docs.meteor.com/api/accounts.html#AccountsServer-validateLoginAttempt
Accounts.validateLoginAttempt(( o ) => {
    //console.log( o );
    if( !o.allowed ){
        return false;
    }
    return ( o && o.user ) ? o.user.loginAllowed : true;
});
