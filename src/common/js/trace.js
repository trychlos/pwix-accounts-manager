/*
 * pwix:accounts-manager/src/common/js/trace.js
 */

_verbose = function( level ){
    if( AccountsManager.configure().verbosity & level ){
        let args = [ ...arguments ];
        args.shift();
        console.debug( ...args );
    }
};

_trace = function( functionName ){
    _verbose( AccountsManager.C.Verbose.FUNCTIONS, ...arguments );
};
