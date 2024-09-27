/*
 * pwix:accounts-manager/src/client/components/AccountNewButton/AccountNewButton.js
 *
 * Let the accounts manager create a new account.
 *
 * Parms:
 *  - name: the amClass instance name
 *  - ... plus all PlusButton parameters
 */

import _ from 'lodash';

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';

import '../AccountEditPanel/AccountEditPanel.js';

import './AccountNewButton.html';

Template.AccountNewButton.onCreated( function(){
    const self = this;
    //console.debug( this );

    self.AM = {
        amInstance: new ReactiveVar( null )
    };

    self.autorun(() => {
        const dataContext = Template.currentData();
        if( dataContext.name ){
            const amInstance = AccountsHub.instances[dataContext.name];
            if( amInstance && amInstance instanceof AccountsManager.amClass ){
                self.AM.amInstance.set( amInstance );
            }
        }
    });
});

Template.AccountNewButton.helpers({
    // whether the user is allowed to create new account
    canCreate(){
        return AccountsManager.isAllowed( 'pwix.accounts_manager.feat.create', Meteor.userId(), { amInstance: Template.instance().AM.amInstance.get() });
    },

    // parms for new account (plusButton)
    parmsNewAccount(){
        let parms = { ...this };
        parms.label = parms.label || pwixI18n.label( I18N, 'new.btn_plus_label' );
        parms.title = parms.title || pwixI18n.label( I18N, 'new.btn_plus_title' );
        return parms;
    }
});

Template.AccountNewButton.events({
    'click .plusButton'( event, instance ){
        const self = this;
        Modal.run({
            ...self,
            mdBody: 'AccountEditPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: this.mdClasses || 'modal-lg',
            mdClassesContent: AccountsManager.configure().classes + ' ' + instance.AM.amInstance.get().classes(),
            mdTitle: pwixI18n.label( I18N, 'new.modal_title' ),
            item: null
        });
        return false;
    }
});
