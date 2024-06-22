/*
 * pwix:accounts-manager/src/common/collections/accounts/schema.js
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

// add behaviours to our collection
Meteor.users.attachSchema( AccountsManager.fieldsSet.toSchema());
Meteor.users.attachBehaviour( 'timestampable' );

// extends the above default schema with an application-provided piece
const fieldsSet = AccountsManager._conf.fieldsSet;
if( fieldsSet ){
    if( typeof fieldsSet === 'function' ){
        const o = fieldsSet();
        check( o, Forms.FieldsSet );
        Meteor.users.attachSchema( new SimpleSchema( o ));
    } else if( fieldsSet instanceof Forms.FieldsSet ){
        Meteor.users.attachSchema( new SimpleSchema( schema ));
    } else {
        console.error( 'expected a function or a FieldsSet, found', fieldsSet );
    }
}
