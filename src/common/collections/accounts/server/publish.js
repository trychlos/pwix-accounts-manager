/*
 * pwix:accounts-manager/src/common/collections/accounts/server/publish.js
 */

// returns a cursor of all accounts
// Publish function can only return a Cursor or an array of Cursors
Meteor.publish( 'pwix_accounts_manager_accounts_list_all', async function(){
    if( !await AccountsManager.checks.canList( this.userId )){
        throw new Meteor.Error(
            'AccountsManager.check.canList',
            'Unallowed to list accounts' );
    }
    return Meteor.users.find();
});
