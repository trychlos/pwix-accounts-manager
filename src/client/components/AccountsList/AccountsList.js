/*
 * pwix:accounts-manager/src/client/components/AccountsList/AccountsList.js
 *
 * Display here a table whith a row per account (the 'item'), whatever be the count of email addresses and if the account has a username.
 *
 * Parms:
 * - name: the amClass instance name
 */

const assert = require( 'assert' ).strict;

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Meteor } from "meteor/meteor";
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tolert } from 'meteor/pwix:tolert';

import '../AccountEditPanel/AccountEditPanel.js';

import './AccountsList.html';

Template.AccountsList.onCreated( function(){
    const self = this;

    self.AM = {
        // get the amClass instance from its name
        amInstance( name ){
            let instance = name ? AccountsHub.instances[name] : null;
            if( instance ){
                assert( instance instanceof AccountsManager.amClass, 'expect an AccountsManager.amClass, got '+instance );
            }
            return instance;
        }
    };
});

Template.AccountsList.helpers({
    // whether the current user has the permission to see the list of accounts
    async canList(){
        const instance = Template.instance().AM.amInstance( this.name );
        const allowed = instance ? await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.list', Meteor.userId(), { amInstance: instance }) : false;
        return allowed;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // the Tabular.Table instance
   tabularName(){
        const name = Template.instance().AM.amInstance( this.name )?.tabularName();
        return Package['aldeed:tabular'].default.tablesByName[name];
    }
});

Template.AccountsList.events({
    // delete an account
    'tabular-delete-event .AccountsList'( event, instance, data ){
        const dc = this;
        let label = null;
        instance.AM.amInstance( this.name )?.preferredLabel( data.item )
            .then(( res ) => {
                label = res.label;
                Meteor.callAsync( 'pwix_accounts_manager_accounts_remove_byid', dc.name, data.item._id )
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
        const self = this;
        const amInstance = instance.AM.amInstance( this.name );
        amInstance.preferredLabel( data.item )
            .then(( res ) => {
                let title = this.mdTitle || pwixI18n.label( I18N, 'edit.modal_title', res.label );
                if( self.editTitle && typeof self.editTitle === 'function' ){
                    title = self.editTitle( data.item );
                }
                Modal.run({
                    ...self,
                    mdBody: 'AccountEditPanel',
                    mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
                    mdClasses: this.mdClasses || 'modal-lg',
                    mdClassesContent: AccountsManager.configure().classes + ' ' + amInstance.classes(),
                    mdTitle: title,
                    item: amInstance.amById( data.item._id )
                });
            });
        return false;
    }
});
