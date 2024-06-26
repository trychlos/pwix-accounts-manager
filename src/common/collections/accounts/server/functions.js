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
    if( !await AccountsManager.checks.canDelete( userId )){
        throw new Meteor.Error(
            'AccountsManager.check.canDelete',
            'Unallowed to remove "'+id+'" account' );
    }
    try {
        ret = await Meteor.users.removeAsync({ _id: id });
    } catch( e ){
        throw new Meteor.Error(
            'AccountsManager.server.removeAccount',
            'Unable to remove "'+id+'" account' );
    }
    return ret;
};

AccountsManager.server.updateAccount = async function( item, userId ){
    let ret = null;
    if( !await AccountsManager.checks.canEdit( userId )){
        throw new Meteor.Error(
            'AccountsManager.check.canEdit',
            'Unallowed to edit "'+item._id+'" account' );
    }
    try {
        const orig = await Meteor.users.findOneAsync({ _id: item._id });
        let ret = null;
        if( orig ){
            ret = await Meteor.users.updateAsync({ _id: item._id }, { $set: item });
            if( !ret ){
                throw new Meteor.Error(
                    'pwix_accounts_manager_accounts_update_account',
                    'Unable to update "'+item._id+'" account' );
            }
        } else {
            console.warn( 'user not found', item._id );
        }
        return ret;
    } catch( e ){
        throw new Meteor.Error(
            'AccountsManager.server.updateAccount',
            'Unable to update "'+item._id+'" account' );
    }
};

AccountsManager.server.updateAttribute = async function( id, userId, modifier ){
    let ret = null;
    if( !await AccountsManager.checks.canEdit( userId )){
        throw new Meteor.Error(
            'AccountsManager.check.canEdit',
            'Unallowed to edit "'+id+'" account' );
    }
    try {
        const orig = await Meteor.users.findOneAsync({ _id: id });
        let ret = null;
        if( orig ){
            ret = await Meteor.users.updateAsync({ _id: id }, { $set: modifier });
            if( !ret ){
                throw new Meteor.Error(
                    'pwix_accounts_manager_accounts_update_attribute',
                    'Unable to update "'+id+'" account' );
            }
        } else {
            console.warn( 'user not found', id );
        }
        return ret;
    } catch( e ){
        throw new Meteor.Error(
            'AccountsManager.server.updateAttribute',
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

// https://docs.meteor.com/api/accounts-multi.html#AccountsServer-validateLoginAttempt
Accounts.validateLoginAttempt(( o ) => {
    //console.log( o );
    if( !o.allowed ){
        return false;
    }
    return ( o && o.user ) ? o.user.isAllowed : true;
});
*/
