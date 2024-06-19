/*
 * pwix:accounts-manager/src/client/components/AccountPanel/AccountPanel.js
 *
 * Account editor.
 *
 * Parms:
 *  - item: the account's object to be edited, or null
 */

import _ from 'lodash';

import { AccountsUI } from 'meteor/pwix:accounts-ui';
import { Forms } from 'meteor/pwix:forms';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/pwix:roles';

import '../account_email_row/account_email_row.js';
import '../account_ident_panel/account_ident_panel.js';
//import '/imports/client/components/account_roles_panel/account_roles_panel.js';
//import '/imports/client/components/account_settings_panel/account_settings_panel.js';

import './AccountPanel.html';

Template.AccountPanel.onCreated( function(){
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

Template.AccountPanel.onRendered( function(){
    const self = this;

    // whether we are running inside of a Modal
    self.AM.isModal = self.$( '.AccountPanel' ).closest( '.modal-dialog' ).length > 0;

    // set the modal target+title
    if( self.AM.isModal ){
        Modal.set({
            target: self.$( '.AccountPanel' )
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

Template.AccountPanel.helpers({
    // parms to coreErrorMsg
    parmsErrorMsg(){
        return {
            orderable: Template.instance().AM.messager
        };
    },

    // parms for TabbedTemplate
    parmsTabbed(){
        const dataContext = this;
        const paneData = {
            item: Template.instance().AM.item,
            checker: Template.instance().AM.checker
        };
        return {
            tabs: [
                {
                    tabid: 'ident_tab',
                    paneid: 'ident_pane',
                    navLabel: pwixI18n.label( I18N, 'tabs.ident_title' ),
                    paneTemplate: 'account_ident_panel',
                    paneData: paneData
                },
                /*
                {
                    tabid: 'roles_tab',
                    paneid: 'roles_pane',
                    navLabel: pwixI18n.label( I18N, 'accounts.manager.roles_title' ),
                    paneTemplate: 'account_roles_panel',
                    paneData: paneData
                },
                {
                    tabid: 'settings_tab',
                    paneid: 'settings_pane',
                    navLabel: pwixI18n.label( I18N, 'accounts.manager.settings_title' ),
                    paneTemplate: 'account_settings_panel',
                    paneData: paneData
                },
                {
                    navLabel: pwixI18n.label( I18N, 'ext_notes.panel.tab_title' ),
                    paneTemplate: 'ext_notes_panel',
                    paneData(){
                        return {
                            notes: dataContext.item ? dataContext.item.notes : '',
                            event: 'panel-data',
                            data: {
                                emitter: 'notes'
                            }
                        };
                    }
                }
                    */
            ]
        };
    }
});

Template.AccountPanel.events({
    // this component is expected to 'know' which of its subcomponents uses or not a FormChecker.
    //  those who are using FormChecker directly update the edited item
    //  we have to manage others
    'panel-data .AccountPanel'( event, instance, data ){
        //console.debug( 'id', data.id, 'myTabId', instance.AM.tabId.get(), data );
        switch( data.emitter ){
            case 'notes':
                instance.item.get().notes = data.data;
                break;
        }
        // let bubble the event to be handled by client_edit
    },

    // submit
    //  event triggered in case of a modal
    'md-click .AccountPanel'( event, instance, data ){
        //console.debug( event, data );
        if( data.button.id === Modal.C.Button.OK ){
            instance.$( event.currentTarget ).trigger( 'iz-submit' );
        }
    },

    // submit
    'iz-submit .AccountPanel'( event, instance ){
        //console.debug( event, instance );
        let item = instance.AM.item.get();
        let email = item.emails[0].address;
        // merge all data parts
        Object.keys( instance.AM.dataParts.all()).every(( emitter ) => {
            // ident panel
            if( emitter === 'ident' ){
                ;
            } else if( emitter === 'roles' ){
                item.roles = instance.AM.dataParts.get( emitter ).data;
            } else if( emitter === 'settings' ){
                ;
            } else if( emitter === 'notes' ){
                item.notes = instance.AM.dataParts.get( emitter ).data
            }
            return true;
        });
        console.debug( 'item', item );
        // after the user has been created we get back its internal identifier to be used on updates for other panels
        //  a Promise which resolves to the newly created user account
        const _getAccountAfterCreation = function( email ){
            return Meteor.callPromise( 'account.byEmail', email );
        };
        // whether the user has been just created or is to be updated, other panels are to be considered separately
        const _updateFromPanels = function(){
            // roles panel: replace all roles for the user
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
            // notes panel
            if( item.notes ){
                Meteor.callPromise( 'account.setAttribute', item._id, { notes: item.notes });
            } else {
                Meteor.callPromise( 'account.clearAttributes', item._id, [ 'notes' ]);
            }
        }
        // when creating a new account, we let the user create several by reusing the same modal
        if( instance.AM.isNew.get()){
            AccountsUI.Account.createUser({
                username: item.username,
                password: item.password,
                email: email
            }, {
                autoConnect: false,
                successFn(){
                    _getAccountAfterCreation( item.email ).then(( user ) => {
                        if( user ){
                            item._id = user._id;
                            _updateFromPanels();
                        } else {
                            console.warn( 'unable to retrieve the user account', item.email );
                        }
                    });
                }
            });
            instance.$( '.c-account-ident-panel .ac-signup' ).trigger( 'ac-clear-panel' );
            instance.$( '.c-account-roles-panel' ).trigger( 'clear-panel' );
            instance.$( '.c-account-settings-panel' ).trigger( 'clear-panel' );
            instance.$( '.c-notes-panel' ).trigger( 'clear-panel' );
        } else {
            // update users
            Meteor.call( 'account.updateUser', item );
            _updateFromPanels();
            Modal.close();
        }
    }
});
