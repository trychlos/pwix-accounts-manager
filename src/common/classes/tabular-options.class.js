/*
 * pwix:accounts-manager/src/common/classes/tabular-options.class.js
 *
 * This class manages the tabular configuration options of the amAccount class.
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { Options } from 'meteor/pwix:options';

import '../js/global.js';
import '../js/constants.js';

const logger = Logger.get();

export class TabularOptions extends Options.Base {

    // static data
    //

    static _defaults = {
        activeCheckboxes: false,
        pub: AccountsManager.C.pub.tabular.name
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
     * @returns {TabularOptions}
     */
    constructor( options={} ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'TabularOptions.TabularOptions()', arguments );
        super( options );
        return this;
    }

    /**
     * Getter/Setter
     * @param {Boolean|Function} value whether the checkboxes on the AccountsList are active (can be modified online)
     * @returns {Boolean}
     */
    activeCheckboxes( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'TabularOptions.activeCheckboxes()', arguments );
        return this.base_gsBoolFn( 'activeCheckboxes', value, { default: TabularOptions._defaults.activeCheckboxes });
    }

    /**
     * Getter/Setter
     * @param {String|Function} value the publication name for the tabular display
     * @returns {Boolean}
     */
    pub( value ){
        logger.verbose({ verbosity: AccountsManager.configure().verbosity, against: AccountsManager.C.Verbose.FUNCTIONS }, 'TabularOptions.pub()', arguments );
        return this.base_gsStringFn( 'pub', value, { default: TabularOptions._defaults.pub });
    }
}
