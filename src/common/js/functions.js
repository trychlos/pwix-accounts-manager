/*
 * pwix:accounts-manager/src/common/js/functions.js
 */

import _ from 'lodash';

import { AccountsCore } from 'meteor/pwix:accounts-core';
import { AccountsUI } from 'meteor/pwix:accounts-ui';
import { check, Match } from 'meteor/check';
import { Logger } from 'meteor/pwix:logger';

const logger = Logger.get();
