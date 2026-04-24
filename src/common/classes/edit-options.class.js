/*
 * pwix:accounts-manager/src/common/classes/edit-options.class.js
 *
 * This class manages the edition configuration options of the amAccount class.
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { Options } from 'meteor/pwix:options';

const logger = Logger.get();

export class EditOptions extends Options.Base {

    // static data
    //

    static _defaults = {
        closeAfterNew: true,
        identTopTemplate: null,
        tabsFn: null,
        withGlobalRoles: true,
        withScopedRoles: true
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
     * @returns {EditOptions}
     */
    constructor( options={} ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'EditOptions.EditOptions()', arguments );
        super( options );
        return this;
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the edit dialog should be closed after new account creation
     * @returns {Boolean}
     */
    closeAfterNew( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'EditOptions.closeAfterNew()', arguments );
        return this.base_gsBoolFn( 'closeAfterNew', value, { default: EditOptions._defaults.closeAfterNew });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the name of the top template to be inserted
     * @returns {String}
     */
    identTopTemplate( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'EditOptions.identTopTemplate()', arguments );
        return this.base_gsStringFn( 'identTopTemplate', value, { default: EditOptions._defaults.identTopTemplate });
    }

    /**
     * Getter/Setter
     * @param {Function} value a function to update the list of edition tabs
     * @returns {Function}
     */
    tabsFn( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'EditOptions.tabsFn()', arguments );
        return this.base_gsFn( 'tabsFn', value, { default: EditOptions._defaults.tabsFn });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the roles panel of the edit dialog displays global roles
     * @returns {Boolean}
     */
    withGlobalRoles( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'EditOptions.withGlobalRoles()', arguments );
        return this.base_gsBoolFn( 'withGlobalRoles', value, { default: EditOptions._defaults.withGlobalRoles });
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the roles panel of the edit dialog displays global roles
     * @returns {Boolean}
     */
    withScopedRoles( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'EditOptions.withScopedRoles()', arguments );
        return this.base_gsBoolFn( 'withScopedRoles', value, { default: EditOptions._defaults.withScopedRoles });
    }
}
