/*
 * pwix:accounts-manager/src/common/collections/accounts/server/publish.js
 */

// returns a cursor of all accounts
Meteor.publish( 'pwix_accounts_manager_accounts_list_all', async function(){
    if( !await AccountsManager.checks.canList( this.userId )){
        return false;
    }
    return Meteor.users.find();
});
