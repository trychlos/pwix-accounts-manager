/*
 * pwix:accounts-manager/src/common/classes/private/am-class-checks.js
 */

const assert = require( 'assert' ).strict;
import validator from 'email-validator';

import { pwixI18n } from 'meteor/pwix:i18n';
import { TM } from 'meteor/pwix:typed-message';

import { amClass } from '../am-class.class.js';

// fields check
//  - value: mandatory, the value to be tested
//  - data: optional, the data passed to Checker instanciation
//    > item: the target item as a ReactiveVar, i.e. the item to be updated with this value
//    > amInstance: the amClass instance
//  - opts: an optional behaviour options, with following keys:
//    > update: whether the item be updated with the value, defaults to true
//    > id: the identifier of the edited row when editing an array
// returns a TypedMessage, or an array of TypedMessage, or null

// item is a ReactiveVar which contains the edited record
const _assert_data_itemrv = function( caller, data ){
    assert.ok( data, caller+' data required' );
    assert.ok( data.item, caller+' data.item required' );
    assert.ok( data.item instanceof ReactiveVar, caller+' data.item expected to be a ReactiveVar' );
    assert.ok( data.amInstance, caller+' data.amInstance required' );
    assert.ok( data.amInstance instanceof amClass, caller+' data.amInstance expected to be an instance of amClass' );
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

export const amClassChecks = {

    async email_address( value, data, opts ){
        console.debug( 'email_address', arguments );
        _assert_data_itemrv( 'amClassChecks.email_address()', data );
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
        return data.amInstance.byEmailAddress( value )
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
    },

    async email_label( value, data, opts ){
        _assert_data_itemrv( 'amClassChecks.email_label()', data );
        const item = data.item.get();
        const index = opts.id ? _id2index( item.emails, opts.id ) : -1;
        if( opts.update !== false ){
            if( index < 0 ){
                item.emails = item.emails || [];
                item.emails.push({ id: opts.id });
                index = 0;
            }
            item.emails[index].label = value;
        }
        return null;
    },

    async email_verified( value, data, opts ){
        _assert_data_itemrv( 'amClassChecks.email_verified()', data );
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
    },

    // loginAllowed
    //  emit a warning when the user is about to disallow himself
    //  this should nonetheless be prohibited by the UI
    async loginAllowed( value, data, opts ){
        _assert_data_itemrv( 'amClassChecks.loginAllowed()', data );
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
    },

    async username( value, data, opts ){
        _assert_data_itemrv( 'amClassChecks.username()', data );
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
        return data.amInstance.byUsername( value )
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
    }
};
