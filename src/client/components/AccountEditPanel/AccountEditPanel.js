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
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/pwix:roles';

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
        isModal: false
    };

    // keep the initial 'new' state
    self.autorun(() => {
        self.AM.isNew.set( _.isNil( Template.currentData().item ));
    });

    // setup the item to be edited
    self.autorun(() => {
        self.AM.item.set( _.cloneDeep( Template.currentData().item || {} ));
    });
});

Template.AccountEditPanel.onRendered( function(){
    const self = this;

    // whether we are running inside of a Modal
    self.AM.isModal = self.$( '.AccountEditPanel' ).closest( '.modal-dialog' ).length > 0;

    // set the modal target+title
    if( self.AM.isModal ){
        Modal.set({
            target: self.$( '.AccountEditPanel' )
        });
    }

    // allocate an Checker for this (topmost parent) template
    self.autorun(() => {
        self.AM.checker.set( new Forms.Checker( self, {
            messager: self.AM.messager,
            okFn( valid ){
                if( self.AM.isModal ){
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
        const tabs = [{
            tabid: 'ident_tab',
            paneid: 'ident_pane',
            navLabel: pwixI18n.label( I18N, 'tabs.ident_title' ),
            paneTemplate: 'account_ident_panel',
            paneData: paneData
        }];
        // when creating a new account, do not display the roles tab
        //  in other words: only let the roles be set/updated on an existing account
        if( this.item ){
            tabs.push({
                tabid: 'roles_tab',
                paneid: 'roles_pane',
                navLabel: pwixI18n.label( I18N, 'tabs.roles_title' ),
                paneTemplate: 'account_roles_panel',
                paneData: paneData
            });
        }
        const adminNotes = AccountsManager.fieldSet.get().byName( 'adminNotes' );
        const userNotes = AccountsManager.fieldSet.get().byName( 'userNotes' );
        tabs.push(
            {
                tabid: 'admin_notes_tab',
                paneid: 'admin_notes_pane',
                navLabel: adminNotes.toForm().title,
                paneTemplate: 'NotesEdit',
                paneData(){
                    return {
                        item: dataContext.item,
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
                        item: dataContext.item,
                        field: userNotes
                    };
                }
            }
        );
        return {
            tabs: tabs
        };
    }
});

Template.AccountEditPanel.events({
    // this component is expected to 'know' which of its subcomponents uses or not a FormChecker.
    //  those who are using FormChecker directly update the edited item
    //  we have to manage others
    'notes-data .AccountEditPanel'( event, instance, data ){
        instance.AM.item.get()[data.field.name()] = data.content;
        // let bubble the event to be handled by client_edit
    },

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
        let item = instance.AM.item.get();
        AccountsTools.preferredLabel( item ).then(( label ) => {
            // when creating a new account, we let the user create several by reusing the same modal
            if( instance.AM.isNew.get()){
                AccountsUI.Account.createUser({
                    username: item.username,
                    password: item.password,
                    email: item.emails[0].address
                }, {
                    autoConnect: false,
                    successFn(){
                        AccountsTools.byEmail( email ).then(( user ) => {
                            if( user ){
                                item._id = user._id;
                            } else {
                                console.warn( 'unable to retrieve the user account', label );
                            }
                        });
                    }
                });
                instance.$( '.c-account-ident-panel .ac-signup' ).trigger( 'ac-clear-panel' );
                instance.$( '.c-account-roles-panel' ).trigger( 'clear-panel' );
                instance.$( '.notes-edit' ).trigger( 'clear-panel' );
            // on update, then... update and close
            } else {
                // update users
                return Meteor.callAsync( 'account.updateAccount', item );
            }
        }).then(( res ) => {
            console.debug( 'res', res );
            if( !instance.AM.isNew.get()){
                // update roles
                Modal.close();
            }
        });
        // whether the user has been just created or is to be updated, other panels are to be considered separately
        const _updateFromPanels = function(){
            // roles panel: replace all roles for the user
            /*
            Roles.removeAllRolesFromUser( item._id ).then(( res ) => {
                item.roles.every(( role ) => {
                    const scope = role.scope;
                    Meteor.callPromise( 'Roles.addUsersToRoles', item._id, role._id, scope === 'NONE' ? {} : { scope: scope })
                        .then(( res ) => {
                            //console.debug( 'Roles.addUsersToRoles()', role.doc._id, res );
                        });
                    return true;
                });
            });
            */
        }
    }
});
