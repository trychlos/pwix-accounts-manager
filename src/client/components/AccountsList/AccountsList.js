/*
 * pwix:accounts-manager/src/client/components/AccountsList/AccountsList.js
 *
 * Display here a table whith a row per account (the 'item'), whatever be the count of email addresses and if the account has a username.
 * The tabular is expected to have been setup in common code, and is known by its tabular name
 *
 * Parms:
 * - name: the tabular name, defaulting to 'AccountsList'
 */

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';
import { Meteor } from "meteor/meteor";
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tabular } from 'meteor/pwix:tabular';
import { Tolert } from 'meteor/pwix:tolert';
import { Tracker } from 'meteor/tracker';

import '../AccountEditPanel/AccountEditPanel.js';
import '../am_email_addresses_panel/am_email_addresses_panel.js';

import './AccountsList.html';

const logger = Logger.get();

Template.AccountsList.onCreated( function(){
    const self = this;

    self.AM = {
        // the amAccount instance
        amInstance: new ReactiveVar( false ),
        // the tabular options
        options: new ReactiveVar( null ),
        // whether the user is allowed to see this list
        allowed: new ReactiveVar( false )
    };

    // get and check the amAccount instance
    self.autorun(() => {
        const tabularName = Template.currentData().name;
        const o = AccountsManager.Account.byTabularName( tabularName );
        if( o ){
            const amInstance = o?.instance;
            if( amInstance ){
                check( amInstance, AccountsManager.Account );
                self.AM.amInstance.set( amInstance );
            }
            const options = o?.options;
            if( options ){
                check( options, AccountsManager.TabularOptions );
                self.AM.options.set( options );
            }
        } else {
            logger.warning( `tabularName='${tabularName}' is not a registered Tabular.Table instance. Is it possible you have missed 'setupTabular() ?` );
        }
    });

    // whether the user is allowed to see this list
    self.autorun(() => {
        const amInstance = self.AM.amInstance.get();
        if( amInstance ){
            AccountsCore.isAllowed( 'pwix.accounts_core.feat.list', Meteor.userId(), { instance: amInstance })
                .then(( allowed ) => {
                    self.AM.allowed.set( allowed );
                });
        }
    });
});

Template.AccountsList.helpers({
    // whether the current user has the permission to see the list of accounts
    canList(){
        return Template.instance().AM.allowed.get();
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // the Tabular.Table instance
   tabularInstance(){
        const table = Tabular.byName( this.name );
        // this.name is the tabular name, here 'AccountsList' or maybe 'UsersAccountsList' or anything chosen by the caller
        // table is the Tabular.Table instance
        return table;
    }
});

Template.AccountsList.events({
    // want display more the first email address, data.item is the user document
    //  event is triggered from dt_email_more component
    'am-email-more .AccountsList'( event, instance, { item }){
        Modal.run({
            item,
            amInstance: instance.AM.amInstance,
            mdBody: 'am_email_addresses_panel',
            mdButtons: [ Modal.C.Button.CLOSE ],
            mdClasses: this.mdClasses || 'modal-md',
            mdTitle: this.mdTitle || pwixI18n.label( I18N, 'list.email_address_more' )
        });
    },

    // this event is expected to be only triggered when checkboxes are active on the tabular list
    async 'tabular-click-event .AccountsList'( event, instance, { item, field, checked }){
        const amInstance = instance.AM.amInstance.get();
        const options = instance.AM.options.get();
        if( amInstance && options && options.activeCheckboxes()){
            item[field.name()] = checked;
            const res = await AccountsCore.updateAccount( amInstance, item, Meteor.userId());
            const lab = await amInstance.preferredLabel( item );
            if( res.count ){
                Tolert.success( pwixI18n.label( I18N, 'edit.edit_success', lab.label ));
            } else {
                Tolert.error( pwixI18n.label( I18N, 'edit.edit_error', lab.label ));
            }
        }
    },

    // delete an account
    'tabular-delete-event .AccountsList'( event, instance, data ){
        const dc = this;
        let label = null;
        const amInstance = instance.AM.amInstance.get();
        if( amInstance ){
            amInstance.preferredLabel( data.item )
                .then(( res ) => {
                    label = res.label;
                    return Meteor.callAsync( 'pwix.AccountsCore.m.deleteAccount', amInstance.name(), data.item._id, Meteor.userId());
                })
                .then(() => {
                    Tolert.success( pwixI18n.label( I18N, 'delete.success', label ));
                })
                .catch(( e ) => {
                    Tolert.error({ type:e.error, message:e.reason });
                });
        }
        return false; // doesn't propagate
    },

    // edit an account
    'tabular-edit-event .AccountsList': async function( event, instance, data ){
        const self = this;
        const amInstance = instance.AM.amInstance.get();
        let item, title;
        if( amInstance ){
            amInstance.preferredLabel( data.item )
                .then(( res ) => {
                    title = this.mdTitle || pwixI18n.label( I18N, 'edit.modal_title', res.label );
                    if( self.editTitle && typeof self.editTitle === 'function' ){
                        title = self.editTitle( data.item );
                    }
                    return amInstance.byId( data.item._id )
                })
                .then(( res ) => {
                    item = res;
                    Modal.run({
                        ...self,
                        name: amInstance.name(),
                        mdBody: 'AccountEditPanel',
                        mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
                        mdClasses: this.mdClasses || 'modal-lg',
                        mdTitle: title,
                        item: item
                    });
                });
        }
        return false;
    }
});
