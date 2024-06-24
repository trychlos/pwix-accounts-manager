/*
 * pwix:accounts-manager/src/common/js/tabular.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';

const _identifier = function( it ){
    return it.emails?.length ? it.emails[0].address : it._id;
};

AccountsManager.tabular = new Tabular.Table({
    name: 'Users',
    collection: Meteor.users,
    columns: AccountsManager.fieldSet.toTabular(),
    tabular: {
        // display the first email address (if any) instead of the identifier in the button title
        deleteButtonTitle( it ){
          return pwixI18n.label( I18N, 'buttons.delete_title', _identifier( it ));
        },
        editButtonEnabled( it ){
          return true;
        },
        editButtonTitle( it ){
          return pwixI18n.label( I18N, 'buttons.edit_title', _identifier( it ));
        },
        infoButtonTitle( it ){
          return pwixI18n.label( I18N, 'buttons.info_title', _identifier( it ));
        },
        // do not let the user delete himself
        deleteButtonEnabled( it ){
            return it._id !== Meteor.userId();
        }
    }
});
