/*
 * pwix:accounts-manager/src/client/components/email_verified/email_verified.js
 *
 * This template is used to display the first email address of the user.
 */


import './email_verified.html';

Template.email_verified.helpers({
    // whether the first email address is verified ?
    verified(){
        const verified = this.emails.length ? this.emails[0].verified : false;
        return verified ? 'checked' : '';
    }
});
