/*
 * pwix:accounts-manager/src/server/js/check_npms.js
 */

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

if( false ){
    // whitelist packages which are included via a subfolder or badly recognized
}

checkNpmVersions({
    'lodash': '^4.17.0',
    'strftime': '^0.10.2'
},
    'pwix:accounts-manager'
);
