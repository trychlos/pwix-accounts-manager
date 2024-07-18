/*
 * pwix:accounts-manager/src/client/components/AccountEditPanel/AccountEditPanel.js
 *
 * Account editor.
 *
 * Let the user edit the Meteor standard accounts attributes
 * + have a 'Roles' panel
 *
 * Parms:
 *  - item: the account's object to be edited, or null
 */

import _ from 'lodash';

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import { AccountsUI } from 'meteor/pwix:accounts-ui';
import { Forms } from 'meteor/pwix:forms';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';

import '../account_email_row/account_email_row.js';
import '../account_emails_list/account_emails_list.js';
import '../account_ident_panel/account_ident_panel.js';
import '../account_roles_panel/account_roles_panel.js';

import './AccountEditPanel.html';

Template.AccountEditPanel.onCreated( function(){
    const self = this;

    self.AM = {
        // the global Checker for this modal
        checker: new ReactiveVar( null ),
        // the global Message zone for this modal
        messager: new Forms.Messager(),
        // whether the item is a new one ?
        isNew: new ReactiveVar( false ),
        // the item to be edited (a deep copy of the original)
        item: new ReactiveVar( null ),
        // whether we are running inside of a Modal
        isModal: new ReactiveVar( false ),

        // addressing the Tabbed component
        tabbedId: null,
        $tabbed: null
    };

    // keep the initial 'new' state
    self.autorun(() => {
        self.AM.isNew.set( _.isNil( Template.currentData().item ));
    });

    // setup the item to be edited
    self.autorun(() => {
        self.AM.item.set( _.cloneDeep( Template.currentData().item || {} ));
    });

    // (non reactively) setup default value on new item
    self.autorun(() => {
        if( self.AM.isNew.get()){
            let item = self.AM.item.get();
            item.loginAllowed = true;
        }
    });
});

Template.AccountEditPanel.onRendered( function(){
    const self = this;

    // whether we are running inside of a Modal
    self.autorun(() => {
        self.AM.isModal.set( self.$( '.AccountEditPanel' ).closest( '.modal-dialog' ).length > 0 );
    });

    // set the modal target+title
    self.autorun(() => {
        if( self.AM.isModal.get()){
            Modal.set({
                target: self.$( '.AccountEditPanel' )
            });
        }
    });

    // allocate an Checker for this (topmost parent) template
    self.autorun(() => {
        self.AM.checker.set( new Forms.Checker( self, {
            messager: self.AM.messager,
            okFn( valid ){
                if( self.AM.isModal.get()){
                    Modal.set({ buttons: { id: Modal.C.Button.OK, enabled: valid }});
                }
            }
        }));
    });
});

Template.AccountEditPanel.helpers({
    // see below when building tabs:
    //  when defining a new account, the panel will make use of acUserLogin component which provides itself its message zone
    //  do not display in this case
    haveMessager(){
        return this.item !== null;
    },

    // parms to Forms.Messager
    parmsMessager(){
        return {
            messager: Template.instance().AM.messager
        };
    },

    // parms for TabbedTemplate
    parmsTabbed(){
        const dataContext = this;
        const paneData = {
            item: Template.instance().AM.item,
            isNew: Template.instance().AM.isNew.get(),
            checker: Template.instance().AM.checker
        };
        const adminNotes = AccountsManager.fieldSet.get().byName( 'adminNotes' );
        const userNotes = AccountsManager.fieldSet.get().byName( 'userNotes' );
        let tabs = [
            {
                tabid: 'ident_tab',
                paneid: 'ident_pane',
                navLabel: pwixI18n.label( I18N, 'tabs.ident_title' ),
                paneTemplate: 'account_ident_panel',
                paneData: paneData
            }
        ];
        if( Package['pwix:roles'] ){
            tabs.push({
                tabid: 'roles_tab',
                paneid: 'roles_pane',
                navLabel: pwixI18n.label( I18N, 'tabs.roles_title' ),
                paneTemplate: 'account_roles_panel',
                paneData: paneData
            });
        }
        tabs.push({
            tabid: 'admin_notes_tab',
            paneid: 'admin_notes_pane',
            navLabel: adminNotes.toForm().title,
            paneTemplate: 'NotesEdit',
            paneData(){
                return {
                    item: paneData.item,
                    field: adminNotes
                };
            }
        },
        {
            tabid: 'user_notes_tab',
            paneid: 'user_notes_pane',
            navLabel: userNotes.toForm().title,
            paneTemplate: 'NotesEdit',
            paneData(){
                return {
                    item: paneData.item,
                    field: userNotes
                };
            }
        });
        return {
            name: ACCOUNT_EDIT_TABBED,
            tabs: tabs
        };
    }
});

Template.AccountEditPanel.events({
    // submit
    //  event triggered in case of a modal
    'md-click .AccountEditPanel'( event, instance, data ){
        //console.debug( event, data );
        if( data.button.id === Modal.C.Button.OK ){
            instance.$( event.currentTarget ).trigger( 'iz-submit' );
        }
    },

    // submit
    'iz-submit .AccountEditPanel'( event, instance ){
        //console.debug( event, instance );
        const self = this;
        let item = instance.AM.item.get();
        console.debug( 'item', item );
        // we cannot call here AccountTools.preferredLabel() as this later requires an id - so compute something not too far of that
        //  must have at least one of these two
        const label = item.emails[0].address || item.username;
        // when creating a new account, we let the user create several by reusing the same modal
        const updateRoles = async function( user ){
            if( Package['pwix:roles'] ){
                const roles = Package['pwix:roles'].Roles.EditPanel.roles();
                return await Package['pwix:roles'].Roles.setUserRoles( user, roles );
            }
        };
        if( instance.AM.isNew.get()){
            AccountsUI.Account.createUser({
                username: item.username,
                password: item.password,
                email: item.emails[0].address
            }, {
                name: ACCOUNTS_UI_SIGNUP_PANEL,
                successFn(){
                    AccountsTools.byEmail( item.emails[0].address ).then( async ( user ) => {
                        if( user ){
                            item._id = user._id;
                            instance.$( '.c-account-ident-panel .ac-signup' ).trigger( 'ac-clear-panel' );
                            instance.$( '.c-account-roles-panel' ).trigger( 'clear-panel' );
                            instance.$( '.notes-edit' ).trigger( 'clear-panel' );
                            instance.AM.$tabbed.trigger( 'tabbed-do-activate', { tabbedId: instance.AM.tabbedId, index: 0 });
                            const res = await updateRoles( item );
                        } else {
                            console.warn( 'unable to retrieve the user account', label );
                        }
                    });
                }
            });
        // on update, then... update and close
        } else {
            // update account
            Meteor.callAsync( 'pwix_accounts_manager_accounts_update_account', item ).then( async ( res ) => {
                if( res ){
                    res = await updateRoles( item );
                }
                if( res ){
                    Tolert.success( pwixI18n.label( I18N, 'edit.edit_success', label ));
                } else {
                    Tolert.error( pwixI18n.label( I18N, 'edit.edit_error', label ));
                }
                Modal.close();
            });
        }
    },

    // get the Tabbed identifier to be able to address it
    'tabbed-rendered .AccountEditPanel'( event, instance, data ){
        if( data.tabbedName === ACCOUNT_EDIT_TABBED ){
            instance.AM.tabbedId = data.tabbedId;
            instance.AM.$tabbed = data.$tabbed;
        }
    }
});
