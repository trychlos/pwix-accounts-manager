/*
 * pwix:accounts-manager/src/client/components/AccountNewButton/AccountNewButton.js
 *
 * Let the accounts manager create a new account.
 *
 * Parms:
 *  - name: the amAccount instance name
 *  - ... plus all PlusButton parameters
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { Logger } from 'meteor/pwix:logger';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';

import '../AccountEditPanel/AccountEditPanel.js';

import './AccountNewButton.html';

const logger = Logger.get();

Template.AccountNewButton.onCreated( function(){
    const self = this;

    self.AM = {
        canCreate: new ReactiveVar( false )
    };

    self.autorun(() => {
        const dataContext = Template.currentData();
        if( dataContext.name ){
            const acInstance = AccountsCore.getInstance( dataContext.name );
            if( acInstance && acInstance instanceof AccountsManager.Account ){
                AccountsCore.isAllowed( 'pwix.accounts_manager.feat.create', Meteor.userId(), { instance: acInstance })
                    .then(( res ) => {
                        self.AM.canCreate.set( res );
                    });
            }
        }
    });
});

Template.AccountNewButton.helpers({
    // whether the user is allowed to create new account
    canCreate(){
        return Template.instance().AM.canCreate.get();
    },

    // parms for new account (PlusButton)
    parmsNewAccount(){
        let parms = { ...this };
        parms.label = parms.label || pwixI18n.label( I18N, 'new.btn_plus_label' );
        parms.title = parms.title || pwixI18n.label( I18N, 'new.btn_plus_title' );
        return parms;
    }
});

Template.AccountNewButton.events({
    'click .PlusButton'( event, instance ){
        const self = this;
        Modal.run({
            ...self,
            mdBody: 'AccountEditPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: this.mdClasses || 'modal-lg',
            mdTitle: this.mdTitle || pwixI18n.label( I18N, 'new.modal_title' ),
            item: null
        });
        return false;
    }
});
