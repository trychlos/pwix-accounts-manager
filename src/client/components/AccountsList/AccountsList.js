/*
 * pwix:accounts-manager/src/client/components/AccountsList/AccountsList.js
 *
 * Display here a table whith a row per account (the 'item'), whatever be the count of email addresses and if the account has a username.
 *
 * Parms:
 * - none
 */

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
            handle: self.subscribe( 'accounts.listAll' ),
            list: new ReactiveVar( [] )
        },
        assignments: {
            handle: self.subscribe( 'Roles.allAssignments'),
            list: null
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
                //console.debug( users );
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
        return AccountsManager.perms.get( 'list' );
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    }
});

Template.AccountsList.events({
    // delete an account
    'tabular-delete-event .AccountsList'( event, instance, data ){
        const label = data.item.emails.length ? data.item.emails[0].address : data.item._id;
        Meteor.callAsync( 'account.remove', data._id, ( e, res ) => {
            if( e ){
                Tolert.error({ type:e.error, message:e.reason });
            } else {
                Tolert.success( pwixI18n.label( I18N, 'delete.success', label ));
            }
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
            item: data.item
        });
        return false;
    }
});
