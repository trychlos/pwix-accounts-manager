/*
 * pwix:accounts-manager/src/common/collections/accounts/checks.js
 */

const assert = require( 'assert' ).strict;
import validator from 'email-validator';

import { pwixI18n } from 'meteor/pwix:i18n';
import { TM } from 'meteor/pwix:typed-message';

AccountsManager.checks = {};

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

AccountsManager.checks.email_address = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.email_address()', data );
    //console.debug( 'email_address', arguments );
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
                message: pwixI18n.label( I18N, 'check.email_exists' )
            });
        });
};

AccountsManager.checks.email_verified = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.email_verified()', data );
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
AccountsManager.checks.loginAllowed = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.loginAllowed()', data );
    const item = data.item.get();
    if( opts.update !== false ){
        item.loginAllowed = value;
    }
    if( Meteor.userId() === item._id && !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.WARNING,
            message: pwixI18n.label( I18N, 'check.login_disallow_himself' )
        });
    }
    return null;
};

AccountsManager.checks.username = async function( value, data, opts ){
    _assert_data_itemrv( 'AccountsManager.checks.username()', data );
    const item = data.item.get();
    if( opts.update !== false ){
        item.username = value;
    }
    if( !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'check.username_unset' )
        });
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
                message: pwixI18n.label( I18N, 'check.username_exists' )
            });
        });
};
