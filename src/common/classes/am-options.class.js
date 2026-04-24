/*
 * pwix:accounts-manager/src/common/classes/am-options.class.js
 *
 * This class manages the global configuration options of the amAccount class.
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

export class amOptions extends AccountsCore.Options {

    // static data
    //

    static _defaults = {
        editCloseAfterNew: true,
        editIdentTopTemplate: null,
        editTabsFn: null,
        feedNow: true,
        listActiveCheckboxes: false,
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
        logger.warning( '\'editCloseAfterNew\' instanciation option is deprecated starting with v2.5 in favor of setupEditor({ \'closeAfterNew\' }). You should update your code.' );
        return this.base_gsBoolFn( 'editCloseAfterNew', value, { default: amOptions._defaults.editCloseAfterNew });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the name of the top template to be inserted
     * @returns {String}
     */
    editIdentTopTemplate( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editIdentTopTemplate()', arguments );
        logger.warning( '\'editIdentTopTemplate\' instanciation option is deprecated starting with v2.5 in favor of setupEditor({ \'identTopTemplate\' }). You should update your code.' );
        return this.base_gsStringFn( 'editIdentTopTemplate', value, { default: amOptions._defaults.editIdentTopTemplate });
    }

    /**
     * Getter/Setter
     * @param {Function} value a function to update the list of edition tabs
     * @returns {Function}
     */
    editTabsFn( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editTabsFn()', arguments );
        logger.warning( '\'editTabsFn\' instanciation option is deprecated starting with v2.5 in favor of setupEditor({ \'tabsFn\' }). You should update your code.' );
        return this.base_gsFn( 'editTabsFn', value, { default: amOptions._defaults.editTabsFn });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the roles panel of the edit dialog displays global roles
     * @returns {Boolean}
     */
    editWithGlobalRoles( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editWithGlobalRoles()', arguments );
        logger.warning( '\'editWithGlobalRoles\' instanciation option is deprecated starting with v2.5 in favor of setupEditor({ \'withGlobalRoles\' }). You should update your code.' );
        return this.base_gsBoolFn( 'editWithGlobalRoles', value, { default: amOptions._defaults.editWithGlobalRoles });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the roles panel of the edit dialog displays global roles
     * @returns {Boolean}
     */
    editWithScopedRoles( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.editWithScopedRoles()', arguments );
        logger.warning( '\'editWithScopedRoles\' instanciation option is deprecated starting with v2.5 in favor of setupEditor({ \'withScopedRoles\' }). You should update your code.' );
        return this.base_gsBoolFn( 'editWithScopedRoles', value, { default: amOptions._defaults.editWithScopedRoles });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the class should immediately subscribe to the `all` publication to feed its internal list
     * @returns {Boolean}
     */
    feedNow( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.feedNow()', arguments );
        return this.base_gsBoolFn( 'feedNow', value, { default: amOptions._defaults.feedNow });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the checkboxes on the AccountsList are active (can be modified online)
     * @returns {Boolean}
     */
    listActiveCheckboxes( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.listActiveCheckboxes()', arguments );
        logger.warning( '\'listActiveCheckboxes\' instanciation option is deprecated starting with v2.5 in favor of setupTabular({ \'activeCheckboxes\' }). You should update your code.' );
        return this.base_gsBoolFn( 'listActiveCheckboxes', value, { default: amOptions._defaults.listActiveCheckboxes });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the class should immediately subscribe to the `all` publication to feed its internal list
     * @returns {Boolean}
     */
    listFeedNow( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'amOptions.listFeedNow()', arguments );
        logger.warning( '\'listFeedNow\' instanciation option is deprecated starting with v2.5 in favor of \'feedNow\'. You should update your code.' );
        return this.feedNow( value );
    }
}
