/*
 * pwix:accounts-manager/src/common/classes/am-transforms.js
 *
 * Transformation functions.
 */

import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

export const amTransforms = {

    // add global and scoped roles to every user
    // used in publications only
    async transformRoles( acInstance, itemDoc, options={}, userId ){
        if( Package['pwix:roles'] ){
            const roles = await Package['pwix:roles'].Roles.allRolesForUser( itemDoc, userId );
            itemDoc.DYN.roles = roles;
        }
        return itemDoc;
    }
};
