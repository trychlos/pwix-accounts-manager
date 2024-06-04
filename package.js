Package.describe({
    name: 'pwix:accounts-list',
    version: '0.9.0',
    summary: 'The list part of an accounts manager',
    git: 'https://github.com/trychlos/pwix-accounts-list',
    documentation: 'README.md'
});

Package.onUse( function( api ){
    configure( api );
    api.export([
        'AccountsList'
    ]);
    api.mainModule( 'src/client/js/index.js', 'client' );
    api.mainModule( 'src/server/js/index.js', 'server' );
});

Package.onTest( function( api ){
    configure( api );
    api.use( 'tinytest' );
    api.use( 'pwix:accounts-list' );
    api.mainModule( 'test/js/index.js' );
});

function configure( api ){
    api.versionsFrom([ '3.0-rc.0' ]);
    api.use( 'blaze-html-template@3.0.0-alpha300.0', 'client' );
    api.use( 'ecmascript' );
    api.use( 'less@4.0.0', 'client' );
    api.addFiles( 'src/client/components/AccountsList/AccountsList.js', 'client' );
}
