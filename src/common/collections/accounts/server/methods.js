/*
 * pwix:accounts-manager/src/common/collections/accounts/server/methods.js
 */

Meteor.methods({
    // remove an account
    async 'pwix_accounts_manager_accounts_remove'( id, instanceName ){
        return await AccountsManager.server.removeAccount( id, this.userId, instanceName );
    },

    // update the user account
    async 'pwix_accounts_manager_accounts_update_account'( item, instanceName, origItem ){
        return await AccountsManager.server.updateAccount( item, this.userId, instanceName, origItem );
    },

    // set attribute(s) on an account
    async 'pwix_accounts_manager_accounts_update_attribute'( id, instanceName, modifier ){
        return await AccountsManager.server.updateAttribute( id, this.userId, instanceName, modifier );
    }
});
