/*
 * pwix:accounts-manager/src/common/classes/private/am-class-tabular.js
 *
 * This class manages an AccountsManager, and notably determines which schema is handled in which collection.
 * All permissions are also managed at this class level.
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';

_tabular_identifier = async function( amInstance, it ){
    const res = await amInstance.preferredLabel( it );
    return res.label;
}

export const amClassTabular = {
    new( amInstance ){
        // define the Tabular.Table
        const tabular = new Tabular.Table({
            name: amInstance.tabularName(),
            collection: amInstance.collectionDb(),
            columns: amInstance.fieldSet().toTabular(),
            tabular: {
                // do not let the user delete himself
                async deleteButtonEnabled( it ){
                    return it._id !== Meteor.userId();
                },
                // display the first email address (if any) instead of the identifier in the button title
                async deleteButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.delete_title', await _tabular_identifier( amInstance, it ));
                },
                async deleteConfirmationText( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_text', await _tabular_identifier( amInstance, it ));
                },
                async deleteConfirmationTitle( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_title', await _tabular_identifier( amInstance, it ));
                },
                async editButtonEnabled( it ){
                    return await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.edit', amInstance, Meteor.userId(), it );
                },
                async editButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.edit_title', await _tabular_identifier( amInstance, it ));
                },
                async infoButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_title', await _tabular_identifier( amInstance, it ));
                }
            },
            destroy: true
        });
        return tabular;
    }
};