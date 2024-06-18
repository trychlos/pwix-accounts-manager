/*
 * pwix:accounts-manager/src/client/components/dt_email_address/dt_email_address.js
 *
 * This template is used to display the first email address of the user.
 */


import './dt_email_address.html';

Template.dt_email_address.helpers({
    // list the first email address if any
    address(){
        return this.emails.length ? this.emails[0].address : '';
    }
});
