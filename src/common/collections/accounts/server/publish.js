/*
 * pwix:accounts-manager/src/common/collections/accounts/server/publish.js
 */

// returns a cursor of all accounts
// Publish function can only return a Cursor or an array of Cursors
Meteor.publish( 'accounts.listAll', function(){
    return Meteor.users.find();
});
