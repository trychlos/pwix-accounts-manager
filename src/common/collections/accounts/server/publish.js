/*
 * pwix:accounts-manager/src/common/collections/accounts/server/publish.js
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';

// returns a cursor of all accounts
Meteor.publish( 'pwix_accounts_manager_accounts_list_all', async function( instanceName ){
    const amInstance = AccountsManager.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.pub.list_all', amInstance, this.userId )){
            return false;
        }
        return amInstance.collectionDb().find({}, { transform: AccountsTools.cleanupUserDocument });
    } else {
        console.warn( 'pwix_accounts_manager_accounts_list_all unknown or invalid instance name', instanceName );
        return false;
    }
});
