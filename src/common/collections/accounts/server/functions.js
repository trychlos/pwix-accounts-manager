/*
 * pwix:accounts-manager/src/common/collections/accounts/server/functions.js
 *
 * Server-only functions
 */

import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';

AccountsManager.server = {};

AccountsManager.server.removeAccount = async function( id, userId ){
    let ret = null;
    if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.fn.removeAccount', userId, id )){
        return null;
    }
    try {
        ret = await Meteor.users.removeAsync({ _id: id });
    } catch( e ){
        throw new Meteor.Error(
            'pwix.accounts_manager.fn.removeAccount',
            'Unable to remove "'+id+'" account' );
    }
    return ret;
};

// update the account
// NB 1: cowardly refuse to disallow login of the current user
// NB 2: on login no more allowed, make sure login tokens are cleared in the database
AccountsManager.server.updateAccount = async function( item, userId ){
    let ret = null;
    if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.fn.updateAccount', userId, item )){
        return null;
    }
    try {
        const orig = await Meteor.users.findOneAsync({ _id: item._id });
        const origAllowed = orig.loginAllowed;
        if( item._id === userId && !item.loginAllowed && orig.loginAllowed ){
            console.warn( 'cowardly refusing to disallow current user login' );
            item.loginAllowed = true;
        }
        let ret = null;
        if( orig ){
            const itemId = item._id;
            ret = await Meteor.users.updateAsync({ _id: item._id }, { $set: item });
            if( !ret ){
                throw new Meteor.Error(
                    'pwix.accounts_manager.fn.updateAccount',
                    'Unable to update "'+item._id+'" account' );
            } else if( !item.loginAllowed && orig.loginAllowed ){
                Meteor.users.updateAsync({ _id: itemId }, { $set: { 'services.resume.loginTokens': [] }}).then(( res ) => {
                    console.debug( 'forced user logged-out', itemId, 'res', res );
                });
            }
        } else {
            console.warn( 'user not found', item._id );
        }
        return ret;
    } catch( e ){
        throw new Meteor.Error(
            'pwix.accounts_manager.fn.updateAccount',
            'Unable to update "'+item._id+'" account' );
    }
};

AccountsManager.server.updateAttribute = async function( id, modifier, userId ){
    let ret = null;
    if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.fn.updateAttribute', userId, id, modifier )){
        return null;
    }
    try {
        const orig = await Meteor.users.findOneAsync({ _id: id });
        let ret = null;
        if( orig ){
            ret = await Meteor.users.updateAsync({ _id: id }, { $set: modifier });
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
