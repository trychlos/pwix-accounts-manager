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
    AccountsManager.perms.clear();
    const _conf = AccountsManager.configure();
    Object.keys( _conf.roles ).forEach(( role ) => {
        const roleName = _conf.roles[role];
        if( roleName ){
            Tracker.autorun(() => {
                AccountsManager.perms.set( role, Meteor.userId() && ( Roles.current().globals || [] ).includes( roleName ));
            });
        }
    });
});
