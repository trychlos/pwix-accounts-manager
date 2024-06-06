Package.describe({
    name: 'pwix:accounts-manager',
    version: '0.9.0-rc',
    summary: 'Provide the most common parts of a simple accounts management system',
    git: 'https://github.com/trychlos/pwix-accounts-manager',
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
    api.use( 'pwix:accounts-manager' );
    api.mainModule( 'test/js/index.js' );
});

function configure( api ){
    api.versionsFrom([ '2.9.0', '3.0-rc.0' ]);
    api.use( 'aldeed:tabular@3.0.0-rc' );
    api.use( 'blaze-html-templates@2.0.0 || 3.0.0-alpha300.0', 'client' );
    api.use( 'ecmascript' );
    api.use( 'less@4.0.0', 'client' );
    api.use( 'mongo' );
    api.use( 'pwix:i18n@1.5.7' );
    api.addFiles( 'src/client/components/AccountsList/AccountsList.js', 'client' );
}
