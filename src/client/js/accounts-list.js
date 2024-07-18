/*
 * pwix:accounts-manager/src/client/js/accounts-list.js
 *
 * Maintain in the client side of the AccountsManager global object the list of the accounts as a ReactiveVar which contains:
 * - an array of user accounts,
 * - each item having a DYN.roles
 */

import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

AccountsManager.list = {
    handle: Meteor.subscribe( 'pwix_accounts_manager_accounts_list_all' ),
    array: new ReactiveVar( [] ),
    assignments: {
        handle: null,
        list: null
    },

    // get the user by id
    byId( id ){
        let found = null;
        AccountsManager.list.array.get().every(( doc ) => {
            if( doc._id === id ){
                found = doc;
            }
            return found === null;
        });
        return found;
    }
};

if( Package['pwix:roles'] ){
    AccountsManager.list.assignments.handle = Meteor.subscribe( 'pwix_roles_user_assignments' );
}

// fill up and track and maintain the accounts array
Tracker.autorun(() => {
    if( AccountsManager.list.handle.ready()){
        let list = [];
        Meteor.users.find().fetchAsync().then(( fetched ) => {
            fetched.forEach(( it ) => {
                it.DYN = {
                    roles: new ReactiveVar( [] )
                };
                list.push( it );
            });
            AccountsManager.list.array.set( list );
        });
    }
});

// fill up and track and maintain the roles of each user
Tracker.autorun(() => {
    if( AccountsManager.list.assignments.handle && AccountsManager.list.assignments.handle.ready()){
        AccountsManager.list.array.get().forEach(( it ) => {
            Package['pwix:roles'].Roles.directRolesForUser( it, { anyScope: true }).then(( res ) => {
                it.DYN.roles.set( res );
            });
        });
    }
});

// track dynamic content
Tracker.autorun(() => {
    console.debug( 'accounts', AccountsManager.list.array.get());
});
