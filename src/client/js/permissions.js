/*
 * pwix:accounts-manager/src/client/js/permissions.js
 *
 * Maintain in the AccountsManager global object the permissions as a ReactiveDict for the current user.
 * These permissions are only available on the client.
 */

import { ReactiveDict } from 'meteor/reactive-dict';
import { Roles } from 'meteor/pwix:roles';
import { Tracker } from 'meteor/tracker';

AccountsManager.perms = new ReactiveDict();

Tracker.autorun(() => {
    if( Roles.ready()){
        AccountsManager.perms.clear();
        const conf = AccountsManager.configure();
        Object.keys( conf.roles ).forEach(( role ) => {
            const roleName = conf.roles[role];
            if( roleName ){
                Tracker.autorun(() => {
                    AccountsManager.perms.set( role, Meteor.userId() && ( Roles.current().globals || [] ).includes( roleName ));
                });
            }
        });
    }
});
