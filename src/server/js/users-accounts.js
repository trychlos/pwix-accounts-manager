/*
 * pwix:accounts-manager/src/server/js/users-accounts.js
 *
 * Server-only functions.
 * Only honors standard Meteor.users collection
 */

import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';

// Server-side: this is a pre-create user on Meteor.users standard collection, though an _id is already defined
Accounts.onCreateUser(( opts, user ) => {
    console.log( 'Accounts.onCreateUser: opts=%o, user=%o', opts, user );
    AccountsManager.s.eventEmitter.emit( 'create', { amInstance: 'users', item: user });
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
// @locus Meteor.users collection
Accounts.validateLoginAttempt(( o ) => {
    //console.log( o );
    if( !o.allowed ){
        return false;
    }
    return ( o && o.user ) ? o.user.loginAllowed : true;
});
