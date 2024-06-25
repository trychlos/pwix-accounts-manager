/*
 * pwix:accounts-manager/src/common/collections/accounts/checks.js
 */

const assert = require( 'assert' ).strict;
import validator from 'email-validator';

import { pwixI18n } from 'meteor/pwix:i18n';
import { Roles } from 'meteor/pwix:roles';
import { TM } from 'meteor/pwix:typed-message';

AccountsManager.checks = {};

AccountsManager.checks.canDelete = async function( userId ){
    return await Roles.userIsInRoles( userId, AccountsManager.configure().roles.delete );
};

AccountsManager.checks.canEdit = async function( userId ){
    return await Roles.userIsInRoles( userId, AccountsManager.configure().roles.edit );
};

// fields check
//  - value: mandatory, the value to be tested
//  - data: optional, the data passed to Checker instanciation
//    if set the target item as a ReactiveVar, i.e. the item to be updated with this value
//  - opts: an optional behaviour options, with following keys:
//    > update: whether the item be updated with the value, defaults to true
//    > id: the identifier of the edited row when editing an array
// returns a TypedMessage, or an array of TypedMessage, or null

// item is a ReactiveVar which contains the edited record
const _assert_data_itemrv = function( caller, data ){
    assert.ok( data, caller+' data required' );
    assert.ok( data.item, caller+' data.item required' );
    assert.ok( data.item instanceof ReactiveVar, caller+' data.item expected to be a ReactiveVar' );
}

// returns the index of the identified row in the array
const _id2index = function( array, id ){
    for( let i=0 ; i<array.length ; ++i ){
        if( array[i].id === id ){
            return i;
        }
    }
    console.warn( 'id='+id+' not found' );
    return -1;
}

AccountsManager.checks.check_email_address = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.check_email_address()', data );
    console.debug( 'check_email_address', arguments );
    let item = data.item.get();
    const index = opts.id ? _id2index( item.emails, opts.id ) : -1;
    if( opts.update !== false ){
        if( index < 0 ){
            item.emails = item.emails || [];
            item.emails.push({ id: opts.id });
            index = 0;
        }
        item.emails[index].address = value;
    }
    if( !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'check.email_unset' )
        });
    }
    if( !validator.validate( value )){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'check.email_invalid' )
        });
    }
    return AccountsTools.byEmail( value )
        .then(( user ) => {
            let ok = false;
            if( user ){
                // we have found a user
                ok = user._id === item._id;
            } else {
                ok = true;
            }
            return ok ? null : new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'accounts.check.email_exists' )
            });
        });
};

AccountsManager.checks.check_email_verified = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.check_email_verified()', data );
    const item = data.item.get();
    const index = opts.id ? _id2index( item.emails, opts.id ) : -1;
    if( opts.update !== false ){
        if( index < 0 ){
            item.emails = item.emails || [];
            item.emails.push({ id: opts.id });
            index = 0;
        }
        item.emails[index].verified = value;
    }
    return null;
}


// loginAllowed
//  emit a warning when the user is about to disallow himself
//  this should nonetheless be prohibited by the UI
AccountsManager.checks.check_loginAllowed = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.check_loginAllowed()', data );
    const item = data.item.get();
    if( opts.update !== false ){
        item.loginAllowed = value;
    }
    if( Meteor.userId() === item._id ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.WARNING,
            message: pwixI18n.label( I18N, 'accounts.check.login_disallow_himself' )
        });
    }
    return null;
};

AccountsManager.checks.check_username = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.check_username()', data );
    const item = data.item.get();
    if( opts.update !== false ){
        item.username = value;
    }
    return AccountsTools.byUsername( value )
        .then(( user ) => {
            let ok = false;
            if( user ){
                // we have found a user
                ok = user._id === item._id;
            } else {
                ok = true;
            }
            return ok ? null : new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'accounts.check.username_exists' )
            });
        });
};

/*

import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';

// check functions to be able to use a FormChecker in the UI
export const AccountsChecks = {
    async check_apiAllowed( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item.apiAllowed = value;
        }
        return Promise.resolve( null );
    },

    async check_isAllowed( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item.isAllowed = value;
        }
        return Promise.resolve( null );
    },

    async check_email( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item = data.item || {};
            data.item.emails = data.item.emails || [];
            data.item.emails[0] = data.item.emails[0] || {};
            data.item.emails[0].address = value;
        }
        return Promise.resolve( null )
            .then(() => {
                if( !value ){
                    return new CoreApp.TypedMessage({
                        type: CoreApp.MessageType.C.ERROR,
                        message: pwixI18n.label( I18N, 'accounts.check.email_unset' )
                    });
                } else if( !validator.validate( value )){
                    return new CoreApp.TypedMessage({
                        type: CoreApp.MessageType.C.ERROR,
                        message: pwixI18n.label( I18N, 'accounts.check.email_invalid' )
                    });
                } else {
                    return Meteor.callPromise( 'account.byEmail', value )
                        .then(( user ) => {
                            let ok = false;
                            if( user ){
                                // we have found a user
                                ok = user._id === data.item._id;
                            } else {
                                ok = true;
                            }
                            return ok ? null : new CoreApp.TypedMessage({
                                type: CoreApp.MessageType.C.ERROR,
                                message: pwixI18n.label( I18N, 'accounts.check.email_exists' )
                            });
                        });
                }
            });
    },

    async check_verified( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item = data.item || {};
            data.item.emails = data.item.emails || [];
            data.item.emails[0] = data.item.emails[0] || {};
            data.item.emails[0].verified = value;
        }
        return Promise.resolve( null );
    }
}
*/
