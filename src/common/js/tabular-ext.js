/*
 * pwix:accounts-manager/src/common/js/tabular.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { TabularExt } from 'meteor/pwix:tabular-ext';

let columns = [];

// the default columns created by Meteor base Accounts
columns.push(
    { data: 'emails',
      title: pwixI18n.label( I18N, 'header.emails_th' )
    },
    { data: 'username',
      title: pwixI18n.label( I18N, 'header.username_th' )
    },
    { data: 'loginAllowed',
      title: pwixI18n.label( I18N, 'header.login_allowed_th' ),
      type: 'num'
    },
    { data: 'lastConnection',
      title: pwixI18n.label( I18N, 'header.last_connection_th' ),
      type: 'date'
    },
    { data: 'apiAllowed',
      title: pwixI18n.label( I18N, 'header.api_allowed_th' ),
      type: 'num'
    },
    { data: 'userNotes',
      title: pwixI18n.label( I18N, 'header.user_notes_th' )
    },
    { data: 'adminNotes',
      title: pwixI18n.label( I18N, 'header.admin_notes_th' )
    }
);

// the columns created by the 'timestampable' behaviour must be retrieven, but not displayed
columns.push(
    { data: 'createdAt', visible: false },
    { data: 'createdBy', visible: false },
    { data: 'updatedAt', visible: false },
    { data: 'updatedBy', visible: false }
);

AccountsManager.tabular = new TabularExt({
    name: 'Users',
    collection: Meteor.users,
    columns: columns
});

        /*
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
    ]
});
        */
