Package.describe({
    name: 'pwix:accounts-manager',
    version: '1.1.0',
    summary: 'Provide the most common parts of a simple accounts management system',
    git: 'https://github.com/trychlos/pwix-accounts-manager',
    documentation: 'README.md'
});

Package.onUse( function( api ){
    configure( api );
    api.export([
        'AccountsManager'
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
    api.use( 'aldeed:collection2@4.0.1' );
    api.use( 'aldeed:simple-schema@1.13.1' );
    api.use( 'blaze-html-templates@2.0.0 || 3.0.0-alpha300.0', 'client' );
    api.use( 'check' );
    api.use( 'ecmascript' );
    api.use( 'less@4.0.0', 'client' );
    api.use( 'mongo' );
    api.use( 'pwix:accounts-conf@1.0.0-rc' );
    api.use( 'pwix:accounts-tools@2.1.0-rc' );
    api.use( 'pwix:accounts-ui@1.5.0' );
    api.use( 'pwix:collection-timestampable@2.0.0' );
    api.use( 'pwix:field@1.0.0-rc' );
    api.use( 'pwix:forms@1.0.0-rc' );
    api.use( 'pwix:i18n@1.5.7' );
    api.use( 'pwix:modal@2.0.0' );
    api.use( 'pwix:notes@1.0.0-rc' );
    api.use( 'pwix:plus-button@1.0.0-rc' );
    api.use( 'pwix:tabbed@1.0.0-rc' );
    api.use( 'pwix:tabular@1.0.0-rc' );
    api.use( 'pwix:typed-message@1.2.0' );
    api.use( 'pwix:ui-bootstrap5@2.0.0-rc' );
    api.use( 'pwix:ui-fontawesome6@1.0.0' );
    api.use( 'pwix:ui-utils@1.1.0' );
    api.use( 'random' );
    api.use( 'reactive-dict' );
    api.use( 'reactive-var' );
    api.use( 'tmeasday:check-npm-versions@1.0.2 || 2.0.0-beta.0', 'server' );
    api.use( 'tracker' );
    api.addFiles( 'src/client/components/AccountEditPanel/AccountEditPanel.js', 'client' );
    api.addFiles( 'src/client/components/AccountNewButton/AccountNewButton.js', 'client' );
    api.addFiles( 'src/client/components/AccountsList/AccountsList.js', 'client' );
}
