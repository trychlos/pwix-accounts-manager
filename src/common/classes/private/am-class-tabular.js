/*
 * pwix:accounts-manager/src/common/classes/private/am-class-tabular.js
 *
 * This class manages an AccountsManager, and notably determines which schema is handled in which collection.
 * All permissions are also managed at this class level.
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';
import { bootstrap } from 'meteor/pwix:ui-bootstrap5';

const logger = Logger.get();

_tabular_identifier = async function( amInstance, it ){
    const res = await amInstance.preferredLabel( it );
    return res.label;
}

export const amClassTabular = {
    new( amInstance ){
        // define the Tabular.Table
        const fieldSet = amInstance.tabularFieldset();
        const columns = fieldSet.toTabular();
        //logger.debug( 'columns', columns );
        //logger.debug( 'fieldSet.tabularIndexByName emails.$.address', fieldSet.tabularIndexByName( 'emails.$.address', { columns: columns, only_visible: true } ));
        const tabular = new Tabular.Table({
            name: amInstance.tabularName(),
            collection: amInstance.collection(),
            columns: columns,
            pub: 'pwix.AccountsManager.p.tabularLast',
            //selector( userId ){
            //    return AccountsHub.isAllowed( 'pwix.accounts_hub.feat.list', userId, { instance: amInstance });
            //},
            pwix: {
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
                    return await AccountsHub.isAllowed( 'pwix.accounts_manager.feat.edit', Meteor.userId(), { instance: amInstance, id: it._id });
                },
                async editButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.edit_title', await _tabular_identifier( amInstance, it ));
                },
                async infoButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_title', await _tabular_identifier( amInstance, it ));
                },
                withSettingsItems: [
                    Tabular.C.Items.COLUMN_SELECTION
                ]
            },
            /*
            drawCallback: function( settings ){
                // see https://getbootstrap.com/docs/5.3/components/tooltips/
                // see https://datatables.net/forums/discussion/79345
                // requires ui-bootstrap5 v2.1
                const tooltipTriggerList = [].slice.call( document.querySelectorAll( '[data-bs-toggle="tooltip"]' ));
                const tooltipList = tooltipTriggerList.map( function( tooltipTriggerEl ){
                    return new bootstrap.Tooltip( tooltipTriggerEl );
                });
            },
            */
            /*
            createdCell(){
                console.debug( 'here', arguments );
            },
            */
            order: [[ fieldSet.tabularIndexByName( 'emails.$.address', { columns: columns }), 'asc' ]],
            destroy: true
        });
        return tabular;
    }
};
