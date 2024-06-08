/*
 * pwix:accounts-manager/src/client/components/email_more/email_more.js
 *
 * This template is used to display all the email addresses of the user.
 *
 * data context:
 * - item: the user document
 * - column: the column to be displayed
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import './email_more.html';

Template.email_more.helpers({
    // have a blue button if active, or gray else
    colorBtnClass(){
        return this.emails.length > 1 ? 'btn-outline-primary' : 'btn-outline-secondary';
    },

    // disable the button if only zero or one email address
    disabled(){
        return this.emails.length > 1 ? '' : 'disabled';
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    }
});
