/*
 * pwix:accounts-manager/src/client/components/dt_email_more/dt_email_more.js
 *
 * This template is used to display all the email addresses of the user.
 *
 * data context:
 * - item: the user document
 * - column: the column to be displayed
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import './dt_email_more.html';

Template.dt_email_more.helpers({
    // have a blue button if active, or gray else
    colorBtnClass(){
        return this.item.emails.length > 1 ? 'btn-outline-primary' : 'btn-outline-secondary';
    },

    // disable the button if only zero or one email address
    disabled(){
        return this.item.emails.length > 1 ? '' : 'disabled';
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    }
});
