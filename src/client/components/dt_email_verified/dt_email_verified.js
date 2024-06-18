/*
 * pwix:accounts-manager/src/client/components/dt_email_verified/dt_email_verified.js
 *
 * This template is used to display the first email address of the user.
 */


import './dt_email_verified.html';

Template.dt_email_verified.helpers({
    // whether the first email address is verified ?
    verified(){
        const verified = this.emails.length ? this.emails[0].verified : false;
        return verified ? 'checked' : '';
    }
});
