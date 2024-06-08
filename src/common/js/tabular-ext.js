/*
 * pwix:accounts-manager/src/common/js/tabular.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { TabularExt } from 'meteor/pwix:tabular-ext';

if( Meteor.isClient ){
    import '../../client/components/email_address/email_address.js';
    import '../../client/components/email_more/email_more.js';
    import '../../client/components/email_verified/email_verified.js';
}

let columns = [];

// the default columns created by Meteor base Accounts
columns.push(
    { data: 'emails',
      title: pwixI18n.label( I18N, 'header.email_address_th' ),
      tmpl: Meteor.isClient && Template.email_address
    },
    { title: pwixI18n.label( I18N, 'header.email_verified_th' ),
      sortable: true,
      tmpl: Meteor.isClient && Template.email_verified
    },
    { tmpl: Meteor.isClient && Template.email_more
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
