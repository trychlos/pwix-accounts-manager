/*
 * pwix:accounts-manager/src/common/js/tabular.js
 *
 * Datatables want to be defined in common code.
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';
import { Tracker } from 'meteor/tracker';

const _identifier = async function( it ){
    const res = await AccountsTools.preferredLabel( it );
    return res.label;
};

Tracker.autorun(() => {
    AccountsManager.tabular = new Tabular.Table({
        name: 'Users',
        collection: Meteor.users,
        columns: AccountsManager.fieldSet.get().toTabular(),
        tabular: {
            // display the first email address (if any) instead of the identifier in the button title
            async deleteButtonTitle( it ){
                return pwixI18n.label( I18N, 'buttons.delete_title', await _identifier( it ));
            },
            async deleteConfirmationText( it ){
                return pwixI18n.label( I18N, 'delete.confirmation_text', await _identifier( it ));
            },
            async deleteConfirmationTitle( it ){
                return pwixI18n.label( I18N, 'delete.confirmation_title', await _identifier( it ));
            },
            async editButtonEnabled( it ){
                return true;
            },
            async editButtonTitle( it ){
                return pwixI18n.label( I18N, 'buttons.edit_title', await _identifier( it ));
            },
            async infoButtonTitle( it ){
                return pwixI18n.label( I18N, 'buttons.info_title', await _identifier( it ));
            },
            // do not let the user delete himself
            async deleteButtonEnabled( it ){
                return it._id !== Meteor.userId();
            }
        },
        destroy: true
    });
});
