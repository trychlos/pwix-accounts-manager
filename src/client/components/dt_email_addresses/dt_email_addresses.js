/*
 * pwix:accounts-manager/src/client/components/dt_email_addresses/dt_email_addresses.js
 *
 * This template is used to display the first email address of the user, plys maybe a 'more' button
 */

import './dt_email_addresses.html';

Template.dt_email_addresses.helpers({
    // list the first email address if any
    address(){
        return this.item.emails.length ? this.item.emails[0].address : '';
    },

    // whether we have several email addresses
    haveMore(){
        return this.item.emails.length > 1;
    }
});
