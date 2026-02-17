/*
 * pwix:accounts-manager/src/common/js/configure.js
 *
 * The configuration needs to be reactive as fieldset depends of configured additional fields, and tabular and schema both depend of fieldset.
 */

import _ from 'lodash';

import { ReactiveVar } from 'meteor/reactive-var';

let _conf = {};
AccountsManager._conf = new ReactiveVar( _conf );

AccountsManager._defaults = {
    classes: '',
    datetime: '%Y-%m-%d %H:%M:%S',
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
        // check that keys exist
        let built_conf = {};
        Object.keys( o ).forEach(( it ) => {
            if( Object.keys( AccountsManager._defaults ).includes( it )){
                built_conf[it] = o[it];
            } else {
                console.warn( 'pwix:accounts-manager configure() ignore unmanaged key \''+it+'\'' );
            }
        });
        if( Object.keys( built_conf ).length ){
            _conf = _.merge( AccountsManager._defaults, _conf, built_conf );
            AccountsManager._conf.set( _conf );
            // be verbose if asked for
            if( _conf.verbosity & AccountsManager.C.Verbose.CONFIGURE ){
                //console.log( 'pwix:accounts-manager configure() with', o, 'building', AccountsList._conf );
                console.log( 'pwix:accounts-manager configure() with', built_conf );
            }
        }
    }
    // also acts as a getter
    return AccountsManager._conf.get();
}

_conf = _.merge( {}, AccountsManager._defaults );
AccountsManager._conf.set( _conf );
