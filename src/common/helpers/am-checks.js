/*
 * pwix:accounts-manager/src/common/helpers/am-checks.js
 */

import { strict as assert } from 'node:assert';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { TM } from 'meteor/pwix:typed-message';

import { amAccount } from '../classes/am-account.class.js';

const logger = Logger.get();

// fields check
//  - value: mandatory, the value to be tested
//  - data: optional, the data passed to Checker instanciation
//    > item: the target item as a ReactiveVar, i.e. the item to be updated with this value
//    > amInstance: the amAccount instance
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
    assert.ok( data.amInstance instanceof amAccount, caller+' data.amInstance expected to be an instance of amAccount' );
}

// returns the index of the identified row in the array
const _id2index = function( array, id ){
    for( let i=0 ; i<array.length ; ++i ){
        if( array[i]._id === id ){
            return i;
        }
    }
    logger.warn( 'id='+id+' not found' );
    return -1;
}

export const amChecks = {
    // check that an identity is OK
    async ident_cross_check( data, opts ){
        _assert_data_itemrv( 'amChecks.email_address()', data );
        const item = data.item.get();
        const errs = [];
        // check email(s) count
        const emailMin = data.amInstance.emailMinCount();
        const emailMax = data.amInstance.emailMaxCount();
        let emailCount = 0;
        for( const it of ( item.emails || [] )){
            if( it.address ){
                emailCount += 1;
            }
        }
        if( emailCount < emailMin ){
            errs.push( new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.email_min', emailMin, emailCount )
            }));
        }
        if( emailCount > emailMax ){
            errs.push( new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.email_max', emailMax, emailCount )
            }));
        }
        // check username(s) count
        const usernameMin = data.amInstance.usernameMinCount();
        const usernameMax = data.amInstance.usernameMaxCount();
        let usernameCount = 0;
        if( item.username ){
            usernameCount += 1;
        }
        for( const it of ( item.usernames || [] )){
            if( it.username ){
                usernameCount += 1;
            }
        }
        if( usernameCount < usernameMin ){
            errs.push( new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.username_min', usernameMin, usernameCount )
            }));
        }
        if( usernameCount > usernameMax ){
            errs.push( new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.username_max', usernameMax, usernameCount )
            }));
        }
        return errs.length ? errs: null;
    },

    // email address must not only be a unique email address but also must be unique among usernames namespace
    // rationale: someone with bad intentions could spoof an email address by entering it as a username
    async email_address( value, data, opts ){
        //logger.debug( 'amChecks.email_addres()', arguments );
        _assert_data_itemrv( 'amChecks.email_address()', data );
        let item = data.item.get();
        let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
        if( opts.update !== false ){
            if( index < 0 ){
                item.emails = item.emails || [];
                item.emails.push({ _id: opts.rowId });
                index = 0;
            }
            item.emails[index].address = value;
        }
        // let AccountsCore check for syntax validity but not existance
        const result = await AccountsCore.Checks.checkEmailAddress( data.amInstance, value, { testExists: false });
        if( !result.ok ){
            const errs = [];
            for( const err of result.errors ){
                errs.push( new TM.TypedMessage({
                    level: TM.MessageLevel.C.ERROR,
                    message: err
                }));
            }
            //logger.debug( errs );
            return errs;
        }
        // and check that this is an identifier for both email addresses and usernames too
        let user = await data.amInstance.byEmailAddress( value );
        if( user && user._id !== item._id ){
            const errs = new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.email_exists' )
            });
            logger.debug( errs );
            return errs;
        }
        user = await data.amInstance.byUsername( value );
        if( user && user._id !== item._id ){
            const errs = new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.email_exists' )
            });
            logger.debug( errs );
            return errs;
        }
        return null;
    },

    async email_label( value, data, opts ){
        _assert_data_itemrv( 'amChecks.email_label()', data );
        const item = data.item.get();
        let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
        if( opts.update !== false ){
            if( index < 0 ){
                item.emails = item.emails || [];
                item.emails.push({ _id: opts.rowId });
                index = 0;
            }
            item.emails[index].label = value;
        }
        return null;
    },

    // must have at most one
    async email_preferred( value, data, opts ){
        _assert_data_itemrv( 'amChecks.email_preferred()', data );
        const item = data.item.get();
        let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
        if( opts.update !== false ){
            if( index < 0 ){
                item.emails = item.emails || [];
                item.emails.push({ _id: opts.rowId });
                index = 0;
            }
            item.emails[index].preferred = Boolean( value );
        }
        // count preferred emails
        let count = 0;
        for( const it of item.emails ){
            if( it.preferred ){
                count += 1;
            }
        }
        if( count > 1 ){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.email_preferred' )
            });
        }
        return null;
    },

    async email_verified( value, data, opts ){
        _assert_data_itemrv( 'amChecks.email_verified()', data );
        const item = data.item.get();
        let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
        if( opts.update !== false ){
            if( index < 0 ){
                item.emails = item.emails || [];
                item.emails.push({ _id: opts.rowId });
                index = 0;
            }
            item.emails[index].verified = Boolean( value );
        }
        return null;
    },

    // loginAllowed
    //  emit a warning when the user is about to disallow himself
    //  this should nonetheless be prohibited by the UI
    async loginAllowed( value, data, opts ){
        _assert_data_itemrv( 'amChecks.loginAllowed()', data );
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

    // email addresses and usernames must be unique in common namespace
    async username( value, data, opts ){
        _assert_data_itemrv( 'amChecks.username()', data );
        const item = data.item.get();
        if( opts.update !== false ){
            item.username = value;
        }
        // let AccountsCore check for validity and existance
        const result = await AccountsCore.Checks.checkUsername( data.amInstance, value, { testExists: false });
        if( !result.ok ){
            const errs = [];
            for( const err of result.errors ){
                errs.push( new TM.TypedMessage({
                    level: TM.MessageLevel.C.ERROR,
                    message: err
                }));
            }
            return errs;
        }
        // and check that this is an identifier for both email addresses and usernames too
        let user = await data.amInstance.byEmailAddress( value );
        if( user && user._id !== item._id ){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.username_exists' )
            });
        }
        user = await data.amInstance.byUsername( value );
        if( user && user._id !== item._id ){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'check.username_exists' )
            });
        }
        return null;
    }
};
