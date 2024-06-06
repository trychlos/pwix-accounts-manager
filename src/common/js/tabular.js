/*
 * pwix:accounts-manager/src/common/js/tabular.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import Tabular from 'meteor/aldeed:tabular';

new Tabular.Table({
    name: 'Users',
    collection: Meteor.users,
    columns: [
        { data: "emails", title: pwixI18n.label( I18N, 'header.emails_th' )},
        { data: "username", title: pwixI18n.label( I18N, 'header.username_th' )},
        { data: "loginAllowed", title: pwixI18n.label( I18N, 'header.login_allowed_th' )},
        { data: "lastConnection", title: pwixI18n.label( I18N, 'header.last_connection_th' )},
        { data: "apiAllowed", title: pwixI18n.label( I18N, 'header.api_allowed_th' )},
        { data: "notes", title: "Notes"},
        /*
        { data: "loginAllowed",
          title: "Login allowed",
          render: function (val, type, doc) {
            if (val instanceof Date) {
            return moment(val).calendar();
            } else {
            return "Never";
            }
        }
        },
        {data: "summary", title: "Summary"},
        {
        tmpl: Meteor.isClient && Template.bookCheckOutCell
        }
        */
    ]
});
