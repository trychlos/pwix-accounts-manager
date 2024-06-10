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
});

Template.AccountsList.events({
});
