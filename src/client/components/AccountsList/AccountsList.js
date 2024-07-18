/*
 * pwix:accounts-manager/src/client/components/AccountsList/AccountsList.js
 *
 * Display here a table whith a row per account (the 'item'), whatever be the count of email addresses and if the account has a username.
 *
 * Parms:
 * - none
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';

import '../AccountEditPanel/AccountEditPanel.js';

import './AccountsList.html';

Template.AccountsList.helpers({
    // whether the current user has the permission to see the list of accounts
    canList(){
        const res = AccountsManager.isAllowed( 'pwix.accounts_manager.pub.list_all' );
        //console.debug( 'res', res );
        return res;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // tabular identifier
   tabularId(){
        return TABULAR_ID;
    }
});

Template.AccountsList.events({
    // delete an account
    'tabular-delete-event .AccountsList'( event, instance, data ){
        let label = null;
        AccountsTools.preferredLabel( data.item )
            .then(( res ) => {
                label = res.label;
                Meteor.callAsync( 'pwix_accounts_manager_accounts_remove', data.item._id )
            })
            .then(() => {
                Tolert.success( pwixI18n.label( I18N, 'delete.success', label ));
            })
            .catch(( e ) => {
                Tolert.error({ type:e.error, message:e.reason });
            });
        return false; // doesn't propagate
    },

    // edit an account
    'tabular-edit-event .AccountsList'( event, instance, data ){
        let label = null;
        AccountsTools.preferredLabel( data.item )
            .then(( res ) => {
                Modal.run({
                    mdBody: 'AccountEditPanel',
                    mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
                    mdClasses: 'modal-lg',
                    mdClassesContent: AccountsManager.configure().classes,
                    mdTitle: pwixI18n.label( I18N, 'edit.modal_title', res.label ),
                    item: AccountsManager.list.byId( data.item._id )
                });
            });
        return false;
    }
});
