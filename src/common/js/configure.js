/*
 * pwix:accounts-list/src/common/js/configure.js
 */

import _ from 'lodash';

AccountsList._conf = {};

AccountsList._defaults = {
    verbosity: AccountsList.C.Verbose.CONFIGURE
};

/**
 * @summary Get/set the package configuration
 *  Should be called *in same terms* both by the client and the server.
 * @param {Object} o configuration options
 * @returns {Object} the package configuration
 */
AccountsList.configure = function( o ){
    if( o && _.isObject( o )){
        _.merge( AccountsList._conf, AccountsList._defaults, o );
        // be verbose if asked for
        if( AccountsList._conf.verbosity & AccountsList.C.Verbose.CONFIGURE ){
            //console.log( 'pwix:accounts-list configure() with', o, 'building', AccountsList._conf );
            console.log( 'pwix:accounts-list configure() with', o );
        }
    }
    // also acts as a getter
    return AccountsList._conf;
}

_.merge( AccountsList._conf, AccountsList._defaults );
