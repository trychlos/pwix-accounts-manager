/*
 * pwix:accounts-manager/src/common/classes/am-options.class.js
 *
 * This class manages the global configuration options of the amAccount class.
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { Logger } from 'meteor/pwix:logger';
import { Options } from 'meteor/pwix:options';

const logger = Logger.get();

export class amOptions extends AccountsCore.Options {

    // static data
    //

    static _defaults = {
        editCloseAfterNew: true,
        editTabsFn: null,
        editWithGlobalRoles: true,
        editWithScopedRoles: true,
        listFeedNow: true,
    };

    // private data
    //

    // private functions
    //

    // public data
    //

    // public methods
    //

    /**
     * Constructor
     * @param {Object} options the options to be managed
     * 
     * The Options base class takes care of managing the known options, either as a value, or as a function which return a value.
     * In some case where the expected value is a string, the base class also can accept an object with 'i18n' key.
     * All options are accepted as long as the corresponding getter/setter method exists in this derived class.
     * 
     * @returns {amOptions}
     */
    constructor( options ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.amOptions()', arguments );
        super( options );
        return this;
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the edit dialog should be closed after new account creation
     * @returns {Boolean}
     */
    editCloseAfterNew( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editCloseAfterNew()', arguments );
        return this.base_gsBoolFn( 'editCloseAfterNew', value, { default: amOptions._defaults.editCloseAfterNew });
    }

    /**
     * Getter/Setter
     * @param {Function} value a function to update the list of edition tabs
     * @returns {Function}
     */
    editTabsFn( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editTabsFn()', arguments );
        return this.base_gsFn( 'editTabsFn', value, { default: amOptions._defaults.editTabsFn });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the roles panel of the edit dialog displays global roles
     * @returns {Boolean}
     */
    editWithGlobalRoles( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editWithGlobalRoles()', arguments );
        return this.base_gsBoolFn( 'editWithGlobalRoles', value, { default: amOptions._defaults.editWithGlobalRoles });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the roles panel of the edit dialog displays global roles
     * @returns {Boolean}
     */
    editWithScopedRoles( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editWithScopedRoles()', arguments );
        return this.base_gsBoolFn( 'editWithScopedRoles', value, { default: amOptions._defaults.editWithScopedRoles });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the class should immediately subscribe to the `all` publication to feed its internal list
     * @returns {Boolean}
     */
    listFeedNow( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.listFeedNow()', arguments );
        return this.base_gsBoolFn( 'listFeedNow', value, { default: amOptions._defaults.listFeedNow });
    }

    /**
     * Getter/Setter
     * @param {Function} value a function which returns the list of scopes
     * @returns {Function}
     */
    scopesFn( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.scopesFn()', arguments );
        return this.base_gsFn( 'scopesFn', value, { default: amOptions._defaults.scopesFn });
    }
}
