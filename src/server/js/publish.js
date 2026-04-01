/*
 * pwix:accounts-manager/src/server/js/publish.js
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();

/*
 * the publication for the tabular display
 * @param {String} tableName
 * @param {Array} ids: all id's of the collection
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
 */
Meteor.publish( AccountsManager.C.pub.tabular.name, async function( tableName, ids, fields ){
    check( tableName, Match.NonEmptyString );
    const acInstance = AccountsManager.amAccount.byTabularName( tableName );
    check( acInstance, AccountsManager.amAccount );
    //logger.debug( 'pwix.AccountsManager.p.tabularLast', tableName, ids, fields );

    if( !await AccountsCore.isAllowed( 'pwix.accounts_core.feat.list', this.userId, { instance: acInstance })){
        this.ready();
        return false;
    }

    const self = this;
    const collectionName = acInstance.opts().collection();
    let initializing = true;

    // @param {Object} item the Record item
    // @returns {Object} item the transformed item
    const f_transform = async function( item ){
        const transforms = acInstance.transformsPublish( AccountsManager.C.pub.tabular.name );
        for( const fn of transforms ){
            item = await fn( acInstance, item, {}, self.userId );
        }
        return item;
    };

    const observer = acInstance.collection().find().observeAsync({
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
});
