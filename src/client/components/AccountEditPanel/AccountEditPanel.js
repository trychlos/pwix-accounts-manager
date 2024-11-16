/*
 * pwix:accounts-manager/src/client/components/AccountEditPanel/AccountEditPanel.js
 *
 * Account editor.
 *
 * Let the user edit the Meteor standard accounts attributes
 * + have a 'Roles' panel
 *
 * Parms:
 *  - name: the amClass instance name
 *  - item: the account's object to be edited, or null
 *  - tabs: an optional array of tabs provided by the application
 *  - tabsBefore: an optional array of tabs provided by the application
 *  - tabsUpdates: an optional updates object
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import { AccountsHub } from 'meteor/pwix:accounts-hub';
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
    //console.debug( this );

    self.AM = {
        // the amClass instance
        amInstance: new ReactiveVar( null ),
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

    // get the amClass instance from its name
    self.autorun(() => {
        const name = Template.currentData().name;
        if( name ){
            const instance = AccountsHub.instances[name];
            if( instance ){
                assert( instance instanceof AccountsManager.amClass, 'expect an AccountsManager.amClass, got '+instance );
                self.AM.amInstance.set( instance );
            }
        }
    });

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
        self.AM.isModal.set( self.$( '.AccountEditPanel' ).parent().hasClass( 'modal-body' ));
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
            name: 'AccountEditPanel',
            okFn( valid ){
                if( self.AM.isModal.get()){
                    Modal.set({ buttons: { id: Modal.C.Button.OK, enabled: valid }});
                }
            }
        }));
    });

    // track the checker
    self.autorun(() => {
        const checker = self.AM.checker.get();
        if( checker ){
            //console.debug( 'checker', checker.iCheckableId(), checker.status(), checker.validity());
        }
    });
});

Template.AccountEditPanel.helpers({
    // see below when building tabs:
    //  when defining a new account, the panel will make use of acUserLogin component which provides itself its message zone
    //  do not display in this case
    // pwi 2024- 9-24 rather have a messager for all modals (as usual)
    haveMessager(){
        return this.item !== null;
    },
    isModal(){
        return Template.instance().AM.isModal.get() === true;
    },

    // parms to Forms.Messager
    parmsMessager(){
        return {
            messager: Template.instance().AM.messager
        };
    },

    // parms for TabbedTemplate
    parmsTabbed(){
        const amInstance = Template.instance().AM.amInstance.get();
        const paneData = {
            item: Template.instance().AM.item,
            isNew: Template.instance().AM.isNew.get(),
            checker: Template.instance().AM.checker,
            amInstance: Template.instance().AM.amInstance
        };
        let tabs = [];
        if( this.tabsBefore ){
            if( _.isArray( this.tabsBefore ) && this.tabsBefore.length ){
                this.tabsBefore.forEach(( tab ) => {
                    tab.paneData = _.merge( {}, tab.paneData, paneData );
                    tabs.push( tab );
                });
            } else {
                console.warn( 'expect tabsBefore be an array, got', this.tabsBefore );
            }
        }
        if( amInstance.haveIdent()){
            tabs.push({
                name: 'account_ident_tab',
                navLabel: pwixI18n.label( I18N, 'tabs.ident_title' ),
                paneTemplate: 'account_ident_panel',
                paneData: paneData
            });
        }
        if( this.tabs ){
            if( _.isArray( this.tabs ) && this.tabs.length ){
                this.tabs.forEach(( tab ) => {
                    tab.paneData = _.merge( {}, tab.paneData, paneData );
                    tabs.push( tab );
                });
            } else {
                console.warn( 'expect tabs be an array, got', this.tabs );
            }
        }
        if( amInstance.haveRoles()){
            tabs.push({
                name: 'account_roles_tab',
                navLabel: pwixI18n.label( I18N, 'tabs.roles_title' ),
                paneTemplate: 'account_roles_panel',
                paneData: paneData
            });
        }
        const adminNotes = amInstance.fieldSet().byName( 'adminNotes' );
        if( adminNotes ){
            tabs.push({
                name: 'account_admin_notes_tab',
                navLabel: adminNotes.toForm().title,
                paneTemplate: 'NotesEdit',
                paneData(){
                    return {
                        item: paneData.item,
                        field: adminNotes
                    };
                }
            });
        }
        const userNotes = amInstance.fieldSet().byName( 'userNotes' );
        if( userNotes ){
            tabs.push({
                name: 'account_user_notes_tab',
                navLabel: userNotes.toForm().title,
                paneTemplate: 'NotesEdit',
                paneData(){
                    return {
                        item: paneData.item,
                        field: userNotes
                    };
                }
            });
        }
        // update these tabs if asked for
        if( this.tabsUpdates ){
            Object.keys( this.tabsUpdates ).forEach(( it ) => {
                let found = false;
                tabs.every(( tab ) => {
                    if( tab.name === it ){
                        found = true;
                        _.merge( tab, this.tabsUpdates[it] );
                    }
                    return !found;
                });
            });
        }
        //console.debug( 'tabs', tabs, this );
        return {
            name: ACCOUNT_EDIT_TABBED,
            tabs: tabs,
            activateTab: paneData.isNew ? 0 : undefined
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
        //console.debug( 'item', item );
        // we cannot call here AccountHub.ahClass.preferredLabel() as this later requires an id - so compute something not too far of that
        //  must have at least one of these
        const label = ( item.emails && item.emails[0]?.address ) || item.username || ( item.usernames && item.usernames[0]?.username ) || item._id || pwixI18n.label( I18N, 'edit.new_label' );
        // when creating a new account, we let the user create several by reusing the same modal
        const updateRoles = async function( user ){
            if( instance.AM.amInstance.get().haveRoles()){
                const roles = Package['pwix:roles'].Roles.EditPanel.roles();
                return await Package['pwix:roles'].Roles.setUserRoles( user, roles );
            }
            return true;
        };
        if( instance.AM.isNew.get()){
            const closeAfterNew = instance.AM.amInstance.get().closeAfterNew();
            if( instance.AM.amInstance.get().name() === AccountsHub.ahOptions._defaults.name ){
                AccountsUI.Features.createUser({
                    username: item.username,
                    password: item.password,
                    email: item.emails[0].address
                }, {
                    name: ACCOUNTS_UI_SIGNUP_PANEL,
                    successFn(){
                        instance.AM.amInstance.get().byEmailAddress( item.emails[0].address ).then( async ( user ) => {
                            if( user ){
                                item._id = user._id;
                                instance.$( '.c-account-ident-panel .ac-signup' ).trigger( 'ac-clear-panel' );
                                instance.$( '.c-account-roles-panel' ).trigger( 'clear-panel' );
                                instance.$( '.NotesEdit' ).trigger( 'clear-panel' );
                                instance.AM.$tabbed.trigger( 'tabbed-do-activate', { tabbedId: instance.AM.tabbedId, index: 0 });
                                const res = await updateRoles( item );
                            } else {
                                console.warn( 'unable to retrieve the user account', label );
                            }
                        });
                        if( closeAfterNew ){
                            Modal.close();
                        }
                    }
                });
            } else {
                const fn = instance.AM.amInstance.get().clientNewFn();
                if( fn ){
                    fn( item, instance.AM.amInstance.get().clientNewArgs()).then(( res ) => {
                        if( res ){
                            Tolert.success( pwixI18n.label( I18N, 'edit.new_success', label ));
                        } else {
                            Tolert.error( pwixI18n.label( I18N, 'edit.new_error', label ));
                        }
                        if( closeAfterNew ){
                            Modal.close();
                        }
                    });
                } else {
                    console.warn( 'refusing to call AccountsUI.Features.createUser() on amInstance', instance.AM.amInstance.get());
                }
            }

        // on update, then... update and close
        } else {
            const fn = instance.AM.amInstance.get().clientUpdateFn();
            let promise;
            if( fn ){
                promise = fn( item, instance.AM.amInstance.get().clientUpdateArgs());
            } else {
                promise = Meteor.callAsync( 'pwix_accounts_manager_accounts_update_account', self.name, item, self.item );
            }
            promise.then( async ( res ) => {
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
