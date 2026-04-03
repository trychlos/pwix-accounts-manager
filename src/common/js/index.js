/*
 * pwix:accounts-manager/src/common/js/index.js
 */

import { amAccount } from '../classes/am-account.class';
import { amOptions } from '../classes/am-options.class';

import { amChecks } from '../helpers/am-checks';
import { amFielddef } from '../helpers/am-fielddef.js';
import { amTabular } from '../helpers/am-tabular';
import { amTransforms } from '../helpers/am-transforms';

import './global.js';
import './constants.js';
import './i18n.js';
import './configure.js';
//
import './functions.js';
import './ready.js';

AccountsManager.Account = amAccount;
AccountsManager.Checks = amChecks;
AccountsManager.Fielddef = amFielddef;
AccountsManager.Options = amOptions;
AccountsManager.Tabular = amTabular;
AccountsManager.Transforms = amTransforms;
