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
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';

import './account_ident_panel.html';

Template.account_ident_panel.onCreated( function(){
    const self = this;

    self.AM = {
        panel: new Forms.PanelSpec({
            username: {
                js: '.js-username'
            },
            loginAllowed: {
                js: '.js-login-allowed'
            }
        }),
        emailsCount: new ReactiveVar( 0 ),
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
                    //data: self.AM.form.get().getForm()
                });
            }
        }
    };

    // initialize the count of email addresses
    self.autorun(() => {
        const item = Template.currentData().item.get();
        self.AM.emailsCount.set(( item.emails || [] ).length );
    });

    // tracking the count of email addresses
    self.autorun(() => {
        console.debug( 'emailsCount', self.AM.emailsCount.get());
    });
});

Template.account_ident_panel.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker.get();
        const checker = self.AM.checker.get();
        if( parentChecker && !checker ){
            self.AM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: self.AM.panel.iPanelPlus( AccountsManager.fieldsSet ),
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
        const form = self.AM.form.get();
        if( form ){
            const dataContext = Template.currentData();
            form.setData({ item: dataContext.item })
                .setForm( dataContext.item.get())
                .check({ update: false }).then(( valid ) => { self.AM.sendPanelData( dataContext, valid ); });
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

    // emails addresses list
    itemsList(){
        return this.item.get().emails || [];
    },

    // whether we are creating a new account
    newAccount(){
        return !this.item || !this.item.get() || !Object.keys( this.item.get()).length;
    },

    // passes the smae data conext, just replacing the parent checker by our own
    parmsEmailRow( it ){
        const parms = { ...this };
        parms.checker = Template.instance().AM.checker;
        parms.emailsCount = Template.instance().AM.emailsCount;
        parms.it = it;
        return parms;
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
    },

    plusEnabled(){
        return '';
    }
});

Template.account_ident_panel.events({
    'ac-signup-ok .c-account-ident-panel'( event, instance, data ){
        //console.debug( event, instance, data );
        const ok = data.ok;
        delete data.ok;
        instance.AM.sendPanelData({
            emitter: 'ident',
            ok: ok,
            data: { ...data }
        });
    },

    'click .c-account-ident-panel .js-plus'( event, instance ){
        console.debug( 'click.js-plus' );
        const item = this.item.get();
        item.emails = item.emails || [];
        const id = Random.id();
        item.emails.push({
            id: id
        });
        this.item.set( item );
        //const count = instance.AM.emailsCount.get();
        //instance.AM.emailsCount.set( count+1 );
    }

        /*
    'input .c-account-ident-panel'( event, instance ){
        if( !Object.keys( event.originalEvent ).includes( 'FormChecker' ) || event.originalEvent['FormChecker'].handled !== true ){
            const dataContext = this;
            instance.AM.checker.get().inputHandler( event ).then(( valid ) => { instance.AM.sendPanelData( dataContext, valid ); });
        }
    }
            */
});
