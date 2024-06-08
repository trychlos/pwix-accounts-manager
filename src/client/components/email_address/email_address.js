/*
 * pwix:accounts-manager/src/client/components/email_address/email_address.js
 *
 * This template is used to display the first email address of the user.
 */


import './email_address.html';

Template.email_address.helpers({
    // list the first email address if any
    address(){
        return this.emails.length ? this.emails[0].address : '';
    }
});
