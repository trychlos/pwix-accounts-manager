/*
 * pwix:accounts-manager/src/client/components/AccountsList/AccountsList.js
 *
 * Display here a table whith a row per account (the 'item'), whatever be the count of email addresses and if the account has a username.
 *
 * Parms:
 * - none
 */

import { AccountsTools } from 'meteor/pwix:accounts-tools';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Roles } from 'meteor/pwix:roles';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';

import '../AccountEditPanel/AccountEditPanel.js';

import './AccountsList.html';

Template.AccountsList.onCreated( function(){
    const self = this;

    self.AM = {
        accounts: {
            handle: self.subscribe( 'pwix_accounts_manager_accounts_list_all' ),
            list: new ReactiveVar( [] )
        },
        assignments: {
            handle: self.subscribe( 'Roles.allAssignments'),
            list: null
        },

        // get the user by id
        // use case: item edition is driven by the tabular display which is able to provide the displayed item
        //  but the reactivity of the tabular display may be defectuous and the provided item may be not up to date
        //  while the found one here is provided by the Meteor publication reactivity and almost surely up to date
        byId( id ){
            let found = null;
            self.AM.accounts.list.get().every(( doc ) => {
                if( doc._id === id ){
                    found = doc;
                }
                return found === null;
            });
            return found;
        }
    };

    // load the user's list
    self.autorun(() => {
        if( self.AM.accounts.handle.ready()){
            //console.debug( 'accounts handle ready' );
            let users = [];
            Meteor.users.find().forEachAsync(( o ) => {
                o.attributedRoles = new ReactiveVar( [] );
                users.push( o );
            }).then(() => {
                self.AM.accounts.list.set( users );
                console.debug( 'accounts', users );
            });
        }
    });

    // attach to each user a reactive var with his/her set of (attributed) roles
    self.autorun(() => {
        if( self.AM.assignments.handle.ready()){
            self.AM.accounts.list.get().forEach(( u ) => {
                Roles.directRolesForUser( u, { anyScope: true }).then(( res ) => {
                    u.attributedRoles.set( res );
                });
            });
        }
    });

    // debug (attributed) roles
    self.autorun(() => {
        if( false ){
            self.AM.accounts.list.get().forEach(( u ) => {
                console.debug( u.attributedRoles.get());
            });
        }
    });
});

Template.AccountsList.helpers({
    // whether the current user has the permission to see the list of accounts
    canList(){
        const res = AccountsManager.perms.get( 'list' );
        //console.debug( 'res', res );
        return res;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // tabular identifier
   tabularId(){
        return TABULAR_ID;
    }
});

Template.AccountsList.events({
    // delete an account
    'tabular-delete-event .AccountsList'( event, instance, data ){
        let label = null;
        AccountsTools.preferredLabel( data.item )
            .then(( res ) => {
                label = res.label;
                Meteor.callAsync( 'pwix_accounts_manager_accounts_remove', data.item._id )
            })
            .then(() => {
                Tolert.success( pwixI18n.label( I18N, 'delete.success', label ));
            })
            .catch(( e ) => {
                Tolert.error({ type:e.error, message:e.reason });
            });
        return false; // doesn't propagate
    },

    // edit an account
    'tabular-edit-event .AccountsList'( event, instance, data ){
        Modal.run({
            mdBody: 'AccountEditPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: 'modal-lg',
            mdClassesContent: AccountsManager.configure().classes,
            mdTitle: pwixI18n.label( I18N, 'edit.modal_title' ),
            item: instance.AM.byId( data.item._id )
        });
        return false;
    }
});
