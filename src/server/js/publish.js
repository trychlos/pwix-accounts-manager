/*
 * pwix:accounts-manager/src/server/js/publish.js
 */

const assert = require( 'assert' ).strict;

import { AccountsHub } from 'meteor/pwix:accounts-hub';

// returns a cursor of all accounts in the collection
Meteor.publish( 'pwix_accounts_manager_accounts_list_all', async function( instanceName ){
    const amInstance = AccountsHub.instances[instanceName];
    if( amInstance && amInstance instanceof AccountsManager.amClass ){
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.list', this.userId, { amInstance: amInstance } )){
            return false;
        }
        return amInstance.collection().find({}, { transform: AccountsHub.cleanupUserDocument });
    } else {
        console.warn( 'pwix_accounts_manager_accounts_list_all unknown or invalid instance name', instanceName );
        return false;
    }
});

/*
 * the publication for the tabular display
 * @param {String} tableName
 * @param {Array} ids: all id's of the Records collection - will be filtered by TenantsList component
 * @param {Object} fields the Mongo mmodifier which select the output fields
 * 
 *  [Arguments] {
 *    '0': 'Tenants',
 *    '1': [ 'Xi4PkJdirWQWALLNx', 'a2YdM4JPwB3wsHpqR' ],
 *    '2': {
 *      label: 1,
 *      entity_notes: 1,
 *      pdmpUrl: 1,
 *      gtuUrl: 1,
 *      legalsUrl: 1,
 *      homeUrl: 1,
 *      supportUrl: 1,
 *      contactUrl: 1,
 *      logoUrl: 1,
 *      logoImage: 1,
 *      supportEmail: 1,
 *      contactEmail: 1,
 *      notes: 1,
 *      entity: 1,
 *      effectStart: 1,
 *      effectEnd: 1,
 *      createdAt: 1,
 *      createdBy: 1,
 *      updatedAt: 1,
 *      updatedBy: 1
 *    }
 *  }
 * 
 * These are the fields from the closest record, plus the entity_notes from the entity,
 *  and with effectStart and effectEnd being from the first and last records.
 */
Meteor.publish( 'pwix_accounts_manager_accounts_tabular', async function( tableName, ids, fields ){
    const amInstance = AccountsManager.amClass.instanceByTabularName( tableName );
    if( amInstance ){
        assert( amInstance instanceof AccountsManager.amClass, 'expects an instance of AccountsManager.amClass, got '+amInstance );
        if( !await AccountsManager.isAllowed( 'pwix.accounts_manager.feat.list', this.userId, { amInstance: amInstance })){
            this.ready();
            return false;
        }

        const self = this;
        const collectionName = amInstance.collectionName();
        let initializing = true;

        // @param {Object} item the Record item
        // @returns {Object} item the transformed item
        const f_transform = async function( item ){
            let promises = [];
            item.DYN = {};
            const fn = amInstance.serverTabularExtend();
            if( fn ){
                await fn( item );
            }
            return item;
        };

        const observer = amInstance.collection().find().observeAsync({
            added: async function( item ){
                const transformed = await f_transform( item );
                self.added( collectionName, item._id, transformed );
            },
            changed: async function( newItem, oldItem ){
                if( !initializing ){
                    const transformed = await f_transform( newItem );
                    self.changed( collectionName, newItem._id, transformed );
                }
            },
            removed: async function( oldItem ){
                self.removed( collectionName, oldItem._id );
            }
        });

        initializing = false;

        self.onStop( function(){
            observer.then(( handle ) => { handle.stop(); });
        });

        self.ready();
    } else {
        console.warn( 'pwix_accounts_manager_accounts_tabular unknown or invalid tabular name', tableName );
        return false;
    }
});
