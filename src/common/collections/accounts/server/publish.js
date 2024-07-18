/*
 * pwix:accounts-manager/src/common/collections/accounts/server/publish.js
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';

// returns a cursor of all accounts
Meteor.publish( 'pwix_accounts_manager_accounts_list_all', async function(){
    if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.pub.list_all', this.userId )){
        return false;
    }
    return Meteor.users.find({}, { transform: AccountsTools.cleanupUserDocument });
});
