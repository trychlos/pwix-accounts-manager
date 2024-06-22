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

AccountsManager.perms.resetRoles = function(){
    AccountsManager.perms.clear();
    Object.keys( AccountsManager._conf.roles ).forEach(( role ) => {
        const roleName = AccountsManager._conf.roles[role];
        if( roleName ){
            Tracker.autorun(() => {
                AccountsManager.perms.set( role, Meteor.userId() && ( Roles.current().globals || [] ).includes( roleName ));
            });
        }
    });
}
