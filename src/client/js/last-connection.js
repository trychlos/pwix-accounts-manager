/*
 * pwix:accounts-manager/src/client/js/last-connection.js
 *
 * Update the last connection of the user
 */

import { Tracker } from 'meteor/tracker';

Tracker.autorun(() => {
    const id = Meteor.userId();
    if( id ){
        Meteor.callAsync( 'pwix_accounts_manager_accounts_update_attribute', id, { lastConnection: new Date() });
    }
});
