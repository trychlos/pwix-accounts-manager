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
import { Tolert } from 'meteor/pwix:tolert';

import '../AccountEditPanel/AccountEditPanel.js';

import './AccountsList.html';

const logger = Logger.get();

Template.AccountsList.onCreated( function(){
    const self = this;

    self.AM = {
        // the amAccount instance
        amInstance: new ReactiveVar( false ),
        // whether the user is allowed to see this list
        allowed: new ReactiveVar( false ),
    };

    // get and check the amAccount instance
    self.autorun(() => {
        const amInstance = AccountsManager.amAccount.byTabularName( Template.currentData().name );
        if( amInstance ){
            check( amInstance, AccountsManager.amAccount );
            self.AM.amInstance.set( amInstance );
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
   tabularName(){
        const table = Package['aldeed:tabular'].default.tablesByName[this.name];
        // tableName='UserAccountsList'
        // table is a Table instance
        //logger.debug( 'tableName', name, 'aldeed table', table );
        return table;
    }
});

Template.AccountsList.events({
    // want display more the first email address, data.item is the user document
    'am-email-more'( event, instance, data ){
        logger.debug( event, data );
    },

    // edit the settings for this table
    'tabular-settings-event .AccountsList'( event, instance, data ){
        logger.debug( event, data );
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
                    Meteor.callAsync( 'pwix.AccountsManager.m.removeById', amInstance.name(), data.item._id )
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
