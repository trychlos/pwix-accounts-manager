/*
 * pwix:accounts-manager/src/server/js/transforms.js
 *
 * Transformation functions.
 */

import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

AccountsManager.Transforms = {

    // add global and scoped roles to every user
    // used in publications only
    // see options.source for the calling publication
    async transformRoles( acInstance, itemDoc, options, userId ){
        if( Package['pwix:roles'] ){
            const roles = await Package['pwix:roles'].Roles.getUserRoles( itemDoc, userId );
            itemDoc.DYN.roles = roles;
        }
        return itemDoc;
    }
};
