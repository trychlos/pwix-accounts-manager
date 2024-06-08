/*
 * pwix:accounts-manager/src/common/collections/accounts/accounts.js
 *
 * Source:
 *  https://guide.meteor.com/accounts.html
 *  https://docs.meteor.com/api/accounts.html
 *
 * Thanks to the accounts-base package, Meteor automagically creates a 'users' collection. The document created defaults to be:
 * 
 *  {
 *      _id: 'oDTZ93Dr3TyRKgeaF',
 *      services: {
 *        password: {
 *          bcrypt: '$2b$10$C8brjVoSZhl4phmV7KJGGeKP3az9bd7YB4i5xpyIE172D5RWrmjJ6'
 *        },
 *        resume: {
 *          loginTokens: [
 *            {
 *              when: ISODate('2024-06-03T15:42:20.849Z'),
 *              hashedToken: '+g9yq6RdL1jMrYVSDXmVhLIDfS2IVtUdBVHC6A63jjs='
 *            },
 *            {
 *              when: ISODate('2024-06-03T15:42:43.305Z'),
 *              hashedToken: 'ACQ/4Z8WSevPzDLo9ix6GZ+SLZgTO9qK4Yf0TDdPX7Q='
 *            }
 *          ]
 *        },
 *        email: { verificationTokens: [] }
 *      },
 *      emails: [ { address: 'aaaa@aaa.aa', verified: false } ],
 *    }
 * 
 * We define here the desired schema.
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';

// define the schema without taking care of added behaviours
// Meteor base Accounts already (and only) defines emails, username, profile and services
AccountsManager.schema = new SimpleSchema({
    _id: {
        type: String
    },
    emails: {
        type: Array,
        optional: true
    },
    'emails.$': {
        type: Object
    },
    'emails.$.address': {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
    },
    'emails.$.verified': {
        type: Boolean
    },
    username: {
        type: String,
        optional: true
    },
    createdAt: {
        type: Date,
    },
    profile: {
        type: Object,
        optional: true,
        blackbox: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    lastConnection: {
        type: Date
    },
    loginAllowed: {
        type: Boolean,
        defaultValue: true
    },
    apiAllowed: {
        type: Boolean,
        defaultValue: false
    },
    userNotes: {
        type: String
    },
    adminNotes: {
        type: String
    }
});

// add behaviours to our collection
Meteor.users.attachSchema( AccountsManager.schema );
Meteor.users.attachBehaviour( 'timestampable' );

/*
import validator from 'email-validator';

import { Accounts } from 'meteor/accounts-base';
import { CoreApp } from 'meteor/pwix:core-app';
import { Mongo } from 'meteor/mongo';
import { pwixI18n } from 'meteor/pwix:i18n';

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

    async check_username( value, data, coreApp={} ){
        if( coreApp.update !== false ){
            data.item.username = value;
        }
        return Promise.resolve( null )
            .then(() => {
                if( value ){
                    return Meteor.callPromise( 'account.byUsername', value )
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
                                message: pwixI18n.label( I18N, 'accounts.check.username_exists' )
                            });
                        });
                }
                return null;
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
