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
import { ReactiveDict } from 'meteor/reactive-dict';
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
        // whether the current user is allowed to edit admin notes
        editAdminNotes: new ReactiveVar( false ),
        // the build buildStatus
        buildStatus: new ReactiveDict(),
        // tabs list
        defaultTabs: new ReactiveVar( null ),
        tabsList: new ReactiveVar( null ),
        // guards to not ask for permission on each update
        prevUserId: null,
        prevTargetId: null,
        // addressing the Tabbed component
        tabbedId: null,
        $tabbed: null
    };

    // get the amAccount instance from its name
    // setup the item to be edited
    self.autorun(() => {
        const dc = Template.currentData();
        if( dc.name ){
            const amInstance = AccountsCore.getInstance( dc.name );
            check( amInstance, AccountsManager.Account );
            self.AM.amInstance.set( amInstance );
        }
        self.AM.isNew.set( _.isNil( dc.item ));
        const clone = _.cloneDeep( dc.item || {} );
        // this will anyway be set by the AccountsCore automatisms at user creation
        //  but this let the UI show what will be created
        if( self.AM.isNew.get()){
            clone.loginAllowed = true;
        }
        self.AM.item.set( clone );
        self.AM.buildStatus.set( 'dc', true );
    });

    // whether the current user can see/edit admin notes for the account
    // recompute the default tabs list when we get the permission
    self.autorun(() => {
        // if we are great enough to create an account, we can suppose that we are allowed to all
        if( self.AM.isNew.get()){
            self.AM.editAdminNotes.set( true );
            self.AM.defaultTabs.set( null );
            self.AM.buildStatus.set( 'permissions', true );

        // else have to ask
        } else {
            AccountsCore.isAllowed( 'pwix.accounts_manager.data.adminNotes', Meteor.userId(), {
                id: self.AM.item.get()._id,
                instance: self.AM.amInstance.get()
            }).then(( res ) => {
                self.AM.editAdminNotes.set( res );
                self.AM.defaultTabs.set( null );
                self.AM.buildStatus.set( 'permissions', true );
            });
        }
    });

    // build default tab names array
    //  must be reactive when permissions arrive
    self.autorun(() => {
        const amInstance = self.AM.amInstance.get();
        let defaultTabs = self.AM.defaultTabs.get();
       if( amInstance && !defaultTabs && self.AM.buildStatus.get( 'dc' ) && self.AM.buildStatus.get( 'permissions' )){
            defaultTabs = [];
            defaultTabs.push({
                name: 'account_ident_tab',
                navLabel: pwixI18n.label( I18N, 'tabs.ident_title' ),
                paneTemplate: 'account_ident_tab'
            });
            if( amInstance.haveRoles()){
                defaultTabs.push({
                    name: 'account_roles_tab',
                    navLabel: pwixI18n.label( I18N, 'tabs.roles_title' ),
                    paneTemplate: 'account_roles_tab'
                });
            }
            const adminNotes = amInstance.fieldSet().byName( 'adminNotes' );
            const editAdminNotes = self.AM.editAdminNotes.get();
            if( adminNotes && editAdminNotes ){
                defaultTabs.push({
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
                defaultTabs.push({
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
            self.AM.defaultTabs.set( defaultTabs );
            self.AM.tabsList.set( null );
            self.AM.buildStatus.set( 'defaultTabs', true );
        }
    });

    // build dynamic tabs list
    self.autorun(() => {
        const amInstance = self.AM.amInstance.get();
        let tabsList = self.AM.tabsList.get();
        if( amInstance && !tabsList && self.AM.buildStatus.get( 'defaultTabs' )){
            const fn = amInstance.opts().editTabsFn();
            if( fn ){
                fn( self.AM.defaultTabs.get()).then(( tabs ) => { self.AM.tabsList.set( tabs ); });
            } else {
                self.AM.tabsList.set( self.AM.defaultTabs.get());
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
        data: {
            item: self.AM.item
        },
        crossCheckRegisterFn( data, opts ){
        },
        onValidityChangeRegisterFn: ( valid ) => {
            if( self.AM.isModal.get()){
                Modal.topmost().set({ buttons: { id: Modal.C.Button.OK, enabled: valid }});
            }
        }
    }).then(() => {
        self.AM.checker.set( checker );
    });

    // monitor the validity of the checker
    self.autorun(() => {
        const checker = self.AM.checker.get();
        if( checker ){
            //logger.debug( 'checker', checker, checker.iSeq(), checker.validity(), checker.buildStatus());
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
    //  add the default datacontext to tabs which have not a 'paneData' key
    parmsTabbed(){
        const tabs = Template.instance().AM.tabsList.get();
        if( tabs ){
            const paneData = {
                item: Template.instance().AM.item,
                isNew: Template.instance().AM.isNew.get(),
                checker: Template.instance().AM.checker,
                amInstance: Template.instance().AM.amInstance
            };
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
        return {};
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
        // we cannot call here AccountCore.Account.preferredLabel() as this requires an id which we have only on update, not on creation - so compute something not too far of that
        //  must have at least one of these
        const label = ( item.emails && item.emails[0]?.address ) || item.username || ( item.usernames && item.usernames[0]?.username ) || item._id || pwixI18n.label( I18N, 'edit.new_label' );
        // update roles from the UI
        const _updateRoles = async function( user ){
            if( instance.AM.amInstance.get().haveRoles()){
                const roles = Package['pwix:roles'].Roles.EditPanel.roles();
                const res = await Package['pwix:roles'].Roles.setUserRoles( user, roles );
                //logger.debug( 'setUserRoles()', roles, 'res', res );
                return res;
            }
            return true;
        };
        // when creating a new account, we may let the user create several by reusing the same modal
        const amInstance = instance.AM.amInstance.get();
        if( instance.AM.isNew.get()){
            const closeAfterNew = amInstance.opts().editCloseAfterNew();
            AccountsCore.createAccount( amInstance, item, Meteor.userId()).then(( res ) => {
                //logger.debug( 'res', res );
                if( res._id ){
                    item._id = res._id;
                    _updateRoles( item );
                    Tolert.success( pwixI18n.label( I18N, 'edit.new_success', label ));
                } else {
                    logger.warning( res );
                    Tolert.error( pwixI18n.label( I18N, 'edit.new_error', label ));
                }
                if( closeAfterNew ){
                    Modal.topmost().close();
                } else {
                    instance.$( '.am-account-ident-panel .ac-signup' ).trigger( 'ac-clear-panel' );
                    instance.$( '.am-account-roles-panel' ).trigger( 'clear-panel' );
                    instance.$( '.NotesEdit' ).trigger( 'clear-panel' );
                    instance.AM.$tabbed.trigger( 'tabbed-do-activate', { tabbedId: instance.AM.tabbedId, index: 0 });
                }
            });
        } else {
            AccountsCore.updateAccount( amInstance, item, Meteor.userId()).then(( res ) => {
                //logger.debug( 'res', res );
                if( res.count ){
                    _updateRoles( item );
                    Tolert.success( pwixI18n.label( I18N, 'edit.edit_success', label ));
                } else {
                    logger.warning( res );
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
