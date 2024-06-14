/*
 * pwix:accounts-manager/srv/client/components/account_emails_edit/account_emails_edit.js
 *
 * Let the user have several email adresses.
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - checker: a ReactiveVar which holds the parent Checker
 */

import _ from 'lodash';

import { pwixI18n } from 'meteor/pwix:i18n';

import './account_emails_edit.html';

Template.account_emails_edit.onCreated( function(){
    const self = this;

    self.APP = {
        fields: {
            'emails.$.address': {
                js: '.js-email'
            },
            'emails.$.verified': {
                js: '.js-verified'
            }
        },
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null ),

        // send panel data
        sendPanelData( dataContext, valid ){
            if( _.isBoolean( valid )){
                self.$( '.c-account-ident-panel' ).trigger( 'panel-data', {
                    emitter: 'ident',
                    ok: valid,
                    data: self.APP.form.get().getForm()
                });
            }
        }
    };
});

Template.account_emails_edit.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker.get();
        if( parentChecker ){
            self.APP.checker.set( new Forms.Checker({
                instance: self,
                parent: parentChecker,
                fields: AccountsManager.fieldsSet.toForm( self.APP.fields )
            }));
        }
    });

    // set data inside of an autorun so that it is reactive to datacontext changes
    // initialize the display (check indicators) - let the error messages be displayed here: there should be none (though may be warnings)
    self.autorun(() => {
        /*
        const form = self.APP.form.get();
        if( form ){
            const dataContext = Template.currentData();
            form.setData({ item: dataContext.item })
                .setForm( dataContext.item.get())
                .check({ update: false }).then(( valid ) => { self.APP.sendPanelData( dataContext, valid ); });
        }
                */
    });
});

Template.account_emails_edit.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // emails addresses list
    itemsList(){
        console.debug( 'this', this );
        return this.item.get().emails || [];
    },

    // display a check if the line is valid
    transparentIfNotValid( it ){
        //;return it.DYN.lineValid.get() ? '' : 'x-transparent';
    }
});

Template.account_emails_edit.events({
    'ac-signup-ok .c-account-ident-panel'( event, instance, data ){
        //console.debug( event, instance, data );
        const ok = data.ok;
        delete data.ok;
        instance.APP.sendPanelData({
            emitter: 'ident',
            ok: ok,
            data: { ...data }
        });
    },

        /*
    'input .c-account-ident-panel'( event, instance ){
        if( !Object.keys( event.originalEvent ).includes( 'FormChecker' ) || event.originalEvent['FormChecker'].handled !== true ){
            const dataContext = this;
            instance.APP.checker.get().inputHandler( event ).then(( valid ) => { instance.APP.sendPanelData( dataContext, valid ); });
        }
    }
            */
});
