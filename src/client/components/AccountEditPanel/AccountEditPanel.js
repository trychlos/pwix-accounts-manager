/*
 * pwix:accounts-manager/src/client/components/AccountEditPanel/AccountEditPanel.js
 *
 * Account editor.
 *
 * Let the user edit the Meteor standard accounts attributes
 * + have a 'Roles' panel
 *
 * Parms:
 *  - name: the amAccount instance name
 *  - item: the account's object to be edited, or null
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { AccountsUI } from 'meteor/pwix:accounts-ui';
import { check, Match } from 'meteor/check';
import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';

import '../account_ident_tab/account_ident_tab.js';
import '../account_roles_tab/account_roles_tab.js';

import './AccountEditPanel.html';

const logger = Logger.get();

Template.AccountEditPanel.onCreated( function(){
    const self = this;
    //logger.debug( this );

    self.AM = {
        // the amAccount instance
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
        // tabs list
        defaultTabs: null,
        tabsList: new ReactiveVar( null ),
        // addressing the Tabbed component
        tabbedId: null,
        $tabbed: null
    };

    // get the amAccount instance from its name
    self.autorun(() => {
        const name = Template.currentData().name;
        if( name ){
            const amInstance = AccountsCore.getInstance( name );
            check( amInstance, AccountsManager.amAccount );
            self.AM.amInstance.set( amInstance );
        }
    });

    // keep the initial 'new' state
    self.autorun(() => {
        self.AM.isNew.set( _.isNil( Template.currentData().item ));
    });

    // setup the item to be edited
    self.autorun(() => {
        const clone = _.cloneDeep( Template.currentData().item || {} );
        if( self.AM.isNew.get()){
            clone.loginAllowed = true;
        }
        self.AM.item.set( clone );
    });

    // build default tab names array
    self.autorun(() => {
        const amInstance = self.AM.amInstance.get();
        if( amInstance && !self.AM.defaultTabs ){
            tabsList = [];
            tabsList.push({
                name: 'account_ident_tab',
                navLabel: pwixI18n.label( I18N, 'tabs.ident_title' ),
                paneTemplate: 'account_ident_tab'
            });
            if( amInstance.haveRoles()){
                tabsList.push({
                    name: 'account_roles_tab',
                    navLabel: pwixI18n.label( I18N, 'tabs.roles_title' ),
                    paneTemplate: 'account_roles_tab'
                });
            }
            const adminNotes = amInstance.fieldSet().byName( 'adminNotes' );
            if( adminNotes ){
                tabsList.push({
                    name: 'account_admin_notes_tab',
                    navLabel: adminNotes.toForm().title,
                    paneTemplate: 'NotesEdit',
                    paneData(){
                        return {
                            item: self.AM.item,
                            field: adminNotes
                        };
                    }
                });
            }
            const userNotes = amInstance.fieldSet().byName( 'userNotes' );
            if( userNotes ){
                tabsList.push({
                    name: 'account_user_notes_tab',
                    navLabel: userNotes.toForm().title,
                    paneTemplate: 'NotesEdit',
                    paneData(){
                        return {
                            item: self.AM.item,
                            field: userNotes
                        };
                    }
                });
            }
            self.AM.defaultTabs = tabsList;
        }
    });

    // build dynamic tabs list
    self.autorun(() => {
        const amInstance = self.AM.amInstance.get();
        let tabsList = self.AM.tabsList.get();
        if( amInstance && !tabsList ){
            const fn = amInstance.opts().editTabsFn();
            if( fn ){
                fn( self.AM.defaultTabs ).then(( tabs ) => { self.AM.tabsList.set( tabs ); });
            } else {
                self.AM.tabsList.set( self.AM.defaultTabs );
            }
        }
    });
});

Template.AccountEditPanel.onRendered( function(){
    const self = this;
    //logger.debug( self.AM.amInstance.get().fieldSet());

    // whether we are running inside of a Modal
    self.autorun(() => {
        self.AM.isModal.set( self.$( '.AccountEditPanel' ).parent().hasClass( 'modal-body' ));
    });

    // set the modal target+title
    self.autorun(() => {
        if( self.AM.isModal.get()){
            Modal.topmost().set({
                target: self.$( '.AccountEditPanel' )
            });
        }
    });

    // allocate a Checker for this (topmost parent) template (so an autorun is not needed)
    const checker = new Forms.Checker( self);
    checker.init({
        messager: self.AM.messager,
        name: 'AccountEditPanel',
        onValidityChangeRegisterFn( valid ){
            if( self.AM.isModal.get()){
                Modal.topmost().set({ buttons: { id: Modal.C.Button.OK, enabled: valid }});
            }
        }
    }).then(() => {
        self.AM.checker.set( checker );
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
    //  add the default datacontext to tabs which have not a 'paneData' key
    parmsTabbed(){
        const paneData = {
            item: Template.instance().AM.item,
            isNew: Template.instance().AM.isNew.get(),
            checker: Template.instance().AM.checker,
            amInstance: Template.instance().AM.amInstance
        };
        const tabs = Template.instance().AM.tabsList.get();
        for( const tab of tabs ){
            if( !tab.paneData ){
                tab.paneData = paneData;
            }
        }
        /*
        if( this.tabsBefore ){
            if( _.isArray( this.tabsBefore ) && this.tabsBefore.length ){
                this.tabsBefore.forEach(( tab ) => {
                    tab.paneData = _.merge( {}, tab.paneData, paneData );
                    tabs.push( tab );
                });
            } else {
                logger.warn( 'expect tabsBefore be an array, got', this.tabsBefore );
            }
        }
            */
        //logger.debug( 'parmsTabbed', tabs, this );
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
        //logger.debug( event, data );
        if( data.button.id === Modal.C.Button.OK ){
            instance.$( event.currentTarget ).trigger( 'iz-submit' );
        }
    },

    // submit
    'iz-submit .AccountEditPanel'( event, instance ){
        //logger.debug( event, instance );
        const self = this;
        let item = instance.AM.item.get();
        //logger.debug( event, 'item', item );
        // we cannot call here AccountCore.acAccount.preferredLabel() as this requires an id which we have only on update, not on creation - so compute something not too far of that
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
            const closeAfterNew = instance.AM.amInstance.get().editCloseAfterNew();
            if( instance.AM.amInstance.get().name() === AccountsCore.Options._defaults.name ){
                AccountsUI.Features.createUser({
                    username: item.username,
                    password: item.password,
                    email: item.emails[0].address
                }, {
                    name: ACCOUNTS_UI_SIGNUP_PANEL,
                    successFn(){
                        AccountsCore.byEmailAddress( instance.AM.amInstance.get(), item.emails[0].address ).then( async ( user ) => {
                            if( user ){
                                item._id = user._id;
                                instance.$( '.am-account-ident-panel .ac-signup' ).trigger( 'ac-clear-panel' );
                                instance.$( '.am-account-roles-panel' ).trigger( 'clear-panel' );
                                instance.$( '.NotesEdit' ).trigger( 'clear-panel' );
                                instance.AM.$tabbed.trigger( 'tabbed-do-activate', { tabbedId: instance.AM.tabbedId, index: 0 });
                                const res = await updateRoles( item );
                            } else {
                                logger.warn( 'unable to retrieve the user account', label );
                            }
                        });
                        if( closeAfterNew ){
                            Modal.topmost().close();
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
                            Modal.topmost().close();
                        }
                    });
                } else {
                    logger.warn( 'refusing to call AccountsUI.Features.createUser() on amInstance', instance.AM.amInstance.get());
                }
            }

        // on update, then... update and close
        } else {
            const fn = instance.AM.amInstance.get().clientUpdateFn();
            let promise;
            if( fn ){
                promise = fn( item, instance.AM.amInstance.get().clientUpdateArgs());
            } else {
                promise = Meteor.callAsync( 'pwix.AccountsManager.m.updateAccount', self.name, item, self.item );
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
                Modal.topmost().close();
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
