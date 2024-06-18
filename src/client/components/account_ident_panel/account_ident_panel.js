/*
 * pwix:accounts-manager/srv/client/components/account_ident_panel/account_ident_panel.js
 *
 * On creation, we embed the acUserLogin panel from pwix:accounts-ui package
 * When updating, we rely on the Checker to have same checks.
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - checker: a ReactiveVar which holds the parent Checker
 */

import _ from 'lodash';

import { AccountsUI } from 'meteor/pwix:accounts-ui';
import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';

import './account_ident_panel.html';

Template.account_ident_panel.onCreated( function(){
    const self = this;

    self.APP = {
        panel: new Forms.PanelSpec({
            username: {
                js: '.js-username'
            },
            loginAllowed: {
                js: '.js-login-allowed'
            }
        }),
            /*
            apiAllowed: {
                js: '.js-api-allowed',
                valFrom( it ){
                    return Boolean( it ? it.apiAllowed : false );
                }
            }
                */
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

Template.account_ident_panel.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker.get();
        if( parentChecker ){
            self.APP.checker.set( new Forms.Checker({
                instance: self,
                parent: parentChecker,
                panel: self.APP.panel.iPanelPlus( AccountsManager.fieldsSet ),
                data: {
                    item: Template.currentData().item
                }
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

Template.account_ident_panel.helpers({
    // whether we want an email address
    haveEmailAddress(){
        return AccountsManager._conf.haveEmailAddress !== AccountsManager.C.Input.NONE;
    },

    // whether we want a username
    haveUsername(){
        return AccountsManager._conf.haveUsername !== AccountsManager.C.Input.NONE;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // whether we are creating a new account
    newAccount(){
        return !this.item || !this.item.get() || !Object.keys( this.item.get()).length;
    },

    // on a new account, just use the AccountsUI
    parmsUserLoginNew(){
        return {
            initialDisplay: AccountsUI.C.Panel.SIGNUP,
            renderMode: AccountsUI.C.Render.DIV,
            haveCancelButton: false,
            haveOKButton: false,
            signinLink: false,
            signupLink: false,
            resetLink: false,
            signupPasswordTwice: true,
            signupAutoClose: false,
            signupAutoConnect: false,
            signupHaveEmailAddress: AccountsUI.C.Input.MANDATORY,
            signupHaveUsername: AccountsUI.C.Input.OPTIONAL,
            signupSubmit: false,
            name: 'iziam:account-ident-panel:new'
        };
    }
});

Template.account_ident_panel.events({
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
