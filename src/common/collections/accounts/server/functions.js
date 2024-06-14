/*
 * pwix:accounts-manager/src/common/collections/accounts/server/functions.js
 *
 * Server-only functions
 */

AccountsManager.server = {};

AccountsManager.server.removeAccount = async function( id, userId ){
    let ret = null;
    if( !await AccountsManager.checks.canDelete( userId )){
        throw new Meteor.Error(
            'AccountsManager.check.canDelete',
            'Unallowed to remove "'+id+'" account' );
    }
    try {
        ret = await Meteor.users.removeAsync({ _id: id });
    } catch( e ){
        throw new Meteor.Error(
            'AccountsManager.server.removeAccount',
            'Unable to remove "'+id+'" account' );
    }
    return ret;
};

/*
// Server-side: this is a pre-create user, though an _id is already defined
Accounts.onCreateUser(( opts, user ) => {
    console.log( 'Accounts.onCreateUser: opts=%o, user=%o', opts, user );
    user.isAllowed = true;
    user.apiAllowed = false;
    user.createdAt = new Date();
    user.createdBy = Meteor.userId() || user._id;
    return user;
});

// Server-side: validating the new user creation in Accounts collection
Accounts.validateNewUser(( user ) => {
    console.log( 'Accounts.validateNewUser: user=%o', user );
    new SimpleSchema({
        _id: { type: String },
        username: { type: String, optional: true },
        emails: { type: Array },
        'emails.$': { type: Object },
        'emails.$.address': { type: String },
        'emails.$.verified': { type: Boolean },
        createdAt: { type: Date },
        createdBy: { type: String },
        updatedAt: { type: Date, optional: true },
        updatedBy: { type: String, optional: true },
        services: { type: Object, blackbox: true },
        lastConnection: { type: Date, optional: true },
        isAllowed: { type: Boolean },
        apiAllowed: { type: Boolean, defaultValue: false },
        notes: { type: String, optional: true }
    }).validate( user );

    // Return true to allow user creation to proceed
    return true;
});

// https://docs.meteor.com/api/accounts-multi.html#AccountsServer-validateLoginAttempt
Accounts.validateLoginAttempt(( o ) => {
    //console.log( o );
    if( !o.allowed ){
        return false;
    }
    return ( o && o.user ) ? o.user.isAllowed : true;
});
*/
