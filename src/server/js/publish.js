/*
 * pwix:accounts-manager/src/server/js/publish.js
 */

import { AccountsHub } from 'meteor/pwix:accounts-hub';

// returns a cursor of all accounts
Meteor.publish( 'pwix_accounts_manager_accounts_list_all', async function( instanceName ){
    const amInstance = AccountsHub.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.pub.list_all', this.userId ), amInstance ){
            return false;
        }
        return amInstance.collection().find({}, { transform: AccountsHub.cleanupUserDocument });
    } else {
        console.warn( 'pwix_accounts_manager_accounts_list_all unknown or invalid instance name', instanceName );
        return false;
    }
});
