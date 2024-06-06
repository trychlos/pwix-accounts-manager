/*
 * pwix:accounts-manager/src/common/js/configure.js
 */

import _ from 'lodash';

AccountsManager._conf = {};

AccountsManager._defaults = {
    verbosity: AccountsManager.C.Verbose.CONFIGURE
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
AccountsManager.configure = function( o ){
    if( o && _.isObject( o )){
        _.merge( AccountsManager._conf, AccountsManager._defaults, o );
        // be verbose if asked for
        if( AccountsManager._conf.verbosity & AccountsManager.C.Verbose.CONFIGURE ){
            //console.log( 'pwix:accounts-manager configure() with', o, 'building', AccountsList._conf );
            console.log( 'pwix:accounts-manager configure() with', o );
        }
    }
    // also acts as a getter
    return AccountsManager._conf;
}

_.merge( AccountsManager._conf, AccountsManager._defaults );
