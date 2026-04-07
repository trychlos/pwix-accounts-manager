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
 * - amInstance: a ReactiveVar which holds the amAccount instance
 */

import _ from 'lodash';
import strftime from 'strftime';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { AccountsUI } from 'meteor/pwix:accounts-ui';
import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import { amChecks } from '../../../common/helpers/am-checks.js';

import '../account_email_row/account_email_row.js';
import '../account_emails_list/account_emails_list.js';

import './account_ident_panel.html';

const logger = Logger.get();

Template.account_ident_panel.onCreated( function(){
    const self = this;

    self.AM = {
        fields: {
            loginAllowed: {
                js: '.js-login-allowed',
                form_status: Forms.C.ShowStatus.NONE
            },
            loginLastConnection: {
                js: '.js-last-login',
                formTo( $node, item ){
                    return $node.val( item.loginLastConnection ? strftime( AccountsManager.configure().datetime, item.loginLastConnection ) : '' );
                }
            }
        },
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null )
    };

    // setup the fields depending of the accounts configuration
    self.autorun(() => {
        const amInstance = Template.currentData().amInstance;
        if( amInstance && amInstance.get().usernameMayHaveOne()){
            self.AM.fields.username = {
                js: '.js-username'
            };
        }
    });
});

Template.account_ident_panel.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    let running = false;
    self.autorun(( comp ) => {
        const amInstance = Template.currentData().amInstance.get();
        const parentChecker = Template.currentData().checker.get();
        let checker = self.AM.checker.get();
        if( amInstance && parentChecker && !checker && !running ){
            running = true;
            Tracker.nonreactive(() => {
                checker = new Forms.Checker( self );
                checker.init({
                    parentChecker: parentChecker,
                    panel: {
                        fields: self.AM.fields,
                        set: amInstance.fieldSet()
                    },
                    crossCheckRegisterFn( data, opts ){
                        return amChecks.ident_cross_check( data, opts );
                    },
                    data: {
                        item: Template.currentData().item,
                        amInstance: amInstance
                    }
                }).then(() => {
                    self.AM.checker.set( checker );
                    comp.stop();
                })
            });
        }
    });

    // set up the form from the data context
    self.autorun(( comp ) => {
        const amInstance = Template.currentData().amInstance.get();
        const checker = self.AM.checker.get();
        if( amInstance && checker ){
            checker.setForm( Template.currentData().item.get());
            comp.stop();
        }
    });
});

Template.account_ident_panel.helpers({
    // whether we want an email address
    haveEmailAddress(){
        return this.amInstance ? this.amInstance.get().opts().haveEmailAddress() !== AccountsCore.C.Identifier.NONE : false;
    },

    // whether we want a username
    haveUsername(){
        return this.amInstance ? this.amInstance.get().opts().haveUsername() !== AccountsCore.C.Identifier.NONE : false;
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
        //logger.debug( event, instance, data );
        const checker = instance.AM.checker.get();
        if( checker ){
            checker.setValid( data.ok ).then(() => {
                // setup the relevant part of the item
                const item = this.item.get();
                item.emails = item.emails || [];
                item.emails[0] = item.emails[0] || {};
                if( this.amInstance.get().opts().haveEmailAddress() !== AccountsCore.C.Identifier.NONE ){
                    item.emails[0].address = data.email;
                }
                if( this.amInstance.get().opts().haveUsername() !== AccountsCore.C.Identifier.NONE ){
                    item.username = data.username;
                }
                item.password = data.password;
            });
        }
    }
});
