/*
 * pwix:accounts-manager/src/common/js/i18n.js
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import '../i18n/en.js';
pwixI18n.namespace( I18N, 'en', AccountsList.i18n.en );

//import '../i18n/fr_FR.js';
//pwixI18n.namespace( I18N, 'fr', Roles.i18n.fr_FR );

/**
 * @locus Anywhere
 * @returns {String} the i18n namespace of this package
 */
AccountsList.i18n.namespace = function(){
    return I18N;
}
