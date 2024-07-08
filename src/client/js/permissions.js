/*
 * pwix:accounts-manager/src/client/js/permissions.js
 *
 * Maintain in the AccountsManager global object the permissions as a ReactiveDict for the current user.
 * These permissions are only available on the client.
 * Note that at this AccountsManager level, we consider that roles must no be scoped (and so only look at global - non-scoped - roles).
 */

import { ReactiveDict } from 'meteor/reactive-dict';
import { Roles } from 'meteor/pwix:roles';
import { Tracker } from 'meteor/tracker';

AccountsManager.perms = new ReactiveDict();

Tracker.autorun(() => {
    if( Roles.ready()){
        AccountsManager.perms.clear();
        if( Meteor.userId()){
            const conf = AccountsManager.configure();
            Object.keys( conf.roles ).forEach(( name ) => {
                const roleId = conf.roles[name];
                if( roleId ){
                    Tracker.autorun(() => {
                        //console.debug( 'name', name, 'globals', Roles.current().all, 'roleId', roleId, 'perm', Roles.current().all.includes( roleId ));
                        AccountsManager.perms.set( name, Roles.current().global.all.includes( roleId ));
                    });
                }
            });
        }
    }
});
