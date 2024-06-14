/*
 * pwix:accounts-manager/src/client/components/AccountsList/AccountsList.js
 *
 * Parms:
 * - see README
 */

import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Roles } from 'meteor/pwix:roles';
import { Tolert } from 'meteor/pwix:tolert';

import '../AccountPanel/AccountPanel.js';

import './AccountsList.html';

Template.AccountsList.onCreated( function(){
    const self = this;

    self.AL = {
        accounts: {
            handle: self.subscribe( 'accounts.listAll' ),
            list: new ReactiveVar( [] )
        },
        assignments: {
            handle: self.subscribe( 'Roles.allAssignments'),
            list: null
        },
        // returns the identified user
        user( id ){
            //console.log( 'id',id, 'accounts', self.APP.accounts.list.get());
            let found = null;
            self.AL.accounts.list.get().every(( u ) => {
                if( u._id === id ){
                    found = u;
                    return false;
                }
                return true;
            });
            return found;
        },
        /*
        email( item ){
            return item.emails[0].address;
        },
        // the user_edit template view
        userEditView: null
        */
    };

    // load the user's list
    self.autorun(() => {
        if( self.AL.accounts.handle.ready()){
            //console.debug( 'accounts handle ready' );
            let users = [];
            Meteor.users.find().forEach(( u ) => {
                u.attributedRoles = new ReactiveVar( [] );
                users.push( u );
            });
            self.AL.accounts.list.set( users );
            //console.debug( users );
        }
    });

    // attach to each user a reactive var with his/her set of (attributed) roles
    self.autorun(() => {
        if( self.AL.assignments.handle.ready()){
            self.AL.accounts.list.get().forEach(( u ) => {
                Roles.directRolesForUser( u, { anyScope: true }).then(( res ) => {
                    u.attributedRoles.set( res );
                });
            });
        }
    });

    // debug (attributed) roles
    self.autorun(() => {
        if( false ){
            self.AL.accounts.list.get().forEach(( u ) => {
                console.debug( u.attributedRoles.get());
            });
        }
    });
});

Template.AccountsList.helpers({
    // whether the current user has the permission to see the list of accounts
    allowed(){
        return true;
    }
});

Template.AccountsList.events({
    // delete an account
    'tabular-ext-delete-event .AccountsList'( event, instance, data ){
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
    'tabular-ext-edit-event .AccountsList'( event, instance, data ){
        Modal.run({
            mdBody: 'AccountPanel',
            mdButtons: [ Modal.C.Button.CANCEL, Modal.C.Button.OK ],
            mdClasses: 'modal-lg',
            //mdClassesContent: Meteor.APP.Pages.current.page().get( 'theme' ),
            mdTitle: pwixI18n.label( I18N, 'edit.modal_title' ),
            item: data.item
        });
        return false;
    }
});
