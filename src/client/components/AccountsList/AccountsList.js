/*
 * pwix:accounts-manager/src/client/components/AccountsList/AccountsList.js
 *
 * Parms:
 * - see README
 */

//import { Bootbox } from 'meteor/pwix:bootbox';
//import { jqTable } from 'meteor/pwix:jqtable';
//import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
//import { Roles } from 'meteor/pwix:roles';
//import { Tolert } from 'meteor/pwix:tolert';

import './AccountsList.html';
import './AccountsList.less';

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
        /*
        // compare two booleans
        compareBool( tra, trb, name ){
            const idx = self.$( 'table.js-table th[data-jqwt-name="'+name+'"]' ).data( 'jqwt-idx' );
            const ba = self.$( self.$( tra ).find( 'td' )[idx] ).find( 'input[type="checkbox"]' ).is( ':checked' );
            const bb = self.$( self.$( trb ).find( 'td' )[idx] ).find( 'input[type="checkbox"]' ).is( ':checked' );
            return (( ba && bb ) || ( !ba && !bb )) ? 0 : ( ba ? 1 : -1 );
        },
        // compare isAllowed booleans
        compareBoolAllowed( tra, trb ){
            return self.APP.compareBool( tra, trb, 'allowed' );
        },
        // compare apiAllowed booleans
        compareBoolApiAllowed( tra, trb ){
            return self.APP.compareBool( tra, trb, 'api-allowed' );
        },
        // compare mailVerified booleans
        compareBoolVerified( tra, trb ){
            return self.APP.compareBool( tra, trb, 'verified' );
        },
        // compare two dates
        compareDate( tra, trb, name ){
            const idx = self.$( 'table.js-table th[data-jqwt-name="'+name+'"]' ).data( 'jqwt-idx' );
            const da = self.$( self.$( tra ).find( 'td' )[idx] ).find( 'p' ).data( 'app-date' );
            const db = self.$( self.$( trb ).find( 'td' )[idx] ).find( 'p' ).data( 'app-date' );
            return da.localeCompare( bb );
        },
        // compare lastConnection dates
        compareDateConnection( tra, trb ){
            return self.APP.compareDate( tra, trb, 'lastconnection' );
        },
        */
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
                u.attributedRoles.set( Roles.directRolesForUser( u, { anyScope: true }));
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

Template.AccountsList.onRendered( function(){
    const self = this;

    //self.AL.table = new jqTable.DataTable( '.AccountsList table.jq-table' );
});

Template.AccountsList.helpers({

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // list known accounts
    itemsList(){
        return Template.instance().AL.accounts.list.get();
    },

    // whether connection is allowed
    itAllowedChecked( it ){
        return it.isAllowed ? 'checked' : '';
    },

    // disable the 'isAllowed' checkbox for the current user (should be checked anyway) -> prevent to be able to disable himself
    itAllowedDisabled( it ){
        return it._id === Meteor.userId() ? 'disabled' : '';
    },

    // whether API access is allowed
    itApiAllowedChecked( it ){
        return it.apiAllowed ? 'checked' : '';
    },

    itApiAllowedDisabled( it ){
        return '';
    },

    // whether the delete button can be enabled
    // As of 2023- 2- 9, the rule is : "LET THE MANAGER DO WHAT HE WANTS"
    //  but not delete himself!
    itDeleteDisabled( it ){
        const userId = Meteor.userId();
        //return userId && userId !== it._id && alRoles.userIsInRole( userId, 'ACCOUNT_DELETE' ) ? '' : 'disabled';
    },

    // delete button title
    itDeleteTitle( it ){
        //return pwixI18n.label( I18N, 'accounts.manager.delete_btn', Template.instance().APP.email( it ));
    },

    // whether the edit button is enabled
    //  always true if the user has ad-hoc permissions
    itEditDisabled( it ){
        //return Meteor.userId() && alRoles.userIsInRole( Meteor.userId(), 'ACCOUNT_CRU' ) ? '' : 'disabled';
     },
 
    // edit button title
    itEditTitle( it ){
        //return pwixI18n.label( I18N, 'accounts.manager.edit_btn', Template.instance().APP.email( it ));
    },

    // first email address
    itEmail( it ){
        return it.emails[0].address;
    },

    // last connection date
    itLastConnectionDate( it ){
        const lastConnection = it ? it.lastConnection || null : null;
        return lastConnection ? lastConnection.toISOString().substring( 0, 10 ) : '0000-00-00';
    },

    // last connection date
    itLastConnectionLabel( it ){
        //return Meteor.APP.Date.toString( it.lastConnection, { format: '%Y-%m-%d %H:%M' });
    },

    // display the list of roles, most top first
    itRolesLabel( it ){
        //return CoreApp.DOM.ellipsizeLine( Template.instance().$( '.c-accounts-tab th[data-jqwt-name="roles"]' ), it.attributedRoles.get().join( ', ' ));
    },

    // roles button title
    itRolesTitle( it ){
        //return pwixI18n.label( I18N, 'accounts.manager.roles_btn', Template.instance().APP.email( it ));
    },

    // whether the email address has been verified
    // disable the checkbox for the current user (should be checked anyway) -> prevent to be able to disable himself
    itVerified( it ){
        //return it.emails[0].verified ? 'checked' : '';
    },

    // disable the checkbox for the current user (should be checked anyway) -> prevent to be able to disable himself
    itVerifiedDisabled( it ){
        //return it._id === Meteor.userId() && it.emails[0].verified ? 'disabled' : '';
    },

    // verify mail button is disabled ?
    itVerifyDisabled( it ){
        //return it.emails[0].verified ? 'disabled' : '';
    },

    // verify mail button title
    itVerifyTitle( it ){
        //return pwixI18n.label( I18N, 'accounts.manager.verify_resend', Template.instance().APP.email( it ));
    },

    // miButton parameters
    parmsModalInfo( it ){
        /*
        return {
            titleButton: pwixI18n.label( I18N, 'modalinfo.button_record_title' ),
            titleDialog: pwixI18n.label( I18N, 'modalinfo.dialog_title' ),
            mdClassesContent: Meteor.APP.Pages.current.page().get( 'theme' ),
            name: it.emails[0].address,
            object: it,
            classButton: 'btn-sm btn-outline-primary'
        }
        */
    },

    // when displaying a notes indicator
    parmsNotes( it ){
        return {
            item: it
        };
    },

    selector(){
        return {};
    }
});

Template.AccountsList.events({
});
