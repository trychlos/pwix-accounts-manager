/*
 * pwix:accounts-manager/src/common/collections/accounts/server/deny.js
 */

// Deny all client-side updates
// cf. https://guide.meteor.com/security.html#allow-deny
// see also https://docs.meteor.com/api/accounts.html#Meteor-users

Meteor.users.deny({
    insert(){ return true; },
    update(){ return true; },
    remove(){ return true; },
});
