/*
 * pwix:accounts-manager/src/server/js/methods.js
 */

Meteor.methods({
    // remove an account
    async 'pwix_accounts_manager_accounts_remove_byid'( instanceName, id ){
        return await AccountsManager.s.removeById( instanceName, id, this.userId );
    },

    // update the user account
    async 'pwix_accounts_manager_accounts_update_account'( instanceName, item, origItem ){
        return await AccountsManager.s.updateAccount( instanceName, item, this.userId, origItem );
    },

    // set attribute(s) on an account
    async 'pwix_accounts_manager_accounts_update_byid'( instanceName, id, modifier ){
        return await AccountsManager.s.updateById( instanceName, id, this.userId, modifier );
    }
});
