/*
 * pwix:accounts-manager/src/client/components/account_ident_panel/account_ident_panel.js
 *
 * On creation, we embed the acUserLogin panel from pwix:accounts-ui package
 * When updating, we rely on the Checker to have same checks.
 *
 * Parms:
 * - item: a ReactiveVar which holds the account object to edit (may be empty, but not null)
 * - isNew: true|false
 * - checker: a ReactiveVar which holds the parent Checker
 * - amInstance: a ReactiveVar which holds the amClass instance
 */

import _ from 'lodash';
import strftime from 'strftime';

import { AccountsHub } from 'meteor/pwix:accounts-hub';
import { AccountsUI } from 'meteor/pwix:accounts-ui';
import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import './account_ident_panel.html';

Template.account_ident_panel.onCreated( function(){
    const self = this;

    self.AM = {
        fields: {
            loginAllowed: {
                js: '.js-login-allowed',
                form_status: Forms.C.ShowStatus.NONE
            },
            lastConnection: {
                js: '.js-last-login',
                formTo( $node, item ){
                    return $node.val( item.lastConnection ? strftime( AccountsManager.configure().datetime, item.lastConnection ) : '' );
                }
            }
        },
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null )
    };

    // setup the fields depending of the accounts configuration
    self.autorun(() => {
        const amInstance = Template.currentData().amInstance;
        if( amInstance && amInstance.get().opts().haveUsername() !== AccountsHub.C.Identifier.NONE ){
            self.AM.fields.username = {
                js: '.js-username'
            };
        }
    });
});

Template.account_ident_panel.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const amInstance = Template.currentData().amInstance.get();
        const parentChecker = Template.currentData().checker.get();
        const checker = self.AM.checker.get();
        if( amInstance && parentChecker && !checker ){
            self.AM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: new Forms.Panel( self.AM.fields, amInstance.fieldSet()),
                data: {
                    item: Template.currentData().item,
                    amInstance: amInstance
                },
                setForm: Template.currentData().item.get()
            }));
        }
    });
});

Template.account_ident_panel.helpers({
    // whether we want an email address
    haveEmailAddress(){
        return this.amInstance ? this.amInstance.get().opts().haveEmailAddress() !== AccountsHub.C.Identifier.NONE : false;
    },

    // whether we want a username
    haveUsername(){
        return this.amInstance ? this.amInstance.get().opts().haveUsername() !== AccountsHub.C.Identifier.NONE : false;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // whether we are creating a new account (this has been decided/computed by the parent)
    newAccount(){
        return this.isNew;
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
            //signupAutoClose: false, // ignored as DIV-rendered
            signupAutoConnect: false,
            signupSubmit: false,
            name: ACCOUNTS_UI_SIGNUP_PANEL,
            withExternalMessager: true,
            checker: Template.instance().AM.checker
        };
    }
});

Template.account_ident_panel.events({
    'ac-signup-ok .am-account-ident-panel'( event, instance, data ){
        //console.debug( event, instance, data );
        const checker = instance.AM.checker.get();
        if( checker ){
            checker.setValid( data.ok );
            // setup the relevant part of the item
            const item = this.item.get();
            item.emails = item.emails || [];
            item.emails[0] = item.emails[0] || {};
            if( this.amInstance.get().opts().haveEmailAddress() !== AccountsHub.C.Identifier.NONE ){
                item.emails[0].address = data.email;
            }
            if( this.amInstance.get().opts().haveUsername() !== AccountsHub.C.Identifier.NONE ){
                item.username = data.username;
            }
            item.password = data.password;
        }
    }
});
